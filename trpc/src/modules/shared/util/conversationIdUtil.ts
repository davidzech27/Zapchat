import { createCipheriv, createDecipheriv, scryptSync, randomBytes } from "crypto"
import env from "../../../env"

const key = scryptSync(env.CONVERSATION_ID_PASSWORD, randomBytes(16), 16)

const algorithm = "aes-128-ecb"

const create = async ({
	chooserPhoneNumber,
	chooseePhoneNumber,
}: {
	chooserPhoneNumber: number
	chooseePhoneNumber: number
}) => {
	const now = new Date()

	const unencryptedConversationId = `${chooserPhoneNumber
		.toString()
		.padStart(13, "0")}${chooseePhoneNumber.toString().padStart(13, "0")}${(
		now.getUTCFullYear() % 100
	)
		.toString()
		.padStart(2, "0")}${now.getUTCMonth().toString().padStart(2, "0")}${now
		.getUTCDate()
		.toString()
		.padStart(2, "0")}${now.getUTCHours().toString().padStart(2, "0")}`

	const cipher = createCipheriv(algorithm, key, null)

	cipher.write(unencryptedConversationId)
	cipher.end()

	return (cipher.read() as Buffer).toString("base64")
}

const getRoleInConversation = async ({
	phoneNumber,
	conversationId,
}: {
	phoneNumber: number
	conversationId: string
}): Promise<"chooser" | "choosee" | null> => {
	const decipher = createDecipheriv(algorithm, key, null)

	decipher.write(Buffer.from(conversationId, "base64"))
	decipher.end()

	const unencryptedConversationId = (decipher.read() as Buffer).toString()

	const phoneNumberString = phoneNumber.toString().padStart(13, "0")

	if (unencryptedConversationId.slice(0, 13) === phoneNumberString) return "chooser"

	if (unencryptedConversationId.slice(13, 26) === phoneNumberString) return "choosee"

	return null
}

export default {
	create,
	getRoleInConversation,
}
