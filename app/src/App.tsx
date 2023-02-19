import "react-native-gesture-handler"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import * as SplashScreen from "expo-splash-screen"
import { TRPCProvider } from "./modules/shared/lib/trpc"
import AuthSwitch from "./modules/auth/AuthSwitch"
import useAuthStore, { authLoadedSelector } from "./modules/auth/useAuthStore"
import useProfileStore, { profileLoadedSelector } from "./modules/profile/useProfileStore"
import Landing from "./modules/landing/Landing"
import MainLayout from "./modules/layout/MainLayout"

SplashScreen.preventAutoHideAsync()

const App = () => {
	const authLoaded = useAuthStore(authLoadedSelector)

	const { loadAccessToken, loadIsLandingComplete } = useAuthStore(
		({ loadAccessToken, loadIsLandingComplete }) => ({
			loadAccessToken,
			loadIsLandingComplete,
		})
	)

	if (!authLoaded) {
		loadAccessToken()
		loadIsLandingComplete()
	}

	const profileLoaded = useProfileStore(profileLoadedSelector)

	const profile = useProfileStore((s) => s.profile)

	const { loadProfile } = useProfileStore(({ loadProfile }) => ({
		loadProfile,
	}))

	if (!profileLoaded) {
		loadProfile()
	}

	return (
		<TRPCProvider>
			<SafeAreaProvider>
				<NavigationContainer>
					<AuthSwitch
						Authed={() => <MainLayout profile={profile!} />} // relies on this component not rendering until profile is loaded and that profile is not null when landing is complete. perhaps a leaky abstraction
						Unauthed={Landing}
					/>
				</NavigationContainer>
			</SafeAreaProvider>
		</TRPCProvider>
	)
}

export default App
