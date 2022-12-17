import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import type { inferAsyncReturnType } from "@trpc/server"
import db from "./lib/db"
import { mainRedisClient, publishRedisClient, subscribeRedisClient } from "./lib/redis"

export const createContext = async ({ req, res }: CreateFastifyContextOptions) => ({
	db,
	redis: mainRedisClient,
	redisPublish: publishRedisClient,
	redisSubscribe: subscribeRedisClient,
	req,
	res,
})

export type Context = inferAsyncReturnType<typeof createContext>
