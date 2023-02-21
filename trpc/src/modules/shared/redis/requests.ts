import { redis } from "../../../lib/redis"

const keys = {
	incomingRequests: ({ phoneNumber }: { phoneNumber: number }) => `increq:${phoneNumber}`,
	outgoingRequests: ({ phoneNumber }: { phoneNumber: number }) => `outreq:${phoneNumber}`,
}

export const requestsClient = {
	createRequest: async ({
		senderPhoneNumber,
		receiverPhoneNumber,
	}: {
		senderPhoneNumber: number
		receiverPhoneNumber: number
	}) => {
		await redis
			.multi()
			.sadd(keys.incomingRequests({ phoneNumber: receiverPhoneNumber }), senderPhoneNumber)
			.sadd(keys.outgoingRequests({ phoneNumber: senderPhoneNumber }), receiverPhoneNumber)
			.exec()
	},
	deleteRequest: async ({
		senderPhoneNumber,
		receiverPhoneNumber,
	}: {
		senderPhoneNumber: number
		receiverPhoneNumber: number
	}) => {
		const results = await redis
			.multi()
			.srem(keys.incomingRequests({ phoneNumber: receiverPhoneNumber }), senderPhoneNumber)
			.srem(keys.outgoingRequests({ phoneNumber: senderPhoneNumber }), receiverPhoneNumber)
			.exec()

		return results !== null && results[0][1] !== 0
	},
	getIncoming: async ({ phoneNumber }: { phoneNumber: number }) => {
		return (await redis.smembers(keys.incomingRequests({ phoneNumber }))).map(Number)
	},
	getOutgoing: async ({ phoneNumber }: { phoneNumber: number }) => {
		return (await redis.smembers(keys.outgoingRequests({ phoneNumber }))).map(Number)
	},
}
