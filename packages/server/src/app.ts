import { router, publicProcedure } from "./trpc"
import { z } from "zod"

export const appRouter = router({
	hello: publicProcedure
		.input(z.object({ name: z.string() }))
		.query(({ input }) => {
			return `Hello ${input.name}`
		}),
})

export type AppRouter = typeof appRouter
