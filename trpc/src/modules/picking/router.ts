import { sql } from "kysely"
import { z } from "zod"
import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
// todo - replace with non-random algorithm taking into account schools and friends
const pickingRouter = router({
	choices: authedProcedure.query(async ({ ctx: { db } }) => {
		const choices = await db
			.selectFrom("user")
			.select(["name", "username", "photo"])
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
		.mutation(
			async ({ input: { chooseeUsername, firstMessage }, ctx: { db, phoneNumber } }) => {
				await db.transaction().execute(async (trx) => {
					await Promise.all([
						// for some reason promise.all has little performance impacts. should investigate awaiting operations in transactions in more later
						trx
							.insertInto("conversation")
							.values({
								chooserPhoneNumber: phoneNumber,
								chooseePhoneNumber: (eb) =>
									eb
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
					])
				})
			}
		),
})

export default pickingRouter
