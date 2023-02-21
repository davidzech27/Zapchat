import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import { redisClient } from "../shared/redis/client"
import { undefinedTypeGuard } from "../shared/util/undefinedTypeGuard"

// ! error handling is pretty bad here. integrate nats soon
const connectionRouter = router({
	friendsOfFriends: authedProcedure.query(async ({ ctx: { phoneNumber, log } }) => {
		const phoneNumbers = await redisClient.friends.getFriendsOfFriends({ phoneNumber })

		return await redisClient.profile.getFieldsMany({
			phoneNumbers,
			fields: ["username", "name"],
			onParseError: log.error,
			onNotFound: log.error,
		})
	}),
	usersAtSchool: authedProcedure
		.input(z.object({ schoolId: z.number() }))
		.query(async ({ input: { schoolId }, ctx: { log } }) => {
			return await redisClient.profile.getFieldsMany({
				phoneNumbers: await redisClient.schools.getUsersAtSchool({ schoolId }),
				fields: ["username", "name"], // ? joinedOn
				onParseError: log.error,
				onNotFound: log.error,
			})
		}),
	sendRequest: authedProcedure
		.input(
			z.object({
				receiverUsername: z.string(),
			})
		)
		.mutation(async ({ input: { receiverUsername }, ctx: { phoneNumber, username } }) => {
			if (receiverUsername === username) {
				throw new TRPCError({ code: "BAD_REQUEST" })
			}

			const receiverPhoneNumber = await redisClient.profile.getPhoneNumber({
				username: receiverUsername,
			})

			if (!receiverPhoneNumber) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			if (
				await redisClient.friends.areFriends({
					potentialFriendPhoneNumber: phoneNumber,
					otherPotentialFriendPhoneNumber: receiverPhoneNumber,
				})
			) {
				throw new TRPCError({ code: "CONFLICT" })
			} else {
				await redisClient.requests.createRequest({
					senderPhoneNumber: phoneNumber,
					receiverPhoneNumber,
				})
			}
		}),
	acceptRequest: authedProcedure
		.input(
			z.object({
				senderUsername: z.string(),
			})
		)
		.mutation(async ({ input: { senderUsername }, ctx: { phoneNumber } }) => {
			const senderPhoneNumber = await redisClient.profile.getPhoneNumber({
				username: senderUsername,
			})

			if (!senderPhoneNumber) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			if (
				await redisClient.requests.deleteRequest({
					senderPhoneNumber,
					receiverPhoneNumber: phoneNumber,
				})
			) {
				await redisClient.friends.createFriendship({
					phoneNumber,
					otherPhoneNumber: senderPhoneNumber,
				})
			} else {
				throw new TRPCError({ code: "CONFLICT" })
			}
		}),
	removeFriend: authedProcedure
		.input(z.object({ otherUsername: z.string() }))
		.query(async ({ input: { otherUsername }, ctx: { phoneNumber } }) => {
			const otherPhoneNumber = await redisClient.profile.getPhoneNumber({
				username: otherUsername,
			})

			if (!otherPhoneNumber) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			await redisClient.friends.deleteFriendship({ phoneNumber, otherPhoneNumber })
		}),
	incomingRequests: authedProcedure.query(async ({ ctx: { phoneNumber, log } }) => {
		const incomingRequestsPhoneNumbers = await redisClient.requests.getIncoming({ phoneNumber })

		return await redisClient.profile.getFieldsMany({
			phoneNumbers: incomingRequestsPhoneNumbers,
			fields: ["username", "name"],
			onParseError: log.error,
			onNotFound: log.error,
		})
	}),
	outgoingRequests: authedProcedure.query(async ({ ctx: { phoneNumber, log } }) => {
		const outgoingRequestsPhoneNumbers = await redisClient.requests.getOutgoing({ phoneNumber })

		return await redisClient.profile.getFieldsMany({
			phoneNumbers: outgoingRequestsPhoneNumbers,
			fields: ["username", "name"],
			onParseError: log.error,
			onNotFound: log.error,
		})
	}),
})

export default connectionRouter
