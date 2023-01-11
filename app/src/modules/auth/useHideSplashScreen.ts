import { useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"

const useHideSplashScreen = () => {
	useEffect(() => {
		SplashScreen.hideAsync()
	}, [])
}

export default useHideSplashScreen
