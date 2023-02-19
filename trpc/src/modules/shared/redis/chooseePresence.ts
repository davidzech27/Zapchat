import { redis } from "../../../lib/redis"

const keys = {
	chooseePresence: ({ conversationId }: { conversationId: string }) =>
		`chseepres:${conversationId}`,
}

export const chooseePresence = {
	update: async ({ conversationId }: { conversationId: string }) => {
		await redis.set(keys.chooseePresence({ conversationId }), new Date().valueOf())
	},
	getMany: async ({ conversationIds }: { conversationIds: string[] }) => {
		if (conversationIds.length === 0) return []

		return (
			await redis.mget(
				conversationIds.map((conversationId) => keys.chooseePresence({ conversationId }))
			)
		).map((chooseePresence) =>
			chooseePresence !== null ? new Date(Number(chooseePresence)) : null
		)
	},
}
