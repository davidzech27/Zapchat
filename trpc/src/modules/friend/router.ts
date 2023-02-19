import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import { redisLib } from "../shared/redis/client"
// ! error handling is pretty bad here. integrate nats soon
const connectionRouter = router({
	friendsOfFriends: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		const phoneNumbers = await redisLib.friends.getFriendsOfFriends({ phoneNumber })

		const profiles =
			phoneNumbers &&
			(await redisLib.profile.getFieldsMany({
				phoneNumbers,
				fields: ["username", "name"],
			}))

		return profiles
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

			const receiverPhoneNumber = await redisLib.profile.getPhoneNumber({
				username: receiverUsername,
			})

			if (!receiverPhoneNumber) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			if (
				await redisLib.friends.areFriends({
					potentialFriendPhoneNumber: phoneNumber,
					otherPotentialFriendPhoneNumber: receiverPhoneNumber,
				})
			) {
				throw new TRPCError({ code: "CONFLICT" })
			} else {
				await redisLib.requests.createRequest({
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
			const senderPhoneNumber = await redisLib.profile.getPhoneNumber({
				username: senderUsername,
			})

			if (!senderPhoneNumber) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			if (
				await redisLib.requests.deleteRequest({
					senderPhoneNumber,
					receiverPhoneNumber: phoneNumber,
				})
			) {
				await redisLib.friends.createFriendship({
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
			const otherPhoneNumber = await redisLib.profile.getPhoneNumber({
				username: otherUsername,
			})

			if (!otherPhoneNumber) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			await redisLib.friends.deleteFriendship({ phoneNumber, otherPhoneNumber })
		}),
	incomingRequests: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		const incomingRequestsPhoneNumbers = await redisLib.requests.getIncoming({ phoneNumber })

		return (
			(await redisLib.profile.getFieldsMany({
				phoneNumbers: incomingRequestsPhoneNumbers,
				fields: ["username", "name"],
			})) ?? []
		)
	}),
	outgoingRequests: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		const outgoingRequestsPhoneNumbers = await redisLib.requests.getOutgoing({ phoneNumber })

		return (
			(await redisLib.profile.getFieldsMany({
				phoneNumbers: outgoingRequestsPhoneNumbers,
				fields: ["username", "name"],
			})) ?? []
		)
	}),
})

export default connectionRouter
