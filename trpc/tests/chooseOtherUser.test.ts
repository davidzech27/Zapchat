import { describe, it, expect, vi, afterAll, beforeAll } from "vitest"
import { db } from "../src/lib/db"
import { testUserTrpcCaller, createTestUser, testUserPhoneNumber } from "./testUser"
import {
	otherUserUsername,
	otherUserName,
	otherUserPhoneNumber,
	otherUserTrpcCaller,
} from "./otherUser"

//! test not currently reimplemented after refactor and stack change

// describe.skip("choosing other user", () => {
// 	beforeAll(async () => {
// 		await createTestUser()
// 	})

// 	afterAll(async () => {
// 		await db
// 			.updateTable("user")
// 			.set({ lastPickedAt: null })
// 			.where("phoneNumber", "=", testUserPhoneNumber)
// 			.execute()
// 	})

// 	it("allows users choose users they're connected with from their choices to chat with", async () => {
// 		createConnection({ userPhoneNumber: testUserPhoneNumber, otherUserPhoneNumber })

// 		const choices = await testUserTrpcCaller.picking.choices()

// 		expect(choices.map(({ name }) => name)).toContain(otherUserName) // relies on test user not having many friends
// 		expect(choices.map(({ username }) => username)).toContain(otherUserUsername)

// 		await testUserTrpcCaller.picking.choose({
// 			chooseeUsername: otherUserUsername,
// 			firstMessage: "test message",
// 		})

// 		const conversationRow = await db
// 			.selectFrom("conversation")
// 			.select("id")
// 			.where("chooserPhoneNumber", "=", testUserPhoneNumber)
// 			.where("chooseePhoneNumber", "=", otherUserPhoneNumber)
// 			.executeTakeFirstOrThrow()

// 		await db
// 			.selectFrom("message")
// 			.select("content")
// 			.where("conversationId", "=", conversationRow.id)
// 			.executeTakeFirstOrThrow()

// 		const conversationId = (await otherUserTrpcCaller.inbox.conversationsAsChoosee())[0].id

// 		const messages = await otherUserTrpcCaller.chat.chatMessages({ conversationId })

// 		expect(messages[0].content).toBe("test message")

// 		expect(messages[0].fromSelf).toBe(false)
// 	})
// })
