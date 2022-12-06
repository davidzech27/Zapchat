import { TRPCError } from "@trpc/server"
import { router, publicProcedure } from "../../trpc"
import { z } from "zod"
import Twilio from "twilio"
import { Config } from "@serverless-stack/node/config"

const RESEND_COOLDOWN = 60

const OTP_TTL = 60 * 5
const OTP_VERIFICATION_ATTEMPTS_TTL = 60 * 60 * 24
const OTP_VERIFICATIONS_BEFORE_COOLDOWNS = 5
const OTP_VERIFICATION_COOLDOWN = 60
const OTP_VERIFICATION_COOLDOWN_ERROR_MESSAGE =
	"Slow down. Please wait before entering another code."

const INVALID_OTP_ERROR_MESSAGE = "Incorrent verification code."
const OTP_EXPIRED_ERROR_MESSAGE = "Verification code expired."

const authRouter = router({
	sendOTP: publicProcedure
		.input(
			z.object({
				phoneNumber: z.string(),
			})
		)
		.mutation(async ({ input: { phoneNumber }, ctx: { redis } }) => {
			phoneNumber = "+" + phoneNumber.replaceAll(/\D/g, "")

			const resendCoolDown = Boolean(await redis.get(`signin:${phoneNumber}:resendcooldown`))

			if (resendCoolDown) {
				throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
			}

			redis.setex(`signin:${phoneNumber}:resendcooldown`, RESEND_COOLDOWN, 1)

			const OTP = Math.floor(Math.random() * 1000000)

			const client = Twilio(Config.TWILIO_ACCOUNT_SID, Config.TWILIO_AUTH_TOKEN)

			client.messages.create({
				to: phoneNumber,
				from: Config.TWILIO_PHONE_NUMBER,
				body: `Your verification code is ${OTP}.`,
			})

			await redis.setex(`signin:${phoneNumber}:otp`, OTP_TTL, OTP)
		}),
	verifyOTP: publicProcedure
		.input(
			z.object({
				OTP: z.number().nonnegative().int().max(999999),
				phoneNumber: z.string(),
			})
		)
		.mutation(async ({ input: { OTP, phoneNumber }, ctx: { redis } }) => {
			phoneNumber = "+" + phoneNumber.replaceAll(/\D/g, "")

			const verificationCoolDown = Boolean(
				await redis.get(`signin:${phoneNumber}:verificationcooldown`)
			)

			if (verificationCoolDown) {
				throw new TRPCError({
					message: OTP_VERIFICATION_COOLDOWN_ERROR_MESSAGE,
					code: "TOO_MANY_REQUESTS",
				})
			}

			if (
				(await redis.incr(`signin:${phoneNumber}:verificationattempts`)) >=
				OTP_VERIFICATIONS_BEFORE_COOLDOWNS
			) {
				redis.setex(
					`signin:${phoneNumber}:verificationcooldown`,
					OTP_VERIFICATION_COOLDOWN,
					1
				)
			}

			redis.expire(
				`signin:${phoneNumber}:verificationattempts`,
				OTP_VERIFICATION_ATTEMPTS_TTL
			)

			const storedOTPString = await redis.get(`signin:${phoneNumber}:otp`)

			if (!storedOTPString) {
				throw new TRPCError({
					message: OTP_EXPIRED_ERROR_MESSAGE,
					code: "PRECONDITION_FAILED",
				})
			}

			const storedOTP = parseInt(storedOTPString)

			if (storedOTP !== OTP) {
				throw new TRPCError({
					message: INVALID_OTP_ERROR_MESSAGE,
					code: "BAD_REQUEST",
				})
			}

			// TODO: Create user if it doesn't exist and send back jwt
		}),
})

export default authRouter
