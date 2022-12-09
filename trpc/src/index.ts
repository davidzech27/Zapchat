import { awsLambdaRequestHandler } from "@trpc/server/adapters/aws-lambda"
import { ApiHandler } from "@serverless-stack/node/api"
import { appRouter } from "app"
import { createContext } from "context"

export const handler = ApiHandler(
	awsLambdaRequestHandler({
		router: appRouter,
		createContext,
	})
)

export type AppRouter = typeof appRouter
