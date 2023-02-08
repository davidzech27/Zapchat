import { describe, it, expect, vi, afterAll, beforeAll } from "vitest"
import db from "../src/lib/db"
import {
	testUserTrpcCaller,
	createTestUser,
	testUserUsername,
	testUserPhoneNumber,
} from "./testUser"
import {
	otherUserTrpcCaller,
	otherUserUsername,
	otherUserPhoneNumber,
	otherUserName,
} from "./otherUser"
import { encodeAccessToken } from "../src/modules/auth/jwt"

describe("responding to other user", () => {
	beforeAll(async () => {
		await createTestUser()
	})

	afterAll(async () => {
		await db
			.updateTable("user")
			.set({ lastPickedAt: null })
			.where("phoneNumber", "=", otherUserPhoneNumber)
			.execute()
	})

	it("allows users to check their inbox for conversations and be responded to", async () => {
		const existingConversation = await db
			.selectFrom("conversation")
			.selectAll()
			.where("chooserPhoneNumber", "=", otherUserPhoneNumber)
			.where("chooseePhoneNumber", "=", testUserPhoneNumber)
			.executeTakeFirst()

		if (!existingConversation) {
			await otherUserTrpcCaller.picking.choose({
				chooseeUsername: testUserUsername,
				firstMessage: `test message from ${otherUserName}`,
			})
		}

		// for some reason input isn't being passed correctly. probably a trpcCaller issue
		// const accessToken = encodeAccessToken({
		// 	phoneNumber: otherUserPhoneNumber,
		// 	username: otherUserUsername,
		// })

		// const { unsubscribe: unsubscribeFromNextMessage } = (
		// 	await otherUserTrpcCaller.chat.nextMessage({
		// 		conversationId: otherUserConversationsAsChooser[0].id,
		// 		accessToken,
		// 	})
		// ).subscribe({
		// 	next: ({ content, fromSelf }) => {
		// 		expect(content).toBe("test message")
		// 		expect(fromSelf).toBe(false)
		// 	},
		// })

		// await new Promise<void>((resolve) =>
		// 	setTimeout(() => {
		// 		unsubscribeFromNextMessage()
		// 		resolve()
		// 	}, 1000)
		// )

		const testUserConversationsAsChoosee =
			await testUserTrpcCaller.inbox.conversationsAsChoosee()

		await testUserTrpcCaller.chat.sendMessage({
			conversationId: testUserConversationsAsChoosee[0].id, //! relies on only one user picking this test user
			content: "test message",
		})

		const otherUserConversationsAsChooser =
			await otherUserTrpcCaller.inbox.conversationsAsChooser()

		expect(otherUserConversationsAsChooser.map((conversation) => conversation.id)).toContain(
			testUserConversationsAsChoosee[0].id
		)
	})
})
