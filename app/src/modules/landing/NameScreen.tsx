import { Text, TextInput, View } from "react-native"
import { useState } from "react"
import useLandingStore from "./useLandingStore"
import LandingScreenContainer, { type LandingScreen } from "./LandingScreen"
import useHideSplashScreen from "../auth/useHideSplashScreen"
import ContinueButton from "./ContinueButton"
import colors from "../../../colors"

const NameScreen: LandingScreen = ({ goToNextScreen }) => {
	useHideSplashScreen()

	const [nameInput, setNameInput] = useState("")

	const inputIsValid = nameInput.length >= 2 && nameInput.length <= 50

	const onContinue = () => {
		useLandingStore.setState({ name: nameInput })
		goToNextScreen()
	}

	return (
		<LandingScreenContainer first backgroundColor="purple">
			<Text className="text-white-text text-lg font-bold text-center mt-6">
				First of all, what's your name?
			</Text>

			<TextInput
				value={nameInput}
				onChangeText={setNameInput}
				autoFocus
				placeholder="Your name"
				placeholderTextColor="#FFFFFF80"
				selectionColor={colors["white-selection-color"]}
				textContentType="name"
				autoComplete="name"
				className="h-10 text-white-text text-4xl font-bold text-center mt-2.5"
			/>

			<View className="flex-1" />

			<ContinueButton
				text="Continue"
				onPress={onContinue}
				disabled={!inputIsValid}
				buttonColor="white"
				raisedByKeyboard
			/>
		</LandingScreenContainer>
	)
}

export default NameScreen
