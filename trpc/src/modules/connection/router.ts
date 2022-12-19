import { TRPCError } from "@trpc/server"
import { sql } from "kysely"
import { z } from "zod"
import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
// consider redis to speed up mapping from user phone number to username or adding username column. determine empirically which offers greater performance benefits. try explaining queries to see if nested queries are reused
const connectionRouter = router({
	recommendations: authedProcedure.query(async ({ ctx: { db } }) => {
		return await db
			.selectFrom("user")
			.select(["name", "username", "photo", "joinedOn"])
			.limit(10)
			.execute()
	}),
	sendRequest: authedProcedure
		.input(
			z.object({
				otherUsername: z.string(),
			})
		)
		.mutation(async ({ input: { otherUsername }, ctx: { phoneNumber, username, db } }) => {
			if (otherUsername === username) {
				throw new TRPCError({ code: "BAD_REQUEST" })
			}

			const sentAt = new Date()

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
	acceptRequest: authedProcedure
		.input(
			z.object({
				otherUsername: z.string(),
			})
		)
		.mutation(async ({ input: { otherUsername }, ctx: { phoneNumber, db } }) => {
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
})

export default connectionRouter
