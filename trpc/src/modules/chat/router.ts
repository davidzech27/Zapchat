import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { observable } from "@trpc/server/observable"
import { EventEmitter } from "events"
import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import keys from "./keys"
import type { MessagePrivate, MessagePublic } from "./types"

// todo - make authed ws procedure

const ee = new EventEmitter()

const chatProcedure = authedProcedure.input(
	z.object({
		conversationId: z.number(),
	})
)

const chatRouter = router({
	chatMessages: chatProcedure.query(
		async ({ input: { conversationId }, ctx: { phoneNumber, db } }) => {
			const chatMessages = await db
				.selectFrom("message")
				.select(["content", "fromPhoneNumber", "sentAt"])
				.where("conversationId", "=", conversationId)
				.execute()

			if (chatMessages.length === 0) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			return chatMessages.map(({ content, fromPhoneNumber, sentAt }) => ({
				content,
				fromSelf: fromPhoneNumber === phoneNumber,
				sentAt,
			}))
		}
	),
	sendMessage: chatProcedure
		.input(z.object({ content: z.string() }))
		.mutation(async ({ input: { conversationId, content }, ctx: { phoneNumber, db } }) => {
			const message: MessagePrivate = {
				content,
				fromPhoneNumber: phoneNumber,
				sentAt: new Date(),
			}

			ee.emit(keys.message({ conversationId }), message)

			await db
				.insertInto("message")
				.values({ conversationId, ...message })
				.executeTakeFirstOrThrow()
		}),
	nextMessage: chatProcedure
		.input(
			z.object({
				accessToken: z.string(),
			})
		)
		.subscription(({ input: { conversationId }, ctx: { phoneNumber } }) => {
			return observable<MessagePublic>((emit) => {
				const onReceive = ({ content, fromPhoneNumber, sentAt }: MessagePrivate) => {
					emit.next({ content, fromSelf: fromPhoneNumber === phoneNumber, sentAt })
				}

				ee.on(keys.message({ conversationId }), onReceive)

				return () => {
					ee.off(keys.message({ conversationId }), onReceive)
				}
			})
		}),
})

export default chatRouter
