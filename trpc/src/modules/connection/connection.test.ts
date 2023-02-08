import { describe, it, expect, afterAll, beforeAll } from "vitest"
import db from "../../lib/db"
import {
	testUserTrpcCaller,
	createTestUser,
	deleteTestUser,
	testUserUsername,
	testUserPhoneNumber,
} from "../../../tests/testUser"
import {
	otherUserTrpcCaller,
	otherUserUsername,
	otherUserPhoneNumber,
} from "../../../tests/otherUser"

describe("connection", async () => {
	beforeAll(async () => {
		await createTestUser()
	})

	afterAll(async () => {
		await Promise.all([
			db
				.deleteFrom("connection")
				.where("userPhoneNumber", "=", testUserPhoneNumber)
				.orWhere("otherUserPhoneNumber", "=", testUserPhoneNumber)
				.execute(),

			db
				.deleteFrom("connectionRequest")
				.where("requesterPhoneNumber", "=", testUserPhoneNumber)
				.orWhere("requesteePhoneNumber", "=", testUserPhoneNumber)
				.execute(),
			db.deleteFrom("user").where("name", "like", "%generated%").execute(),
			db
				.deleteFrom("connection")
				.where("userPhoneNumber", "in", (db) =>
					db.selectFrom("user").select("phoneNumber").where("name", "like", "%generated%")
				)
				.orWhere("otherUserPhoneNumber", "in", (db) =>
					db.selectFrom("user").select("phoneNumber").where("name", "like", "%generated%")
				)
				.execute(),
			deleteTestUser(),
		])
	})

	it("allows users to send, receive, and accept friend requests", async () => {
		await testUserTrpcCaller.connection.sendRequest({ otherUsername: otherUserUsername })

		await db
			.selectFrom("connectionRequest")
			.selectAll()
			.where("requesterPhoneNumber", "=", testUserPhoneNumber)
			.where("requesteePhoneNumber", "=", otherUserPhoneNumber)
			.executeTakeFirstOrThrow()

		const incomingRequests = await otherUserTrpcCaller.connection.incomingRequests()

		expect(incomingRequests.map(({ username }) => username)).toContain(testUserUsername)

		await otherUserTrpcCaller.connection.acceptRequest({
			otherUsername: testUserUsername,
		})

		await Promise.all([
			db
				.selectFrom("connection")
				.selectAll()
				.where("userPhoneNumber", "=", testUserPhoneNumber)
				.where("otherUserPhoneNumber", "=", otherUserPhoneNumber)
				.executeTakeFirstOrThrow(),
			db
				.selectFrom("connection")
				.selectAll()
				.where("userPhoneNumber", "=", otherUserPhoneNumber)
				.where("otherUserPhoneNumber", "=", testUserPhoneNumber)
				.executeTakeFirstOrThrow(),
		])
	})

	it("correctly determines friends of friends", async () => {
		interface User {
			phoneNumber: number
			name: string
			username: string
			birthday: Date
			joinedOn: Date
			friends: User[]
		}

		const birthday = new Date()
		birthday.setFullYear(2005)

		const genFiveRandomUsersWithFriends = ({
			friendsGen,
			friendGroup,
		}: {
			friendsGen: () => User[]
			friendGroup: string
		}) =>
			[
				`generated${friendGroup}One`,
				`generated${friendGroup}Two`,
				`generated${friendGroup}Three`,
				`generated${friendGroup}Four`,
				`generated${friendGroup}Five`,
			].map((friend) => ({
				phoneNumber: Math.floor(Math.random() * 100000000000),
				name: `${friend}'s name`,
				username: `${friend}'s username`,
				birthday,
				joinedOn: new Date(),
				friends: friendsGen(),
			}))

		const generatedFriendsOfFriends = genFiveRandomUsersWithFriends({
			friendsGen: () => [],
			friendGroup: "friendsOfFriends",
		})

		const moreGeneratedFriendsOfFriends = genFiveRandomUsersWithFriends({
			friendsGen: () => [],
			friendGroup: "moreFriendsOfFriends",
		})

		let friendIndex = 0
		const friends = genFiveRandomUsersWithFriends({
			friendsGen: () => {
				const generatedFriend =
					friendIndex % 2 === 0
						? generatedFriendsOfFriends
						: moreGeneratedFriendsOfFriends

				friendIndex++

				return generatedFriend
			},
			friendGroup: "friends",
		})

		await db
			.insertInto("user")
			.values([
				...friends.map(({ friends, ...friend }) => friend),
				...generatedFriendsOfFriends.map(({ friends, ...friend }) => friend),
				...moreGeneratedFriendsOfFriends.map(({ friends, ...friend }) => friend),
			])
			.execute()

		await db
			.insertInto("connection")
			.values([
				...friends
					.map(({ phoneNumber: friendPhoneNumber, friends: friendsOfFriend }) => [
						...friendsOfFriend.map(
							({ phoneNumber: phoneNumberfriendOfFriendPhoneNumber }) => ({
								userPhoneNumber: friendPhoneNumber,
								otherUserPhoneNumber: phoneNumberfriendOfFriendPhoneNumber,
							})
						),
						...friendsOfFriend.map(
							({ phoneNumber: phoneNumberfriendOfFriendPhoneNumber }) => ({
								userPhoneNumber: phoneNumberfriendOfFriendPhoneNumber,
								otherUserPhoneNumber: friendPhoneNumber,
							})
						),
					])
					.flat(),
				...friends
					.map(({ phoneNumber: friendPhoneNumber }) => [
						{
							userPhoneNumber: testUserPhoneNumber,
							otherUserPhoneNumber: friendPhoneNumber,
						},
						{
							userPhoneNumber: friendPhoneNumber,
							otherUserPhoneNumber: testUserPhoneNumber,
						},
					])
					.flat(),
			])
			.execute()

		const friendsOfFriendsResults = await testUserTrpcCaller.connection.friendsOfFriends()

		expect(friendsOfFriendsResults).toHaveLength(10)

		const friendsOfFriendsNameSet = new Set(friendsOfFriendsResults.map(({ name }) => name))
		const friendsOfFriendsUsernameSet = new Set(
			friendsOfFriendsResults.map(({ username }) => username)
		)

		const allGeneratedFriendsOfFriends = [
			...generatedFriendsOfFriends,
			...moreGeneratedFriendsOfFriends,
		]

		allGeneratedFriendsOfFriends.forEach((generatedFriendOfFriends) => {
			expect(
				friendsOfFriendsNameSet.has(generatedFriendOfFriends.name) &&
					friendsOfFriendsUsernameSet.has(generatedFriendOfFriends.username)
			).toBe(true)
		})
	})
})
