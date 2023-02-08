import Twilio from "twilio"
import env from "../env"

const twilioClient = Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN)

export const sendSMS = async ({ to, body }: { to: string; body: string }) => {
	return await twilioClient.messages.create({
		to,
		from: env.TWILIO_PHONE_NUMBER_E164, //! may not be necessary to include. perhaps remove so that any number used
		body,
	})
}
