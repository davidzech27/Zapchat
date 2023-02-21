import { redis } from "../../../lib/redis"

const keys = {
	friends: ({ phoneNumber }: { phoneNumber: number }) => `friends:${phoneNumber}`,
}

export const friendsClient = {
	createFriendship: async ({
		phoneNumber,
		otherPhoneNumber,
	}: {
		phoneNumber: number
		otherPhoneNumber: number
	}) => {
		await redis
			.multi()
			.sadd(keys.friends({ phoneNumber }), otherPhoneNumber)
			.sadd(keys.friends({ phoneNumber: otherPhoneNumber }), phoneNumber)
			.exec()
	},
	deleteFriendship: async ({
		phoneNumber,
		otherPhoneNumber,
	}: {
		phoneNumber: number
		otherPhoneNumber: number
	}) => {
		await redis
			.multi()
			.srem(keys.friends({ phoneNumber }), otherPhoneNumber)
			.srem(keys.friends({ phoneNumber: otherPhoneNumber }), phoneNumber)
			.exec()
	},
	getFriends: async ({ phoneNumber }: { phoneNumber: number }) => {
		return (await redis.smembers(keys.friends({ phoneNumber }))).map(Number)
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
				keys.friends({ phoneNumber }),
				keys.friends({ phoneNumber: otherPhoneNumber })
			)
		).map(Number)
	},
	getFriendsOfFriends: async ({ phoneNumber }: { phoneNumber: number }) => {
		const friendPhoneNumbers = await friendsClient.getFriends({ phoneNumber })

		const friendPhoneNumberSet = new Set(friendPhoneNumbers)

		return (
			await redis.sunion(
				friendPhoneNumbers.map((friendPhoneNumber) =>
					keys.friends({ phoneNumber: friendPhoneNumber })
				)
			)
		)
			.map(Number)
			.filter(
				(fofPhoneNumber) =>
					fofPhoneNumber !== phoneNumber && !friendPhoneNumberSet.has(fofPhoneNumber)
			)
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
				keys.friends({ phoneNumber: potentialFriendPhoneNumber }),
				otherPotentialFriendPhoneNumber
			)) === 1
		)
	},
	getRandoms: async ({ phoneNumber, number }: { phoneNumber: number; number: number }) => {
		return (await redis.srandmember(keys.friends({ phoneNumber }), number)).map(Number)
	},
}
