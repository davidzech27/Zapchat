import { z } from "zod"
import { redis } from "../../../lib/redis"
import { friendsClient } from "./friends"
import { pickingClient } from "./picking"
import { requestsClient } from "./requests"
import { schoolsClient } from "./school"
import { undefinedTypeGuard } from "../util/undefinedTypeGuard"

const keys = {
	profile: ({ phoneNumber }: { phoneNumber: number }) => `prof:${phoneNumber}`,
	phoneNumber: ({ username }: { username: string }) => `pnum:${username}`,
}

const fields = {
	username: "username",
	name: "name",
	joinedOn: "joinedOn",
	conversationCount: "conversationCount",
	schoolId: "schoolId",
	schoolName: "schoolName",
} as const

type Profile = {
	username: string
	name: string
	joinedOn: Date
	conversationCount: number
	schoolId?: number
	schoolName?: string
}
// dangerous because types given by zod aren't used, so Profile type needs to be kept in sync with it
const profileSchema = z.object({
	username: z.string(),
	name: z.string(),
	joinedOn: z.string().transform((joinedOnString) => new Date(Number(joinedOnString))),
	conversationCount: z.string().transform(Number),
	schoolId: z
		.string()
		.optional()
		.transform((schoolId) => (schoolId !== undefined ? Number(schoolId) : undefined)),
	schoolName: z.string().optional(),
})

const createPartialProfileSchema = <TFieldNames extends (keyof typeof fields)[]>({
	fields: selectedFields,
}: {
	fields: TFieldNames
}) => {
	const selectedFieldSet = new Set(selectedFields)

	return profileSchema.pick({
		username: (selectedFieldSet.has("username") ? true : false) ? true : undefined,
		name: selectedFieldSet.has("name") ? true : undefined,
		joinedOn: (selectedFieldSet.has("joinedOn") ? true : false) ? true : undefined,
		conversationCount: selectedFieldSet.has("conversationCount") ? true : undefined,
		schoolId: selectedFieldSet.has("schoolId") ? true : undefined,
		schoolName: selectedFieldSet.has("schoolName") ? true : undefined,
	})
}

// exists to ensure schema and Profile type are in sync
type Invariant1 = z.infer<typeof profileSchema> extends Profile ? true : never
type Invariant2 = Profile extends z.infer<typeof profileSchema> ? true : never
const _typechecker1: Invariant1 = true
const _typechecker2: Invariant2 = true

const parsePartialProfileFromHash = <TFieldNames extends (keyof typeof fields)[]>({
	hash,
	fields: selectedFields,
	schema,
}: {
	hash: (string | null)[]
	fields: TFieldNames
	schema?: ReturnType<typeof createPartialProfileSchema>
}) => {
	if (!schema) schema = createPartialProfileSchema({ fields: selectedFields })

	if (hash[0] === null) return undefined

	let result = {} as any

	for (let index = 0; index < hash.length; index++) {
		const fieldName = selectedFields[index]

		result[fieldName] = hash[index]
	}

	const profileSchema = createPartialProfileSchema({ fields: selectedFields })

	const parsedResult = profileSchema.safeParse(result)

	if (parsedResult.success) {
		return parsedResult.data as { [K in TFieldNames[0]]: Profile[K] }
	} else {
		return parsedResult.error
	}
}

export const profileClient = {
	create: async ({
		phoneNumber,
		username,
		name,
		schoolId,
		onParseError,
	}: {
		phoneNumber: number
		username: string
		name: string
		schoolId?: number
		onParseError: (error: Error) => void
	}) => {
		const [existingProfile, school] = await Promise.all([
			profileClient.getFields({
				phoneNumber,
				fields: ["username", "name", "joinedOn", "schoolId"],
				onParseError,
			}),
			schoolId !== undefined ? schoolsClient.get({ schoolId }) : undefined,
		])

		const schoolIsValid = school !== undefined && schoolId !== undefined

		if (existingProfile) {
			profileClient.update({
				phoneNumber,
				...(existingProfile.username !== username
					? { username: { prior: existingProfile.username, new: username } }
					: {}),
				name,
				...(schoolIsValid && existingProfile.schoolId !== schoolId
					? { schoolId: { prior: existingProfile.schoolId, new: schoolId } }
					: {}),
			})

			return { joinedOn: existingProfile.joinedOn }
		}

		const profile: Profile = {
			username,
			name,
			joinedOn: new Date(),
			conversationCount: 0,
			...(schoolIsValid ? { schoolId, schoolName: school.name } : {}),
		}

		await Promise.all([
			redis.hmset(keys.profile({ phoneNumber }), {
				...profile,
				joinedOn: profile.joinedOn.valueOf(),
			}),
			redis.set(keys.phoneNumber({ username }), phoneNumber),
			schoolIsValid && schoolsClient.addUser({ phoneNumber, schoolId }),
		])

		return { joinedOn: profile.joinedOn }
	},
	getPhoneNumber: async ({ username }: { username: string }) => {
		const phoneNumberResult = await redis.get(keys.phoneNumber({ username }))

		return phoneNumberResult !== null ? Number(phoneNumberResult) : undefined
	},
	getFields: async <TFieldNames extends (keyof typeof fields)[]>({
		phoneNumber,
		fields: selectedFields,
		onParseError,
	}: {
		phoneNumber: number
		fields: TFieldNames
		onParseError: (error: Error) => void
	}) => {
		const profileParsedResult = parsePartialProfileFromHash({
			hash: await redis.hmget(keys.profile({ phoneNumber }), ...selectedFields),
			fields: selectedFields,
		})

		if (profileParsedResult instanceof Error) {
			onParseError(profileParsedResult)
			return undefined
		}

		return profileParsedResult
	},
	getFieldsMany: async <TFieldNames extends (keyof typeof fields)[]>({
		phoneNumbers,
		fields: selectedFields,
		onParseError,
		onNotFound,
	}: {
		phoneNumbers: number[]
		fields: TFieldNames
		onParseError: (error: Error) => void
		onNotFound: (cause: string) => void
	}) => {
		const profileSchema = createPartialProfileSchema({ fields: selectedFields })

		return (
			await Promise.all(
				phoneNumbers.map((phoneNumber) =>
					redis.hmget(keys.profile({ phoneNumber }), ...selectedFields)
				)
			)
		)
			.map((profileResult, profileResultIndex) => {
				const profileParsedResult = parsePartialProfileFromHash({
					hash: profileResult,
					fields: selectedFields,
					schema: profileSchema,
				})

				if (profileParsedResult instanceof Error) {
					onParseError(profileParsedResult)
					return undefined
				}

				if (profileParsedResult === undefined) {
					onNotFound(
						`Profile not found for user with phone number: ${phoneNumbers[profileResultIndex]}`
					)
				}

				return profileParsedResult
			})
			.filter(undefinedTypeGuard)
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
		schoolId,
	}: {
		phoneNumber: number
		username?: { new: string; prior: string }
		name?: string
		schoolId?: { new: number | undefined; prior: number | undefined }
	}) => {
		await Promise.all([
			username &&
				redis.rename(
					keys.phoneNumber({ username: username.prior }),
					keys.phoneNumber({ username: username.new })
				),
			username && redis.hset(keys.profile({ phoneNumber }), fields.username, username.new),
			name && redis.hset(keys.profile({ phoneNumber }), fields.name, name),
			schoolId &&
				schoolId.prior &&
				schoolsClient.removeUser({
					phoneNumber,
					schoolId: schoolId.prior,
				}),
			schoolId &&
				schoolId.new &&
				schoolsClient.addUser({ phoneNumber, schoolId: schoolId.new }),
		])
	},
	delete: async ({
		phoneNumber,
		username,
		onParseError,
	}: {
		phoneNumber: number
		username: string
		onParseError: (error: Error) => void
	}) => {
		const [
			friendPhoneNumbers,
			incomingRequestPhoneNumbers,
			outgoingRequestPhoneNumbers,
			partialProfile,
		] = await Promise.all([
			friendsClient.getFriends({ phoneNumber }),
			requestsClient.getIncoming({ phoneNumber }),
			requestsClient.getOutgoing({ phoneNumber }),
			profileClient.getFields({ phoneNumber, fields: ["schoolId"], onParseError }),
		])

		await Promise.all([
			[
				...friendPhoneNumbers.map((friendPhoneNumber) =>
					friendsClient.deleteFriendship({
						phoneNumber,
						otherPhoneNumber: friendPhoneNumber,
					})
				),
				...incomingRequestPhoneNumbers.map((incomingRequestPhoneNumber) =>
					requestsClient.deleteRequest({
						senderPhoneNumber: incomingRequestPhoneNumber,
						receiverPhoneNumber: phoneNumber,
					})
				),
				...outgoingRequestPhoneNumbers.map((outgoingRequestPhoneNumber) =>
					requestsClient.deleteRequest({
						senderPhoneNumber: phoneNumber,
						receiverPhoneNumber: outgoingRequestPhoneNumber,
					})
				),

				...outgoingRequestPhoneNumbers.map((outgoingRequestPhoneNumber) =>
					requestsClient.deleteRequest({
						senderPhoneNumber: phoneNumber,
						receiverPhoneNumber: outgoingRequestPhoneNumber,
					})
				),
				pickingClient.deleteLastPickedAt({ phoneNumber }),
				pickingClient.deleteChoices({ phoneNumber }),
				redis.del(keys.profile({ phoneNumber })),
				redis.del(keys.phoneNumber({ username })),
				partialProfile &&
					partialProfile.schoolId &&
					schoolsClient.removeUser({
						phoneNumber,
						schoolId: partialProfile.schoolId,
					}),
			],
		])
	},
}
