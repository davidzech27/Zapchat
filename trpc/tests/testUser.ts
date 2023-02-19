import { db } from "../src/lib/db"
import { appRouter } from "../src/app"
import { encodeAccessToken } from "../src/modules/auth/jwt"
import { mockLogger } from "./mocks"

const testUserPhoneNumber = 12345678910
const testUserName = "Test Test"
const testUserUsername = "test_user"

const createTestUser = async () => {
	await db.execute("INSERT INTO user (phone_number, username, name) VALUES (?, ?, ?)", [
		testUserPhoneNumber,
		testUserUsername,
		testUserName,
	])
}

const deleteTestUser = async () => {
	await db.execute("DELETE FROM user WHERE phone_number = ?", [testUserPhoneNumber])
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

export { testUserPhoneNumber, testUserName, testUserUsername, createTestUser, deleteTestUser }
