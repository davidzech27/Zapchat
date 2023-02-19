import { ChainableCommander } from "ioredis"
import { redis } from "../../../lib/redis"
import { friends } from "./friends"

const keys = {
	lastPickedAt: ({ phoneNumber }: { phoneNumber: number }) => `picked:${phoneNumber}`,
	choices: ({ phoneNumber }: { phoneNumber: number }) => `choices:${phoneNumber}`,
}

export const picking = {
	getLastPickedAt: async ({ phoneNumber }: { phoneNumber: number }) => {
		const dateString = await redis.get(keys.lastPickedAt({ phoneNumber }))

		return dateString !== null ? new Date(Number(dateString)) : null
	},
	updateLastPickedAt: async ({ phoneNumber }: { phoneNumber: number }) => {
		await redis.set(keys.lastPickedAt({ phoneNumber }), new Date().valueOf())
	},
	deleteLastPickedAt: async ({
		phoneNumber,
		pipeline,
	}: {
		phoneNumber: number
		pipeline?: ChainableCommander
	}) => {
		await (pipeline ?? redis).del(keys.lastPickedAt({ phoneNumber }))
	},
	getChoices: async ({ phoneNumber, number }: { phoneNumber: number; number: number }) => {
		const existingChoices = (await redis.smembers(keys.choices({ phoneNumber }))).map(Number)

		if (existingChoices.length !== 0) return existingChoices

		const newChoices = await friends.getRandoms({ phoneNumber, number })

		await redis.sadd(keys.choices({ phoneNumber }), newChoices)

		return newChoices
	},
	deleteChoices: async ({
		phoneNumber,
		pipeline,
	}: {
		phoneNumber: number
		pipeline?: ChainableCommander
	}) => {
		await (pipeline ?? redis).del(keys.choices({ phoneNumber }))
	},
}
