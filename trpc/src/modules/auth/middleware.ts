import { useHeader } from "@serverless-stack/node/api"
import { TRPCError } from "@trpc/server"
import { t } from "trpc"
import { decodeAccessToken } from "./jwt"

export const isAuthed = t.middleware(({ ctx, next }) => {
	const authHeader = useHeader("authorization")

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
			throw new TRPCError({ code: "BAD_REQUEST" })
		}
	} else {
		throw new TRPCError({ code: "UNAUTHORIZED" })
	}
})
