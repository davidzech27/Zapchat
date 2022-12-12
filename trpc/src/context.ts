import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import type { inferAsyncReturnType } from "@trpc/server"
import db from "./lib/db"
import redis from "./lib/redis"

export const createContext = async ({ req, res }: CreateFastifyContextOptions) => ({
	db,
	redis,
	req,
	res,
})

export type Context = inferAsyncReturnType<typeof createContext>
