import create from "zustand"
import { combine } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

const accessTokenKey = "@accessToken"

export default create(
	combine(
		{
			accessToken: undefined as string | undefined,
		},
		(set) => ({
			setAccessToken: async (accessToken: string) => {
				try {
					await AsyncStorage.setItem(accessTokenKey, accessToken)
				} catch {}

				set({ accessToken })
			},
			loadAccessToken: async () => {
				try {
					const accessToken = (await AsyncStorage.getItem(accessTokenKey)) || ""

					set({ accessToken })
				} catch {}
			},
		})
	)
)
