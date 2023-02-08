import create from "zustand"
import { combine } from "zustand/middleware"

const useDarkStore = create(
	combine(
		{
			dark: true,
		},
		(set) => ({
			setDark: async (dark: boolean) => set({ dark }),
		})
	)
)

export default useDarkStore
