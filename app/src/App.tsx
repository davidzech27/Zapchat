import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"
import { TRPCProvider } from "./lib/trpc"
import AuthSwitch from "./modules/auth/AuthSwitch"
import useAuthStore, { loadedSelector } from "./modules/auth/useAuthStore"
import Landing from "./modules/landing/Landing"

SplashScreen.preventAutoHideAsync()

const App = () => {
	const accessTokenLoaded = useAuthStore(loadedSelector)

	const loadAccessToken = useAuthStore((s) => s.loadAccessToken)

	if (!accessTokenLoaded) {
		loadAccessToken()
	}

	useEffect(() => {
		if (accessTokenLoaded) SplashScreen.hideAsync()
	}, [accessTokenLoaded])

	return (
		<TRPCProvider>
			<SafeAreaProvider>
				<NavigationContainer>
					<AuthSwitch authed={<></>} unauthed={<Landing />} />
					<StatusBar style="auto" />
				</NavigationContainer>
			</SafeAreaProvider>
		</TRPCProvider>
	)
}

export default App
