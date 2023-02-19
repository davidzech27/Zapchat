import { ChainableCommander } from "ioredis"
import { redis } from "../../../lib/redis"

const keys = {
	incomingRequests: ({ phoneNumber }: { phoneNumber: number }) => `increq:${phoneNumber}`,
	outgoingRequests: ({ phoneNumber }: { phoneNumber: number }) => `outreq:${phoneNumber}`,
}

export const requests = {
	createRequest: async ({
		senderPhoneNumber,
		receiverPhoneNumber,
	}: {
		senderPhoneNumber: number
		receiverPhoneNumber: number
	}) => {
		const pipeline = redis.pipeline()

		pipeline
			.sadd(keys.incomingRequests({ phoneNumber: receiverPhoneNumber }), senderPhoneNumber)
			.sadd(keys.outgoingRequests({ phoneNumber: senderPhoneNumber }), receiverPhoneNumber)

		await pipeline.exec()
	},
	deleteRequest: async ({
		senderPhoneNumber,
		receiverPhoneNumber,
		pipeline: suppliedPipeline,
	}: {
		senderPhoneNumber: number
		receiverPhoneNumber: number
		pipeline?: ChainableCommander
	}) => {
		const pipeline = suppliedPipeline ?? redis.pipeline()

		pipeline
			.srem(keys.incomingRequests({ phoneNumber: receiverPhoneNumber }), senderPhoneNumber)
			.srem(keys.outgoingRequests({ phoneNumber: senderPhoneNumber }), receiverPhoneNumber)

		if (suppliedPipeline !== undefined) return true

		const pipelineResult = await pipeline.exec()

		return pipelineResult !== null && pipelineResult[0][1] !== 0
	},
	getIncoming: async ({ phoneNumber }: { phoneNumber: number }) => {
		return (await redis.smembers(keys.incomingRequests({ phoneNumber }))).map(Number)
	},
	getOutgoing: async ({ phoneNumber }: { phoneNumber: number }) => {
		return (await redis.smembers(keys.outgoingRequests({ phoneNumber }))).map(Number)
	},
}
