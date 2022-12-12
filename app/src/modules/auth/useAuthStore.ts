import create from "zustand"
import { combine } from "zustand/middleware"
import * as SecureStore from "expo-secure-store"

const accessTokenKey = "accessToken"

const useAuthStore = create(
	combine(
		{
			accessToken: undefined as string | undefined,
		},
		(set) => ({
			setAccessToken: async (accessToken: string) => {
				try {
					await SecureStore.setItemAsync(accessTokenKey, accessToken)
				} catch {}

				set({ accessToken })
			},
			loadAccessToken: async () => {
				try {
					const accessToken = (await SecureStore.getItemAsync(accessTokenKey)) || ""
					set({ accessToken })
				} catch {}
			},
		})
	)
)

export default useAuthStore

type State = typeof useAuthStore extends (selector: infer U) => any
	? U extends (state: infer V) => any
		? V
		: never
	: never

export const authedSelector = (state: State) =>
	state.accessToken !== undefined && state.accessToken !== ""

export const loadedSelector = (state: State) => state.accessToken !== undefined
