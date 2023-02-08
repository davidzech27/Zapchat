import create from "zustand"
import { combine } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

export interface Chat {
	id: number
	type: "asChooser" | "asChoosee"
	name?: string
	username?: string
	createdOn: Date
}

const useChatStore = create(
	combine(
		{
			currentChat: undefined as Chat | undefined,
		},
		(set) => ({
			openChat: (chat: Chat) => {
				set({ currentChat: chat })
			},
			closeChat: () => {
				set({
					currentChat: undefined,
				})
			},
		})
	)
)

type State = typeof useChatStore extends (selector: infer U) => any
	? U extends (state: infer V) => any
		? V
		: never
	: never

export default useChatStore
