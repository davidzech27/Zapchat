import { describe, it, expect } from "vitest"
import conversationIdUtil from "./conversationIdUtil"

const chooserPhoneNumber = 12345678901
const chooseePhoneNumber = 13254769801
const notInConversationPhoneNumber = 10987654321

describe("conversation id", () => {
	it("produces a conversation id that can be used to determine the role of a phone number in the conversation", async () => {
		const conversationId = await conversationIdUtil.create({
			chooserPhoneNumber,
			chooseePhoneNumber,
		})

		expect(conversationId.length).toMatchInlineSnapshot("64")

		expect(conversationId).toBe(
			await conversationIdUtil.create({
				chooserPhoneNumber,
				chooseePhoneNumber,
			})
		)

		expect(
			await conversationIdUtil.getRoleInConversation({
				conversationId,
				phoneNumber: chooserPhoneNumber,
			})
		).toMatchInlineSnapshot('"chooser"')

		expect(
			await conversationIdUtil.getRoleInConversation({
				conversationId,
				phoneNumber: chooseePhoneNumber,
			})
		).toMatchInlineSnapshot('"choosee"')

		expect(
			await conversationIdUtil.getRoleInConversation({
				conversationId,
				phoneNumber: notInConversationPhoneNumber,
			})
		).toMatchInlineSnapshot("null")
	})
})
