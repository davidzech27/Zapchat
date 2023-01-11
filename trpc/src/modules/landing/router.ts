import { TRPCError } from "@trpc/server"
import { router } from "../../initTRPC"
import { publicProcedure } from "../../procedures"
import { sql } from "kysely"
import { z } from "zod"
import Twilio from "twilio"
import db from "../../lib/db"
import { mainRedisClient as redis } from "../../lib/redis"
import env from "../../env"
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
			const resendCoolDown = Boolean(await redis.get(keys.resendCoolingDown({ phoneNumber })))

			if (resendCoolDown) {
				throw new TRPCError({
					message: messages.RESEND_COOLDOWN_ERROR_MESSAGE,
					code: "TOO_MANY_REQUESTS",
				})
			}

			redis.setex(
				keys.resendCoolingDown({ phoneNumber }),
				constants.RESEND_COOLDOWN_SECONDS,
				1
			)

			const OTP = Math.floor(Math.random() * 1000000)
				.toString()
				.padStart(6, "0")

			const client = Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)

			const phoneNumberE164 = `+${phoneNumber}`

			await Promise.all([
				client.messages.create({
					to: phoneNumberE164,
					from: env.TWILIO_PHONE_NUMBER_E164,
					body: `Your verification code is ${OTP}.`,
				}),
				redis.setex(keys.OTP({ phoneNumber }), constants.OTP_TTL_SECONDS, OTP),
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
				birthday: z.date(),
			})
		)
		.mutation(async ({ input: { accountCreationToken, username, name, birthday } }) => {
			let phoneNumber: number
			try {
				phoneNumber = decodeAccountCreationToken({ accountCreationToken }).phoneNumber
			} catch {
				throw new TRPCError({ code: "UNAUTHORIZED" })
			}

			await db
				.insertInto("user")
				.values({ phoneNumber, username, name, joinedOn: new Date(), birthday })
				.onDuplicateKeyUpdate({ username, name })
				.execute()

			return {
				accessToken: encodeAccessToken({ phoneNumber, username }),
			}
		}),
	isUsernameAvailable: publicProcedure
		.input(z.object({ username: z.string(), phoneNumber: z.number() }))
		.query(async ({ input: { username, phoneNumber } }) => {
			const userWithUsername = await db
				.selectFrom("user")
				.select(sql`1`.as("1"))
				.where("username", "=", username)
				.where("phoneNumber", "!=", phoneNumber)
				.executeTakeFirst()

			return !userWithUsername
		}),
})

export default landingRouter
