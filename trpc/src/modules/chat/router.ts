import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { EventEmitter } from "events"
import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import { db } from "../../lib/db"
import conversationIdUtil from "../shared/util/conversationIdUtil"
import { redisClient } from "../shared/redis/client"

export type Message = {
	content: string
	sentAt: Date
	fromChooser: boolean
}

const chatProcedure = authedProcedure.input(
	z.object({
		conversationId: z.string(),
	})
)
// todo - integrate with nats
const chatRouter = router({
	chatMessages: chatProcedure.query(
		async ({ input: { conversationId }, ctx: { phoneNumber } }) => {
			if (
				(await conversationIdUtil.getRoleInConversation({
					conversationId,
					phoneNumber,
				})) === null
			) {
				throw new TRPCError({ code: "FORBIDDEN" })
			}

			const chatMessages = await db.execute<Message>(
				"SELECT content, sent_at, from_chooser FROM message WHERE conversation_id = ?",
				[conversationId]
			)

			if (chatMessages.length === 0) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			return chatMessages
		}
	),
	sendMessage: chatProcedure
		.input(z.object({ content: z.string() }))
		.mutation(async ({ input: { conversationId, content }, ctx: { phoneNumber } }) => {
			const roleInConversation = await conversationIdUtil.getRoleInConversation({
				conversationId,
				phoneNumber,
			})

			if (roleInConversation === null) {
				throw new TRPCError({ code: "FORBIDDEN" })
			}

			await db.execute(
				"INSERT INTO message (conversation_id, content, sent_at, from_chooser) VALUES (?, ?, ?, ?)",
				[conversationId, content, new Date(), roleInConversation === "chooser"]
			)
		}),
	chooseeRegisterPresence: chatProcedure.mutation(async ({ input: { conversationId } }) => {
		await redisClient.chooseePresence.update({ conversationId })
	}),
})

export default chatRouter
