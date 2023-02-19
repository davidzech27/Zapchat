import create from "zustand"
import { combine } from "zustand/middleware"

export interface Chat {
	id: string
	type: "asChooser" | "asChoosee"
	name?: string
	username?: string
	chooseePresence?: Date | null
	identified: boolean
	createdAt: Date
}

export interface Profile {
	username: string
	name: string
	type: "self" | "friend" | "unknown"
}

const useModalStore = create(
	combine(
		{
			openedChat: undefined as Chat | undefined,
			openedProfile: undefined as Profile | undefined,
		},
		(set) => ({
			openChat: (chat: Chat) => {
				set({
					openedChat: chat,
				})
			},
			closeChat: () => {
				set({
					openedChat: undefined,
				})
			},
			openProfile: (profile: Profile) => {
				set({
					openedProfile: profile,
				})
			},
			closeProfile: () => {
				set({
					openedProfile: undefined,
				})
			},
		})
	)
)

type State = typeof useModalStore extends (selector: infer U) => any
	? U extends (state: infer V) => any
		? V
		: never
	: never

export default useModalStore
