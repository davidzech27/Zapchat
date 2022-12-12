import { router } from "./initTRPC"
import landingRouter from "./modules/landing/router"
import pickingRouter from "./modules/picking/router"

import { publicProcedure } from "./procedures"

export const appRouter = router({
	landing: landingRouter,
	picking: pickingRouter,
	test: publicProcedure.query(() => {
		console.log(1)
	}),
})

export type AppRouter = typeof appRouter
