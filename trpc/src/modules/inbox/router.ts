import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import { db } from "../../lib/db"
import { redisClient } from "../shared/redis/client"

const inboxRouter = router({
	conversationsAsChooser: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		const conversations = await db.execute<{
			chooseeUsername: string
			chooseeName: string
			id: string
			createdAt: Date
			identified: boolean
		}>(
			"SELECT choosee_username, choosee_name, id, created_at, identified FROM conversation_by_chooser_phone_number WHERE chooser_phone_number = ?",
			[BigInt(phoneNumber)]
		)

		const conversationIds = conversations.map((conversation) => conversation.id)

		const chooseePresences = await redisClient.chooseePresence.getMany({ conversationIds })

		return conversations.map(
			({ chooseeName, chooseeUsername, id, createdAt, identified }, conversationIndex) => ({
				name: chooseeName,
				username: chooseeUsername,
				id,
				createdAt,
				identified,
				chooseePresence: chooseePresences[conversationIndex],
			})
		)
	}),
	conversationsAsChoosee: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		return (
			await db.execute<{
				chooserUsername: string
				chooserName: string
				id: string
				createdAt: Date
				identified: boolean
			}>(
				"SELECT chooser_username, chooser_name, id, created_at, identified FROM conversation WHERE choosee_phone_number = ?",
				[BigInt(phoneNumber)]
			)
		).map(({ chooserName, chooserUsername, id, createdAt, identified }) =>
			identified
				? { name: chooserName, username: chooserUsername, id, createdAt, identified }
				: { id, createdAt, identified }
		) as (
			| {
					name: string
					username: string
					id: string
					createdAt: Date
					identified: true
			  }
			| {
					id: string
					createdAt: Date
					identified: false
			  }
		)[]
	}),
})

export default inboxRouter
