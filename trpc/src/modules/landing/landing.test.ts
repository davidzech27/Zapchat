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
} from "../../../tests/testUser"

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

		const { accessToken } = await unauthedTrpcCaller.landing.createAccount({
			accountCreationToken,
			name: testUserName,
			username: testUserUsername,
		})

		expect(accessToken).toBeDefined()

		expect(
			await db.execute(
				"SELECT * FROM user WHERE phone_number = ? AND username = ? AND name = ?",
				[testUserPhoneNumber, testUserUsername, testUserName]
			)
		).toBe({ phoneNumber: testUserPhoneNumber, username: testUserUsername, name: testUserName })

		const authedTrpcCaller = appRouter.createCaller({
			headers: { authorization: `Bearer ${accessToken}` },
			log: mockLogger,
		})

		await authedTrpcCaller.profile.useDefaultProfilePhoto({ name: testUserName })
	})
})
