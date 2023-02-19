import { redis } from "../../../lib/redis"
import { friends } from "./friends"
import { picking } from "./picking"
import { requests } from "./requests"

const keys = {
	profile: ({ phoneNumber }: { phoneNumber: number }) => `prof:${phoneNumber}`,
	phoneNumber: ({ username }: { username: string }) => `pnum:${username}`,
}

const fields = {
	username: "username",
	name: "name",
	joinedOn: "joinedOn",
	conversationCount: "conversationCount",
} as const

type Profile = {
	username: string
	name: string
	joinedOn: Date
	conversationCount: number
}

type SerializedProfile = Omit<Profile, "joinedOn" | "conversationCount"> & {
	joinedOn: string
	conversationCount: string
}

const deserializeProfile = (serializedProfile: SerializedProfile): Profile => ({
	...serializedProfile,
	joinedOn: new Date(Number(serializedProfile.joinedOn)),
	conversationCount: Number(serializedProfile.conversationCount),
})

const deserializePartialProfile = <TFields extends keyof typeof fields>(serializedProfile: {
	[K in TFields]: SerializedProfile[K]
}) => {
	return {
		...serializedProfile,
		...((serializedProfile as unknown as { joinedOn: any }).joinedOn !== undefined
			? {
					joinedOn: new Date(
						Number((serializedProfile as unknown as { joinedOn: any }).joinedOn)
					),
			  }
			: {}),
		...((serializedProfile as unknown as { conversationCount: any }).conversationCount !==
		undefined
			? {
					conversationCount: Number(
						(serializedProfile as unknown as { conversationCount: any })
							.conversationCount
					),
			  }
			: {}),
	} as {
		[K in TFields]: Profile[K]
	}
}

export const profile = {
	create: async ({
		phoneNumber,
		username,
		name,
	}: {
		phoneNumber: number
		username: string
		name: string
	}) => {
		const existingProfile = await profile.getFields({
			phoneNumber,
			fields: ["username", "name", "joinedOn", "conversationCount"],
		})

		if (existingProfile) {
			profile.update({
				phoneNumber,
				username: { prior: existingProfile.username, new: username },
				name,
			})

			return
		}

		const pipeline = redis.pipeline()

		const userProfile: Profile = { username, name, joinedOn: new Date(), conversationCount: 0 }

		pipeline
			.hmset(keys.profile({ phoneNumber }), {
				...profile,
				joinedOn: userProfile.joinedOn.valueOf(),
			})
			.set(keys.phoneNumber({ username }), phoneNumber)

		await pipeline.exec()
	},
	getPhoneNumber: async ({ username }: { username: string }) => {
		const phoneNumberResult = await redis.get(keys.phoneNumber({ username }))

		return phoneNumberResult !== null ? Number(phoneNumberResult) : undefined
	},
	getFields: async <
		TFieldNames extends {
			[K in keyof typeof fields]: (typeof fields)[K]
		}[keyof typeof fields][]
	>({
		phoneNumber,
		fields: selectedFields,
	}: {
		phoneNumber: number
		fields: TFieldNames
	}) => {
		const profileResult = await redis.hmget(keys.profile({ phoneNumber }), ...selectedFields)

		let serializedProfile = {} as any

		for (let index = 0; index < profileResult.length; index++) {
			const fieldName = selectedFields[index]

			serializedProfile[fieldName] = profileResult[index]
		}

		return deserializePartialProfile(
			serializedProfile as { [K in TFieldNames[0]]: SerializedProfile[K] }
		)
	},
	getFieldsMany: async <
		TFieldNames extends {
			[K in keyof typeof fields]: (typeof fields)[K]
		}[keyof typeof fields][]
	>({
		phoneNumbers,
		fields: selectedFields,
	}: {
		phoneNumbers: number[]
		fields: TFieldNames
	}) => {
		const pipeline = redis.pipeline()

		for (const phoneNumber of phoneNumbers) {
			pipeline.hmget(keys.profile({ phoneNumber }), ...selectedFields)
		}

		return (await pipeline.exec())
			?.map((command) => command[1] as (string | null)[])
			.filter((profileResult) => !!profileResult)
			.map((profileResult) => {
				let serializedProfile = {} as any

				for (let index = 0; index < profileResult.length; index++) {
					const fieldName = selectedFields[index]

					serializedProfile[fieldName] = profileResult[index]
				}

				return deserializePartialProfile(
					serializedProfile as { [K in TFieldNames[0]]: SerializedProfile[K] }
				)
			})
	},
	// would be better as lua script, but transactional capabilities aren't really necessary. also not greatest error handling
	incrementChatCount: async ({ phoneNumber }: { phoneNumber: number }) => {
		const conversationCountString = await redis.hget(
			keys.profile({ phoneNumber }),
			fields.conversationCount
		)

		if (!conversationCountString) return

		const conversationCount = Number(conversationCountString)

		await redis.hset(
			keys.profile({ phoneNumber }),
			fields.conversationCount,
			conversationCount + 1
		)
	},
	update: async ({
		phoneNumber,
		username,
		name,
	}: {
		phoneNumber: number
		username?: { new: string; prior: string }
		name?: string
	}) => {
		const pipeline = redis.pipeline()

		if (username) {
			pipeline
				.del(keys.phoneNumber({ username: username.prior }))
				.set(keys.phoneNumber({ username: username.new }), phoneNumber)
				.hset(keys.profile({ phoneNumber }), "username", username.new)
		}

		if (name) {
			pipeline.hset(keys.profile({ phoneNumber }), "name", name)
		}

		await pipeline.exec()
	},
	delete: async ({ phoneNumber, username }: { phoneNumber: number; username: string }) => {
		const [friendPhoneNumbers, incomingRequestPhoneNumbers, outgoingRequestPhoneNumbers] =
			await Promise.all([
				friends.getFriends({ phoneNumber }),
				requests.getIncoming({ phoneNumber }),
				requests.getOutgoing({ phoneNumber }),
			])

		const pipeline = redis.pipeline()

		for (const friendPhoneNumber of friendPhoneNumbers) {
			friends.deleteFriendship({ phoneNumber, otherPhoneNumber: friendPhoneNumber, pipeline })
		}

		for (const incomingRequestPhoneNumber of incomingRequestPhoneNumbers) {
			requests.deleteRequest({
				senderPhoneNumber: incomingRequestPhoneNumber,
				receiverPhoneNumber: phoneNumber,
				pipeline,
			})
		}

		for (const outgoingRequestPhoneNumber of outgoingRequestPhoneNumbers) {
			requests.deleteRequest({
				senderPhoneNumber: phoneNumber,
				receiverPhoneNumber: outgoingRequestPhoneNumber,
				pipeline,
			})
		}

		picking.deleteLastPickedAt({ phoneNumber, pipeline })
		picking.deleteChoices({ phoneNumber, pipeline })

		pipeline.del(keys.profile({ phoneNumber }))
		pipeline.del(keys.phoneNumber({ username }))

		await pipeline.exec()
	},
}
