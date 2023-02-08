import { sql } from "kysely"
import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import db from "../../lib/db"
import constants from "./constants"
// todo - replace with non-random algorithm taking into account schools and friends
const pickingRouter = router({
	choices: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		const choices = await db
			.selectFrom("user")
			.select(["name", "username"])
			.whereRef("phoneNumber", "in", (db) =>
				db
					.selectFrom("connection")
					.select("otherUserPhoneNumber")
					.where("userPhoneNumber", "=", phoneNumber)
			)
			.limit(10)
			.execute()

		return choices
	}),
	choose: authedProcedure
		.input(
			z.object({
				chooseeUsername: z.string(),
				firstMessage: z.string(),
			})
		)
		.mutation(async ({ input: { chooseeUsername, firstMessage }, ctx: { phoneNumber } }) => {
			const { lastPickedAt } = await db
				.selectFrom("user")
				.select("lastPickedAt")
				.where("phoneNumber", "=", phoneNumber)
				.executeTakeFirstOrThrow()

			if (
				lastPickedAt &&
				new Date().valueOf() - lastPickedAt.valueOf() <
					constants.MILLISECONDS_CAN_PICK_EVERY
			) {
				throw new TRPCError({ code: "PRECONDITION_FAILED" })
			}

			await db.transaction().execute(async (trx) => {
				await Promise.all([
					// for some reason promise.all has little performance impacts. should investigate awaiting operations in transactions in more later
					trx
						.insertInto("conversation")
						.values({
							chooserPhoneNumber: phoneNumber,
							chooseePhoneNumber: (db) =>
								db
									.selectFrom("user")
									.select("phoneNumber")
									.where("username", "=", chooseeUsername),
							createdOn: new Date(),
						})
						.executeTakeFirstOrThrow(),
					trx
						.insertInto("message")
						.values({
							conversationId: sql`(SELECT LAST_INSERT_ID())`,
							fromPhoneNumber: phoneNumber,
							content: firstMessage,
							sentAt: new Date(),
						})
						.executeTakeFirstOrThrow(),
					trx
						.updateTable("user")
						.set({ lastPickedAt: new Date() })
						.where("phoneNumber", "=", phoneNumber)
						.execute(),
				])
			})
		}),
	canChooseAt: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		const { lastPickedAt, joinedOn } = await db
			.selectFrom("user")
			.select(["lastPickedAt", "joinedOn"])
			.where("phoneNumber", "=", phoneNumber)
			.executeTakeFirstOrThrow()

		if (!lastPickedAt) return joinedOn

		return new Date(lastPickedAt.valueOf() + constants.MILLISECONDS_CAN_PICK_EVERY)
	}),
})

export default pickingRouter
