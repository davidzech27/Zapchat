import { TRPCError } from "@trpc/server"
import { t } from "../../initTRPC"
import { decodeAccessToken } from "./jwt"

export const isAuthed = t.middleware(async ({ ctx: { req }, next }) => {
	const authHeader = req.headers.authorization

	if (authHeader) {
		const accessToken = authHeader.replace("Bearer ", "")

		try {
			const phoneNumber = decodeAccessToken({ accessToken }).phoneNumber

			return next({
				ctx: {
					phoneNumber,
				},
			})
		} catch {
			throw new TRPCError({ code: "UNAUTHORIZED" })
		}
	} else {
		throw new TRPCError({ code: "UNAUTHORIZED" })
	}
})
