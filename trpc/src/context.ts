import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import type { inferAsyncReturnType } from "@trpc/server"

export const createContext = async ({ req }: CreateFastifyContextOptions) => ({
	headers: req.headers,
	log: req.log,
})

export type Context = inferAsyncReturnType<typeof createContext>
