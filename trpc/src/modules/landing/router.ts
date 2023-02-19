import { TRPCError } from "@trpc/server"
import { router } from "../../initTRPC"
import { publicProcedure } from "../../procedures"
import { z } from "zod"
import { db } from "../../lib/db"
import { redis } from "../../lib/redis"
import { redisLib } from "../shared/redis/client"
import { sendSMS } from "../../lib/sms"
import {
	encodeAccessToken,
	encodeAccountCreationToken,
	decodeAccountCreationToken,
} from "../auth/jwt"
import constants from "./constants"
import messages from "./messages"
import keys from "./keys"
// todo - extract redis logic to separate files and design system for error messages
//! also limit otp sends and verifications to certain number per day by ip address
const landingRouter = router({
	sendOTP: publicProcedure
		.input(
			z.object({
				phoneNumber: z.number(),
			})
		)
		.mutation(async ({ input: { phoneNumber } }) => {
			const start = new Date().getSeconds()

			const resendCoolDown = Boolean(await redis.get(keys.resendCoolingDown({ phoneNumber })))

			const secondsElapsed = new Date().getSeconds() - start

			if (resendCoolDown) {
				throw new TRPCError({
					message: messages.RESEND_COOLDOWN_ERROR_MESSAGE,
					code: "TOO_MANY_REQUESTS",
				})
			}

			const OTP = Math.floor(Math.random() * 1000000)
				.toString()
				.padStart(6, "0")

			const phoneNumberE164 = `+${phoneNumber}`

			await Promise.all([
				sendSMS({
					to: phoneNumberE164,
					body: `Your verification code is ${OTP}.`,
				}),
				redis
					.pipeline()
					.setex(keys.OTP({ phoneNumber }), constants.OTP_TTL_SECONDS, OTP)
					.setex(
						keys.resendCoolingDown({ phoneNumber }),
						constants.RESEND_COOLDOWN_SECONDS -
							secondsElapsed -
							constants.RESEND_COOLDOWN_NETWORK_GRACE_TIME,
						1
					)
					.exec(),
			])
		}),
	verifyOTP: publicProcedure
		.input(
			z.object({
				OTP: z.number(),
				phoneNumber: z.number(),
			})
		)
		.mutation(async ({ input: { OTP, phoneNumber } }) => {
			const storedOTPString = await redis.get(keys.OTP({ phoneNumber }))

			if (!storedOTPString) {
				throw new TRPCError({
					message: messages.OTP_EXPIRED_ERROR_MESSAGE,
					code: "CONFLICT",
				})
			}

			const verificationCoolDown = Boolean(
				await redis.get(keys.verificationCoolingDown({ phoneNumber }))
			)

			if (verificationCoolDown) {
				throw new TRPCError({
					message: messages.OTP_VERIFICATION_COOLDOWN_ERROR_MESSAGE,
					code: "TOO_MANY_REQUESTS",
				})
			}

			if (
				(await redis.incr(keys.verificationAttempts({ phoneNumber }))) >=
				constants.OTP_VERIFICATIONS_BEFORE_COOLDOWNS
			) {
				redis.setex(
					keys.verificationCoolingDown({ phoneNumber }),
					constants.OTP_VERIFICATION_COOLDOWN_SECONDS,
					1
				)
			}

			redis.expire(
				keys.verificationAttempts({ phoneNumber }),
				constants.OTP_VERIFICATION_ATTEMPTS_TTL_SECONDS
			)

			const storedOTP = parseInt(storedOTPString)

			if (storedOTP !== OTP) {
				throw new TRPCError({
					message: messages.INVALID_OTP_ERROR_MESSAGE,
					code: "BAD_REQUEST",
				})
			}

			redis.del([
				keys.OTP({ phoneNumber }),
				keys.resendCoolingDown({ phoneNumber }),
				keys.verificationAttempts({ phoneNumber }),
				keys.verificationCoolingDown({ phoneNumber }),
			])

			return {
				accountCreationToken: encodeAccountCreationToken({ phoneNumber }),
			}
		}),
	createAccount: publicProcedure
		.input(
			z.object({
				accountCreationToken: z.string(),
				username: z.string().min(2).max(50),
				name: z.string().min(2).max(50),
			})
		)
		.mutation(async ({ input: { accountCreationToken, username, name } }) => {
			if (username.indexOf(" ") !== -1) {
				throw new TRPCError({ code: "BAD_REQUEST" })
			}

			let phoneNumber: number
			try {
				phoneNumber = decodeAccountCreationToken({ accountCreationToken }).phoneNumber
			} catch {
				throw new TRPCError({ code: "UNAUTHORIZED" })
			}

			const joinedOn = new Date()

			await redisLib.profile.create({ phoneNumber, name, username })

			return {
				accessToken: encodeAccessToken({ phoneNumber, username }),
				joinedOn,
			}
		}),

	isUsernameAvailable: publicProcedure
		.input(z.object({ username: z.string(), phoneNumber: z.number() }))
		.query(async ({ input: { username, phoneNumber } }) => {
			const phoneNumberWithUsername = await redisLib.profile.getPhoneNumber({ username })

			return !phoneNumberWithUsername || phoneNumberWithUsername === phoneNumber
		}),
})

export default landingRouter
