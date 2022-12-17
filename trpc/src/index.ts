import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import { appRouter } from "./app"
import { createContext } from "./context"
import server from "./server"
import env from "./env"

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

server.listen({ port: env.PORT })
