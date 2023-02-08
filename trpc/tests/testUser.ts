import db from "../src/lib/db"
import { appRouter } from "../src/app"
import { encodeAccessToken } from "../src/modules/auth/jwt"
import { mockLogger } from "./mocks"

const testUserPhoneNumber = 12345678910
const testUserName = "Test Test"
const testUserUsername = "test_user"
const testUserBirthday = new Date()
testUserBirthday.setFullYear(2000)

const createTestUser = async () => {
	await db
		.insertInto("user")
		.values({
			phoneNumber: testUserPhoneNumber,
			name: testUserName,
			username: testUserUsername,
			joinedOn: new Date(),
			birthday: testUserBirthday,
		})
		.onDuplicateKeyUpdate({ birthday: testUserBirthday })
		.execute()
}

const deleteTestUser = async () => {
	await db.deleteFrom("user").where("phoneNumber", "=", testUserPhoneNumber).execute()
}

export const testUserTrpcCaller = appRouter.createCaller({
	headers: {
		authorization: `Bearer ${encodeAccessToken({
			phoneNumber: testUserPhoneNumber,
			username: testUserUsername,
		})}`,
	},
	log: mockLogger,
})

export {
	testUserPhoneNumber,
	testUserName,
	testUserUsername,
	testUserBirthday,
	createTestUser,
	deleteTestUser,
}
