import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import db from "../../lib/db"

const inboxRouter = router({
	conversationsAsChooser: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		return await db
			.selectFrom("conversation")
			.innerJoin("user", "user.phoneNumber", "conversation.chooseePhoneNumber")
			.select(["id", "user.name", "user.username", "createdOn"])
			.where("chooserPhoneNumber", "=", phoneNumber)
			.orderBy("createdOn", "desc")
			.execute()
	}),
	conversationsAsChoosee: authedProcedure.query(async ({ ctx: { phoneNumber } }) => {
		return await db
			.selectFrom("conversation")
			.innerJoin("user", "user.phoneNumber", "conversation.chooserPhoneNumber")
			.select(["id", "createdOn"])
			.where("chooseePhoneNumber", "=", phoneNumber)
			.orderBy("createdOn", "desc")
			.execute()
	}),
})

export default inboxRouter
