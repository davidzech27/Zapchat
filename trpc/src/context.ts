import { CreateAWSLambdaContextOptions } from "@trpc/server/adapters/aws-lambda"
import { type APIGatewayProxyEventV2 } from "aws-lambda"
import { type inferAsyncReturnType } from "@trpc/server"
import redis from "./lib/redis"

export const createContext = async ({
	event,
	context,
}: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) => ({ redis })

export type Context = inferAsyncReturnType<typeof createContext>
