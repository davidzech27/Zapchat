import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import { appRouter } from "./app"
import { createContext } from "./context"
import server from "./server"
import env from "./env"

server.register(fastifyTRPCPlugin, {
	trpcOptions: {
		router: appRouter,
		createContext,
	},
})

server.listen({ port: env.PORT })
