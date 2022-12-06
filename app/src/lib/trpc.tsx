import { createTRPCReact } from "@trpc/react-query"
import { type AppRouter } from "../../../trpc/src"
import { QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink } from "@trpc/client"
import superjson from "superjson"
import { useState, type FC, type ReactNode } from "react"
import QueryClient from "./QueryClient"
import { TRPC_URL } from "env"
import useAuthStore from "../modules/auth/useAuthStore"

export const trpc = createTRPCReact<AppRouter>()

export const TRPCProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const accessToken = useAuthStore((state) => state.accessToken)

	const [queryClient] = useState(() => QueryClient)
	const [trpcClient] = useState(() =>
		trpc.createClient({
			transformer: superjson,
			links: [
				httpBatchLink({
					url: TRPC_URL,
					headers: accessToken
						? {
								authorization: accessToken,
						  }
						: undefined,
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
