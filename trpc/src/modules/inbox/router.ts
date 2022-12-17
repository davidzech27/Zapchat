import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"

const inboxRouter = router({
	conversationsAsChooser: authedProcedure.query(async ({ ctx: { phoneNumber, db } }) => {
		return await db
			.selectFrom("conversation")
			.innerJoin("user", "user.phoneNumber", "conversation.chooseePhoneNumber")
			.select(["id", "user.name", "user.username", "user.photo"])
			.where("chooserPhoneNumber", "=", phoneNumber)
			.execute()
	}),
	conversationsAsChoosee: authedProcedure.query(async ({ ctx: { phoneNumber, db } }) => {
		return await db
			.selectFrom("conversation")
			.innerJoin("user", "user.phoneNumber", "conversation.chooserPhoneNumber")
			.select(["id", "user.name", "user.username", "user.photo"])
			.where("chooseePhoneNumber", "=", phoneNumber)
			.execute()
	}),
})

export default inboxRouter
