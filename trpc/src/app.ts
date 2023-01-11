import { router } from "./initTRPC"
import landingRouter from "./modules/landing/router"
import pickingRouter from "./modules/picking/router"
import inboxRouter from "./modules/inbox/router"
import chatRouter from "./modules/chat/router"
import connectionRouter from "./modules/connection/router"
import profileRouter from "./modules/profile/router"

export const appRouter = router({
	landing: landingRouter,
	picking: pickingRouter,
	inbox: inboxRouter,
	chat: chatRouter,
	connection: connectionRouter,
	profile: profileRouter,
})

export type AppRouter = typeof appRouter

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
