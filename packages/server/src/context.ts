import { CreateAWSLambdaContextOptions } from "@trpc/server/adapters/aws-lambda"
import { type APIGatewayProxyEventV2 } from "aws-lambda"
import { type inferAsyncReturnType } from "@trpc/server"

export const createContext = ({
	event,
	context,
}: CreateAWSLambdaContextOptions<APIGatewayProxyEventV2>) => ({})

export type Context = inferAsyncReturnType<typeof createContext>
