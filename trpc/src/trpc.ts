import { initTRPC } from "@trpc/server"
import superjson from "superjson"
import { isAuthed } from "modules/auth/middleware"

import { type Context } from "context"

export const t = initTRPC.context<Context>().create({
	transformer: superjson,
	errorFormatter: ({ shape }) => shape,
})

export const router = t.router

export const publicProcedure = t.procedure

export const authedProcedure = t.procedure.use(isAuthed)
