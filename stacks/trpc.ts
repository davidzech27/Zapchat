import { StackContext, Api, Config } from "@serverless-stack/resources"

export function TRPC({ stack }: StackContext) {
	const api = new Api(stack, "trpc", {
		routes: {
			$default: "src/index.handler",
		},
	})

	const PLANETSCALE_URL = new Config.Secret(stack, "PLANETSCALE_URL")
	const REDIS_URL = new Config.Secret(stack, "REDIS_URL")
	const JWT_SECRET = new Config.Secret(stack, "JWT_SECRET")
	const TWILIO_ACCOUNT_SID = new Config.Secret(stack, "TWILIO_ACCOUNT_SID")
	const TWILIO_AUTH_TOKEN = new Config.Secret(stack, "TWILIO_AUTH_TOKEN")
	const TWILIO_PHONE_NUMBER = new Config.Secret(stack, "TWILIO_PHONE_NUMBER")

	api.bind([
		PLANETSCALE_URL,
		REDIS_URL,
		JWT_SECRET,
		TWILIO_ACCOUNT_SID,
		TWILIO_AUTH_TOKEN,
		TWILIO_PHONE_NUMBER,
	])

	stack.addOutputs({
		ApiEndpoint: api.url,
	})
}
