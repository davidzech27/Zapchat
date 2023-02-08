import { useState, useEffect, type FC } from "react"
import { View } from "react-native"
import { useSharedValue } from "react-native-reanimated"
import useLandingStore from "./shared/useLandingStore"
import useAuthStore from "../auth/useAuthStore"
import NameScreen from "./NameScreen"
import BirthdayScreen from "./BirthdayScreen"
import PhoneNumberScreen from "./PhoneNumberScreen"
import OTPVerificationScreen from "./OTPVerificationScreen"
import UsernameScreen from "./UsernameScreen"
import ProfilePhotoScreen from "./ProfilePhotoScreen"

const Landing: FC = () => {
	const hasAccessToken = useAuthStore(({ accessToken }) => accessToken !== "")

	const firstRouteIndex = hasAccessToken ? 5 : 0 //! don't let this fall out of sync with screens

	const [routeIndex, setRouteIndex] = useState(firstRouteIndex)

	const navigatingForward = useSharedValue(true)

	useEffect(() => {
		useLandingStore.setState({ navigatingForward })
	}, [])

	const goToNextScreen = () => {
		navigatingForward.value = true

		setRouteIndex((prev) => prev + 1)
	}

	const goToPreviousScreen = () => {
		navigatingForward.value = false

		setRouteIndex((prev) => prev - 1)
	}

	const reset = () => setRouteIndex(0)

	const CurrentScreen = [
		NameScreen,
		BirthdayScreen,
		PhoneNumberScreen,
		OTPVerificationScreen,
		UsernameScreen,
		ProfilePhotoScreen,
	][routeIndex]

	return (
		<View className="flex-1 bg-purple-background">
			<CurrentScreen
				goToNextScreen={goToNextScreen}
				goToPreviousScreen={goToPreviousScreen}
				reset={reset}
			/>
		</View>
	)
}

export default Landing
