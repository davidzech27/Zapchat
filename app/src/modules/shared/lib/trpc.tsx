import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "../../../../../trpc/src/app"
export type { RouterInput, RouterOutput } from "../../../../../trpc/src/app"
import { QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink, wsLink, splitLink, createWSClient } from "@trpc/client"
import superjson from "superjson"
import { useState, type FC, type ReactNode } from "react"
import QueryClient from "./QueryClient"
import { TRPC_URL } from "env"
import getHeaders from "../../auth/getHeaders"

export const trpc = createTRPCReact<AppRouter, unknown, "ExperimentalSuspense">()

export const TRPCProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [queryClient] = useState(() => QueryClient)
	const [trpcClient] = useState(() =>
		trpc.createClient({
			transformer: superjson,
			links: [
				httpBatchLink({
					url: TRPC_URL,
					headers: getHeaders,
				}),
			],
		})
	)

	return (
		<trpc.Provider client={trpcClient} queryClient={queryClient}>
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		</trpc.Provider>
	)
}
