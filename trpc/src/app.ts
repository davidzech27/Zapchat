import { router, publicProcedure } from "./trpc"
import { z } from "zod"
import authRouter from "./modules/auth/router"

export const appRouter = router({
	hello: publicProcedure.query(() => {
		return `Hello`
	}),
	auth: authRouter,
})
