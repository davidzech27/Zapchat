import { router } from "./initTRPC"
import landingRouter from "./modules/landing/router"
import pickingRouter from "./modules/picking/router"
import inboxRouter from "./modules/inbox/router"
import chatRouter from "./modules/chat/router"
import connectionRouter from "./modules/connection/router"

export const appRouter = router({
	landing: landingRouter,
	picking: pickingRouter,
	inbox: inboxRouter,
	chat: chatRouter,
	connection: connectionRouter,
})

export type AppRouter = typeof appRouter
