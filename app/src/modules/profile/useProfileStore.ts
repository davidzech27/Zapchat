import create from "zustand"
import { combine } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

const profileKey = "profile"

export interface UserProfile {
	username: string
	name: string
	joinedOn: Date
}

interface SerializedUserProfile {
	username: string
	name: string
	joinedOn: string
}

const deserializeUserProfile = (serializedUserProfile: SerializedUserProfile): UserProfile => ({
	...serializedUserProfile,
	joinedOn: new Date(serializedUserProfile.joinedOn),
})

const useProfileStore = create(
	combine(
		{
			profile: undefined as UserProfile | null | undefined,
		},
		(set) => ({
			setProfile: async (profile: UserProfile) => {
				set({ profile })

				await AsyncStorage.setItem(profileKey, JSON.stringify(profile))
			},
			loadProfile: async () => {
				// await AsyncStorage.removeItem(profileKey)
				const profileString = await AsyncStorage.getItem(profileKey)
				const profile =
					profileString !== null
						? deserializeUserProfile(JSON.parse(profileString) as SerializedUserProfile)
						: null
				set({ profile })
			},
		})
	)
)

export default useProfileStore

type State = typeof useProfileStore extends (selector: infer U) => any
	? U extends (state: infer V) => any
		? V
		: never
	: never

export const profileLoadedSelector = (state: State) => state.profile !== undefined
