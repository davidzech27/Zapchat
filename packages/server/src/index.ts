import { initTRPC, type inferAsyncReturnType } from "@trpc/server"
import {
	CreateAWSLambdaContextOptions,
	awsLambdaRequestHandler,
} from "@trpc/server/adapters/aws-lambda"
import { type APIGatewayProxyEventV2 } from "aws-lambda"
import { z } from "zod"

export const t = initTRPC.create()

const appRouter = t.router({
	hello: t.procedure
		.input(z.object({ name: z.string() }))
		.query(({ input }) => {
			return `Hello ${input.name}`
		}),
})

const createContext = ({
	event,
	context,
}: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) => ({})

type Context = inferAsyncReturnType<typeof createContext>

export const handler = awsLambdaRequestHandler({
	router: appRouter,
	createContext,
})

export type AppRouter = typeof appRouter
