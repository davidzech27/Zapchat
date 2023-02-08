import { TRPCError } from "@trpc/server"
import { t } from "../../initTRPC"
import { decodeAccessToken } from "./jwt"
import getAccessTokenFromHeaders from "./getAccessTokenFromHeaders"

export const isAuthed = t.middleware(async ({ ctx: { headers }, next, type, input }) => {
	let accessToken: string | undefined

	if (type !== "subscription") {
		accessToken = getAccessTokenFromHeaders({ headers })

		if (!accessToken) {
			throw new TRPCError({ code: "UNAUTHORIZED" })
		}
	} else {
		process.stderr.write("input" + input)
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
