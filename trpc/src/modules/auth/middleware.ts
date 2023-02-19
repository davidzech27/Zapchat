import { TRPCError } from "@trpc/server"
import { t } from "../../initTRPC"
import { decodeAccessToken } from "./jwt"
import getAccessTokenFromHeaders from "./getAccessTokenFromHeaders"

export const isAuthed = t.middleware(async ({ ctx: { headers }, next }) => {
	let accessToken: string | undefined

	accessToken = getAccessTokenFromHeaders({ headers })

	if (!accessToken) {
		throw new TRPCError({ code: "UNAUTHORIZED" })
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
