import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"
import { useFonts } from "expo-font"
import { TRPCProvider } from "./lib/trpc"
import AuthSwitch from "./modules/auth/AuthSwitch"
import useAuthStore, { loadedSelector } from "./modules/auth/useAuthStore"
import Landing from "./modules/landing/Landing"
import MainLayout from "./modules/layout/MainLayout"

SplashScreen.preventAutoHideAsync()

const App = () => {
	const accessTokenLoaded = useAuthStore(loadedSelector)

	const loadAccessToken = useAuthStore((s) => s.loadAccessToken)

	if (!accessTokenLoaded) {
		loadAccessToken()
	}

	const [fontsLoaded] = useFonts({
		"Helvetica-Thin": require("../assets/fonts/HelveticaNeueLTStd35Thin.otf"),
		"Helvetica-Light": require("../assets/fonts/HelveticaNeueLTStd45Light.otf"),
		"Helvetica-Roman": require("../assets/fonts/HelveticaNeueLTStd55Roman.otf"),
		"Helvetica-Medium": require("../assets/fonts/HelveticaNeueLTStd65Medium.otf"),
		"Helvetica-Bold": require("../assets/fonts/HelveticaNeueLTStd75Bold.otf"),
		"Helvetica-Heavy": require("../assets/fonts/HelveticaNeueLTStd85Heavy.otf"),
		"Helvetica-Black": require("../assets/fonts/HelveticaNeueLTStd95Black.otf"),
		"Helvetica-Italic": require("../assets/fonts/HelveticaNeueLTStd56Italic.otf"),
	})

	useEffect(() => {
		if (accessTokenLoaded && fontsLoaded) SplashScreen.hideAsync()
	}, [accessTokenLoaded, fontsLoaded])

	if (!fontsLoaded) return null

	return (
		<TRPCProvider>
			<SafeAreaProvider>
				<NavigationContainer>
					<AuthSwitch authed={<MainLayout />} unauthed={<Landing />} />
				</NavigationContainer>
			</SafeAreaProvider>
		</TRPCProvider>
	)
}

export default App
