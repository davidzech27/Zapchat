import "dotenv/config"
import { z } from "zod"

const schema = z.object({
	PLANETSCALE_URL: z.string().url(),
	REDIS_URL: z.string().url(),
	ACCESS_TOKEN_SECRET: z.string(),
	ACCOUNT_CREATION_TOKEN_SECRET: z.string(),
	TWILIO_ACCOUNT_SID: z.string(),
	TWILIO_AUTH_TOKEN: z.string(),
	TWILIO_PHONE_NUMBER_E164: z.string().length(12),
	PORT: z.string().transform(Number),
	DEV: z.string().transform(Boolean),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
	console.error("Invalid environment variables: ", JSON.stringify(parsed.error.format(), null, 4))
	console.log("asdf")
	process.exit(1)
}

export default parsed.data
