import { ChainableCommander } from "ioredis"
import { redis } from "../../../lib/redis"

const keys = {
	friendsPhoneNumbers: ({ phoneNumber }: { phoneNumber: number }) => `friends:${phoneNumber}`,
}

export const friends = {
	createFriendship: async ({
		phoneNumber,
		otherPhoneNumber,
	}: {
		phoneNumber: number
		otherPhoneNumber: number
	}) => {
		const pipeline = redis.pipeline()

		pipeline
			.sadd(keys.friendsPhoneNumbers({ phoneNumber }), otherPhoneNumber)
			.sadd(keys.friendsPhoneNumbers({ phoneNumber: otherPhoneNumber }), phoneNumber)

		await pipeline.exec()
	},
	deleteFriendship: async ({
		phoneNumber,
		otherPhoneNumber,
		pipeline: suppliedPipeline,
	}: {
		phoneNumber: number
		otherPhoneNumber: number
		pipeline?: ChainableCommander
	}) => {
		const pipeline = suppliedPipeline ?? redis.pipeline()

		pipeline
			.srem(keys.friendsPhoneNumbers({ phoneNumber }), otherPhoneNumber)
			.srem(keys.friendsPhoneNumbers({ phoneNumber: otherPhoneNumber }), phoneNumber)

		if (suppliedPipeline === undefined) await pipeline.exec()
	},
	getFriends: async ({ phoneNumber }: { phoneNumber: number }) => {
		return (await redis.smembers(keys.friendsPhoneNumbers({ phoneNumber }))).map(Number)
	},
	getMutualFriends: async ({
		phoneNumber,
		otherPhoneNumber,
	}: {
		phoneNumber: number
		otherPhoneNumber: number
	}) => {
		return (
			await redis.sinter(
				keys.friendsPhoneNumbers({ phoneNumber }),
				keys.friendsPhoneNumbers({ phoneNumber: otherPhoneNumber })
			)
		).map(Number)
	},
	getFriendsOfFriends: async ({ phoneNumber }: { phoneNumber: number }) => {
		const friendPhoneNumberSet = new Set(await friends.getFriends({ phoneNumber }))

		const pipeline = redis.pipeline()

		friendPhoneNumberSet.forEach((friendPhoneNumber) => {
			pipeline.smembers(keys.friendsPhoneNumbers({ phoneNumber: friendPhoneNumber }))
		})

		return (await pipeline.exec())
			?.map((command) =>
				command[1] !== null
					? (command[1] as string[]).map((fofPhoneNumberString) => {
							const fofPhoneNumber = Number(fofPhoneNumberString)

							return fofPhoneNumber !== phoneNumber &&
								!friendPhoneNumberSet.has(fofPhoneNumber)
								? fofPhoneNumber
								: null
					  })
					: null
			)
			.flat()
			.filter((result) => result !== null) as number[] | undefined
	},
	areFriends: async ({
		potentialFriendPhoneNumber,
		otherPotentialFriendPhoneNumber,
	}: {
		potentialFriendPhoneNumber: number
		otherPotentialFriendPhoneNumber: number
	}) => {
		return (
			(await redis.sismember(
				keys.friendsPhoneNumbers({ phoneNumber: potentialFriendPhoneNumber }),
				otherPotentialFriendPhoneNumber
			)) === 1
		)
	},
	getRandoms: async ({ phoneNumber, number }: { phoneNumber: number; number: number }) => {
		return (await redis.srandmember(keys.friendsPhoneNumbers({ phoneNumber }), number)).map(
			Number
		)
	},
}
