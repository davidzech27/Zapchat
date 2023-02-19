import create from "zustand"
import { combine } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

const useChatStore = create(combine({}, (set) => ({})))

type State = typeof useChatStore extends (selector: infer U) => any
	? U extends (state: infer V) => any
		? V
		: never
	: never

export default useChatStore
