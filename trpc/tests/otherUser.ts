import { z } from "zod"
import { appRouter } from "../src/app"
import { mockLogger } from "./mocks"
import { encodeAccessToken } from "../src/modules/auth/jwt"
import db from "../src/lib/db"

// this is the other test user. should be set to an existing account

console.log({ otherUserPhoneNumber: process.env.OTHER_USER_PHONE_NUMBER })

const userDataSchema = z.object({
	OTHER_USER_PHONE_NUMBER: z.string().length(11).transform(Number),
})

const parsedUserData = userDataSchema.safeParse(process.env)

if (!parsedUserData.success) {
	console.error("Must specify valid phone number for other test user.")
	process.exit(1)
}

const { OTHER_USER_PHONE_NUMBER: otherUserPhoneNumber } = parsedUserData.data

let otherUserName: string
let otherUserUsername: string

try {
	const otherUserRow = await db
		.selectFrom("user")
		.select(["name", "username"])
		.where("phoneNumber", "=", otherUserPhoneNumber)
		.executeTakeFirstOrThrow()

	otherUserName = otherUserRow.name
	otherUserUsername = otherUserRow.username
} catch {
	console.error("User with specified phone number does not exist.")
	process.exit(1)
}

export { otherUserPhoneNumber, otherUserName, otherUserUsername }

export const otherUserTrpcCaller = appRouter.createCaller({
	headers: {
		authorization: `Bearer ${encodeAccessToken({
			phoneNumber: otherUserPhoneNumber,
			username: otherUserUsername,
		})}`,
	},
	log: mockLogger,
})
