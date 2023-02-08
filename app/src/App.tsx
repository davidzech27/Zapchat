import "react-native-gesture-handler"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import * as SplashScreen from "expo-splash-screen"
import { TRPCProvider } from "./shared/lib/trpc"
import AuthSwitch from "./modules/auth/AuthSwitch"
import useAuthStore, { storedAuthInfoLoadedSelector } from "./modules/auth/useAuthStore"
import Landing from "./modules/landing/Landing"
import MainLayout from "./modules/layout/MainLayout"

SplashScreen.preventAutoHideAsync()

const App = () => {
	const storedAuthInfoLoaded = useAuthStore(storedAuthInfoLoadedSelector)

	const { loadAccessToken, loadIsLandingComplete } = useAuthStore(
		({ loadAccessToken, loadIsLandingComplete }) => ({
			loadAccessToken,
			loadIsLandingComplete,
		})
	)

	if (!storedAuthInfoLoaded) {
		loadAccessToken()
		loadIsLandingComplete()
	}

	return (
		<TRPCProvider>
			<SafeAreaProvider>
				<NavigationContainer>
					<AuthSwitch Authed={MainLayout} Unauthed={Landing} />
				</NavigationContainer>
			</SafeAreaProvider>
		</TRPCProvider>
	)
}

export default App
