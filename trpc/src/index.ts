import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import { appRouter } from "./app"
import { createContext } from "./context"
import server from "./server"
import env from "./env"
import uploadProfilePhotoHandler from "./modules/profile/upload"

server.register(fastifyTRPCPlugin, {
	trpcOptions: {
		router: appRouter,
		createContext,
		onError: (
			{
				error,
				ctx: { req },
			}: any /* shouldn't need to be typed as any but vscode complains otherwise */
		) => {
			req.log.error(error)
		},
	},
	prefix: "/",
	useWSS: true,
})

server.register(uploadProfilePhotoHandler)

server.listen({ port: env.PORT })
