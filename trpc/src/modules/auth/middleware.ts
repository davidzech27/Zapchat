import { TRPCError } from "@trpc/server"
import { t } from "../../initTRPC"
import { decodeAccessToken } from "./jwt"

export const isAuthed = t.middleware(async ({ ctx: { req }, next, type, input }) => {
	let accessToken: string

	if (type !== "subscription") {
		const authHeader = req.headers.authorization

		if (authHeader) {
			req.log.debug("there is auth header")
			accessToken = authHeader.replace("Bearer ", "")
		} else {
			throw new TRPCError({ code: "UNAUTHORIZED" })
		}
	} else {
		if (input && (input as { accessToken?: string }).accessToken) {
			accessToken = (input as { accessToken: string }).accessToken
		} else {
			throw new TRPCError({ code: "UNAUTHORIZED" })
		}
	}

	try {
		const { phoneNumber, username } = decodeAccessToken({ accessToken })

		return next({
			ctx: {
				phoneNumber,
				username,
			},
		})
	} catch {
		throw new TRPCError({ code: "UNAUTHORIZED" })
	}
})
