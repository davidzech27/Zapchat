import { db } from "../src/lib/db"
import { appRouter } from "../src/app"
import { encodeAccessToken } from "../src/modules/auth/jwt"
import { mockLogger } from "./mocks"
import { redisClient } from "../src/modules/shared/redis/client"

const testUserPhoneNumber = 12345678910
const testUserName = "Test Test"
const testUserUsername = "test_user"
const testUserSchoolId = 26125
const testUserSchoolName = "MARIA CARRILLO HIGH"
const testUserLongitude = -122.66018897294998169
const testUserLatitude = 38.4802140550845948

const createTestUser = async () => {
	await redisClient.profile.create({
		phoneNumber: testUserPhoneNumber,
		username: testUserUsername,
		name: testUserName,
		schoolId: testUserSchoolId,
		onParseError: () => {},
	})
}

const deleteTestUser = async () => {
	await redisClient.profile.delete({
		phoneNumber: testUserPhoneNumber,
		username: testUserUsername,
		onParseError: () => {},
	})
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
	testUserSchoolId,
	testUserSchoolName,
	testUserLongitude,
	testUserLatitude,
	createTestUser,
	deleteTestUser,
}
