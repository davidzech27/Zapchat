import { useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"

const useHideSplashScreen = (options: { if: boolean } | void) => {
	useEffect(() => {
		if (options && !options.if) return

		SplashScreen.hideAsync()
	}, [options?.if])
}

export default useHideSplashScreen
