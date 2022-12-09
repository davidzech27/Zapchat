import { router } from "trpc"
import landingRouter from "modules/landing/router"

export const appRouter = router({
	landing: landingRouter,
})
