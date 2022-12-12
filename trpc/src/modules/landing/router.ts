import { TRPCError } from "@trpc/server"
import { router } from "../../initTRPC"
import { publicProcedure } from "../../procedures"
import { sql } from "kysely"
import { z } from "zod"
import Twilio from "twilio"
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
const landingRouter = router({
	sendOTP: publicProcedure
		.input(
			z.object({
				phoneNumber: z.number(),
			})
		)
		.mutation(async ({ input: { phoneNumber }, ctx: { redis } }) => {
			const resendCoolDown = Boolean(await redis.get(keys.resendCoolingDown({ phoneNumber })))

			if (resendCoolDown) {
				throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
			}

			redis.setex(
				keys.resendCoolingDown({ phoneNumber }),
				constants.RESEND_COOLDOWN_SECONDS,
				1
			)

			const OTP = Math.floor(Math.random() * 1000000)

			const client = Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)

			const phoneNumberE164 = `+${phoneNumber}`

			client.messages.create({
				to: phoneNumberE164,
				from: env.TWILIO_PHONE_NUMBER_E164,
				body: `Your verification code is ${OTP}.`,
			})

			await redis.setex(keys.OTP({ phoneNumber }), constants.OTP_TTL_SECONDS, OTP)
		}),
	verifyOTP: publicProcedure
		.input(
			z.object({
				OTP: z.number(),
				phoneNumber: z.number(),
			})
		)
		.mutation(async ({ input: { OTP, phoneNumber }, ctx: { redis } }) => {
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

			const storedOTPString = await redis.get(keys.OTP({ phoneNumber }))

			if (!storedOTPString) {
				throw new TRPCError({
					message: messages.OTP_EXPIRED_ERROR_MESSAGE,
					code: "CONFLICT",
				})
			}

			const storedOTP = parseInt(storedOTPString)

			if (storedOTP !== OTP) {
				throw new TRPCError({
					message: messages.INVALID_OTP_ERROR_MESSAGE,
					code: "BAD_REQUEST",
				})
			}

			return {
				accountCreationToken: encodeAccountCreationToken({ phoneNumber }),
			}
		}),
	createAccount: publicProcedure
		.input(
			z.object({
				accountCreationToken: z.string(),
				username: z.string().max(50),
				name: z.string().max(100),
				photo: z.string().max(1000).url().optional(),
			})
		)
		.mutation(
			async ({ input: { accountCreationToken, username, name, photo }, ctx: { db } }) => {
				let phoneNumber: number
				try {
					phoneNumber = decodeAccountCreationToken({ accountCreationToken }).phoneNumber
				} catch {
					throw new TRPCError({ code: "UNAUTHORIZED" })
				}

				await db
					.insertInto("user")
					.values({ phoneNumber, username, name, photo })
					.onDuplicateKeyUpdate({ username, name, photo })
					.execute()

				return {
					accessToken: encodeAccessToken({ phoneNumber }),
				}
			}
		),
	isUsernameAvailable: publicProcedure
		.input(z.object({ username: z.string() }))
		.query(async ({ input: { username }, ctx: { db } }) => {
			const userWithUsername = await db
				.selectFrom("user")
				.select(sql`1`.as("1"))
				.where("username", "=", username)
				.executeTakeFirst()

			return !userWithUsername
		}),
})

export default landingRouter
