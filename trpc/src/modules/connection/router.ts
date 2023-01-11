import { TRPCError } from "@trpc/server"
import { sql } from "kysely"
import { z } from "zod"
import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import db from "../../lib/db"
import currentTimestamp from "../../util/currentTimestamp"
// consider redis to speed up mapping from user phone number to username or adding username column. determine empirically which offers greater performance benefits. try explaining queries to see if nested queries are reused
const connectionRouter = router({
	recommendations: authedProcedure.query(async () => {
		return await db
			.selectFrom("user")
			.select(["name", "username", "joinedOn"])
			.limit(10)
			.execute()
	}),
	sendRequest: authedProcedure
		.input(
			z.object({
				otherUsername: z.string(),
			})
		)
		.mutation(async ({ input: { otherUsername }, ctx: { phoneNumber, username } }) => {
			if (otherUsername === username) {
				throw new TRPCError({ code: "BAD_REQUEST" })
			}

			const sentAt = currentTimestamp()

			await db
				.insertInto("connectionRequest")
				.columns(["requesterPhoneNumber", "requesteePhoneNumber", "sentAt"])
				.expression((eb) =>
					eb
						.selectFrom("user")
						.select([
							sql.literal(phoneNumber).as(`${phoneNumber}`),
							"phoneNumber",
							sql.literal(sentAt).as(`${sentAt}`),
						])
						.where("username", "=", otherUsername)
						.whereNotExists((db) =>
							db
								.selectFrom("connection")
								.selectAll()
								.where("userPhoneNumber", "=", phoneNumber)
								.whereRef("otherUserPhoneNumber", "=", "user.phoneNumber")
						)
				)
				.onDuplicateKeyUpdate({ sentAt: new Date() })
				.execute() // not sending back appropriate error if connection already exists
		}),
	unsendRequest: authedProcedure
		.input(
			z.object({
				otherUsername: z.string(),
			})
		)
		.mutation(async ({ input: { otherUsername }, ctx: { phoneNumber } }) => {
			await db
				.deleteFrom("connectionRequest")
				.where("requesterPhoneNumber", "=", phoneNumber)
				.where("requesteePhoneNumber", "=", (db) =>
					db
						.selectFrom("user")
						.select("phoneNumber")
						.where("username", "=", otherUsername)
				)
				.execute()
		}),
	acceptRequest: authedProcedure
		.input(
			z.object({
				otherUsername: z.string(),
			})
		)
		.mutation(async ({ input: { otherUsername }, ctx: { phoneNumber } }) => {
			await db.transaction().execute(async (trx) => {
				if (
					(
						await trx
							.deleteFrom("connectionRequest")
							.where("requesteePhoneNumber", "=", phoneNumber)
							.where("requesterPhoneNumber", "=", (db) =>
								db
									.selectFrom("user")
									.select("phoneNumber")
									.where("username", "=", otherUsername)
							)
							.executeTakeFirst()
					).numDeletedRows
				) {
					await trx
						.insertInto("connection")
						.values({
							userPhoneNumber: phoneNumber,
							otherUserPhoneNumber: (db) =>
								db
									.selectFrom("user")
									.select("phoneNumber")
									.where("username", "=", otherUsername),
						})
						.values({
							userPhoneNumber: (db) =>
								db
									.selectFrom("user")
									.select("phoneNumber")
									.where("username", "=", otherUsername),
							otherUserPhoneNumber: phoneNumber,
						})
						.execute()
				} else {
					throw new TRPCError({ code: "CONFLICT" })
				}
			})
		}),
	incomingRequests: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		return await db
			.selectFrom("connectionRequest")
			.innerJoin("user", "phoneNumber", "requesterPhoneNumber")
			.select(["name", "username", "sentAt"])
			.where("requesteePhoneNumber", "=", phoneNumber)
			.execute()
	}),
	outgoingRequests: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		return new Set(
			(
				await db
					.selectFrom("connectionRequest")
					.innerJoin("user", "phoneNumber", "requesteePhoneNumber")
					.select("username")
					.where("requesterPhoneNumber", "=", phoneNumber)
					.execute()
			).map((connectionRequest) => connectionRequest.username)
		)
	}),
})

export default connectionRouter
