import create from "zustand"
import { combine } from "zustand/middleware"
import * as SecureStore from "expo-secure-store"
import { SharedValue } from "react-native-reanimated"

// used for storing entered information that needs to be persisted across screens and persisting landing progress across app restarts

const accountCreationTokenKey = "accountCreationToken"

const useLandingStore = create(
	combine(
		{
			name: undefined as string | undefined,
			phoneNumber: undefined as number | undefined,
			accountCreationToken: undefined as string | undefined,
			navigatingForward: { value: true } as SharedValue<boolean>,
		},
		(set) => ({
			setAccountCreationToken: async (accountCreationToken: string) => {
				set({ accountCreationToken })

				await SecureStore.setItemAsync(accountCreationTokenKey, accountCreationToken)
			},
			loadAccountCreationToken: async () => {
				// await SecureStore.deleteItemAsync(accountCreationTokenKey)
				const accountCreationToken =
					(await SecureStore.getItemAsync(accountCreationTokenKey)) || ""
				set({ accountCreationToken })
			},
		})
	)
)

export default useLandingStore
