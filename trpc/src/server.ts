import fastify from "fastify"
import ws from "@fastify/websocket"
import fs from "node:fs"
import path from "node:path"
import env from "./env"

const server = fastify({
	maxParamLength: 5000,
	logger: env.DEV
		? {
				transport: {
					target: "pino-pretty",
					options: {
						translateTime: "HH:MM:ss Z",
					},
				},
		  }
		: true,
	disableRequestLogging: true,
})

declare module "fastify" {
	export interface FastifyReply {
		startTime: number
	}
}

server.addHook("onRequest", (request, reply, done) => {
	reply.startTime = Date.now()
	request.log.info({ url: request.raw.url }, "received request")
	done()
})

server.addHook("onResponse", (request, reply, done) => {
	request.log.info(
		{
			url: request.raw.url,
			statusCode: reply.raw.statusCode,
			duration: `${Date.now() - reply.startTime}ms`,
		},
		"request completed"
	)
	done()
})

server.register(ws)

export default server
