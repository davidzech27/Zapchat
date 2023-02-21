import create from "zustand"
import { combine } from "zustand/middleware"
import * as SecureStore from "expo-secure-store"
import AsyncStorage from "@react-native-async-storage/async-storage"

const accessTokenKey = "accessToken"
const isLandingCompleteKey = "isLandingComplete"

const useAuthStore = create(
	combine(
		{
			accessToken: undefined as string | undefined,
			isLandingComplete: undefined as boolean | undefined,
		},
		(set) => ({
			setAccessToken: async (accessToken: string) => {
				set({ accessToken })

				await SecureStore.setItemAsync(accessTokenKey, accessToken)
			},
			loadAccessToken: async () => {
				// await SecureStore.deleteItemAsync(accessTokenKey)
				const accessToken = (await SecureStore.getItemAsync(accessTokenKey)) || ""
				set({ accessToken })
			},
			completeLanding: async () => {
				set({ isLandingComplete: true })

				await AsyncStorage.setItem(isLandingCompleteKey, "true")
			},
			loadIsLandingComplete: async () => {
				// await AsyncStorage.removeItem(isLandingCompleteKey)
				const isLandingComplete = Boolean(await AsyncStorage.getItem(isLandingCompleteKey))

				set({ isLandingComplete })
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
	state.accessToken !== undefined && state.accessToken !== "" && state.isLandingComplete

export const authLoadedSelector = (state: State) =>
	state.accessToken !== undefined && state.isLandingComplete !== undefined
