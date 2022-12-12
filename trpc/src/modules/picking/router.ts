import { string, z } from "zod"
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
					const { id } = await trx
						.insertInto("conversation")
						.values({
							chooserPhoneNumber: phoneNumber,
							chooseePhoneNumber: db
								.selectFrom("user")
								.select("phoneNumber")
								.where("username", "=", chooseeUsername),
						})
						.returning("id")
						.executeTakeFirstOrThrow()

					return await trx
						.insertInto("message")
						.values({
							conversationId: id,
							fromPhoneNumber: phoneNumber,
							content: firstMessage,
						})
						.executeTakeFirstOrThrow()
				})
			}
		),
})

export default pickingRouter
