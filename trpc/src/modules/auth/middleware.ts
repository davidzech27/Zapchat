import { TRPCError } from "@trpc/server"
import { t } from "../../initTRPC"
import { decodeAccessToken } from "./jwt"
import getAccessTokenFromRequest from "./getAccessTokenFromRequest"

export const isAuthed = t.middleware(async ({ ctx: { req }, next, type, input }) => {
	let accessToken: string | undefined

	if (type !== "subscription") {
		accessToken = getAccessTokenFromRequest({ req })

		if (!accessToken) {
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
