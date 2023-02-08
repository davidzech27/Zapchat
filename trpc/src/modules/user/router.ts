import { router } from "../../initTRPC"
import { authedProcedure } from "../../procedures"
import { z } from "zod"
import db from "../../lib/db"

const userRouter = router({
	friendsOfByUsername: authedProcedure.input(z.string()).query(async ({ input: username }) => {
		return await db
			.with("userConnections", (db) =>
				db
					.selectFrom("connection")
					.select("otherUserPhoneNumber")
					.whereRef("userPhoneNumber", "=", (db) =>
						db.selectFrom("user").select("phoneNumber").where("username", "=", username)
					)
			)
			.selectFrom("userConnections")
			.innerJoin("user", "user.phoneNumber", "userConnections.otherUserPhoneNumber")
			.select(["user.name", "user.username", "user.joinedOn"])
			.execute()
	}),
})

export default userRouter
