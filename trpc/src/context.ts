import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify"
import type { inferAsyncReturnType } from "@trpc/server"

export const createContext = async ({ req, res }: CreateFastifyContextOptions) => ({
	req,
	res,
})

export type Context = inferAsyncReturnType<typeof createContext>
