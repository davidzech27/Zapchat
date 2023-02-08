import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify"
import { renderTrpcPanel } from "trpc-panel"
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
				ctx: { log },
			}: any /* shouldn't need to be typed as any but vscode complains otherwise */
		) => {
			log.error(error)
		},
	},
	prefix: "/",
	useWSS: true,
})

server.register(uploadProfilePhotoHandler)

server.get("/panel", (_request, reply) => {
	reply.type("text/html").send(
		renderTrpcPanel(appRouter, {
			url: `http://localhost:${env.PORT}`,
			transformer: "superjson",
		})
	)
})

server.listen({ port: env.PORT })
