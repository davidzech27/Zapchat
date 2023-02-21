import { describe, it, expect, vi, afterAll } from "vitest"
import { db } from "../../lib/db"
import { appRouter } from "../../app"
import { mockLogger } from "../../../tests/mocks"
import * as sms from "../../lib/sms"
import {
	testUserPhoneNumber,
	testUserName,
	testUserUsername,
	deleteTestUser,
	testUserSchoolId,
	testUserSchoolName,
	testUserLongitude,
	testUserLatitude,
} from "../../../tests/testUser"
import { redisClient } from "../shared/redis/client"

describe("landing", () => {
	afterAll(deleteTestUser)

	it("allows users to create account", async () => {
		const sendSMSSpy = vi.spyOn(sms, "sendSMS")

		// @ts-expect-error
		sendSMSSpy.mockImplementation(() => {
			return vi.fn().mockResolvedValue({
				status: "sent",
				sid: "sid",
				errorCode: undefined,
				errorMessage: undefined,
			})
		})

		const unauthedTrpcCaller = appRouter.createCaller({
			headers: { authorization: undefined },
			log: mockLogger,
		})

		await unauthedTrpcCaller.landing.sendOTP({ phoneNumber: testUserPhoneNumber })

		const OTP = parseInt(sendSMSSpy.mock.lastCall?.[0].body?.split(" ").at(-1)?.slice(0, 6)!)

		const { accountCreationToken } = await unauthedTrpcCaller.landing.verifyOTP({
			phoneNumber: testUserPhoneNumber,
			OTP,
		})

		expect(
			await unauthedTrpcCaller.landing.isUsernameAvailable({
				phoneNumber: testUserPhoneNumber,
				username: testUserUsername,
			})
		).toBe(true)

		const schoolNearestToMe = (
			await unauthedTrpcCaller.landing.getSchoolsNearMe({
				longitude: testUserLongitude,
				latitude: testUserLatitude,
			})
		)[0]

		expect(schoolNearestToMe.name).toBe(testUserSchoolName)

		const schoolClosestToSearch = (
			await unauthedTrpcCaller.landing.getSchoolsByPrefix({
				prefix: "MARIA CARR",
			})
		)[0]

		expect(schoolClosestToSearch.name).toBe(testUserSchoolName)

		const { accessToken } = await unauthedTrpcCaller.landing.createAccount({
			accountCreationToken,
			name: testUserName,
			username: testUserUsername,
			schoolId: testUserSchoolId,
		})

		expect(accessToken).toBeDefined()

		let profile = await redisClient.profile.getFields({
			phoneNumber: testUserPhoneNumber,
			fields: ["username", "name", "joinedOn", "conversationCount", "schoolId", "schoolName"],
			onParseError: () => {},
		})

		expect(profile === undefined).toBe(false)

		if (!profile) return

		expect(profile.username).toBe(testUserUsername)
		expect(profile.name).toBe(testUserName)
		expect(profile.conversationCount).toBe(0)
		expect(profile.joinedOn instanceof Date).toBe(true)
		expect(profile.schoolId).toBe(testUserSchoolId)
		expect(profile.schoolName).toBe(testUserSchoolName)

		profile = (
			await redisClient.profile.getFieldsMany({
				phoneNumbers: [testUserPhoneNumber],
				fields: [
					"username",
					"name",
					"joinedOn",
					"conversationCount",
					"schoolId",
					"schoolName",
				],
				onParseError: () => {},
				onNotFound: () => {},
			})
		)?.[0]!

		expect(profile.username).toBe(testUserUsername)
		expect(profile.name).toBe(testUserName)
		expect(profile.conversationCount).toBe(0)
		expect(profile.joinedOn instanceof Date).toBe(true)
		expect(profile.schoolId).toBe(testUserSchoolId)
		expect(profile.schoolName).toBe(testUserSchoolName)

		expect(await redisClient.profile.getPhoneNumber({ username: testUserUsername })).toBe(
			testUserPhoneNumber
		)

		const authedTrpcCaller = appRouter.createCaller({
			headers: { authorization: `Bearer ${accessToken}` },
			log: mockLogger,
		})

		await authedTrpcCaller.profile.useDefaultProfilePhoto({ name: testUserName })
	})
})
