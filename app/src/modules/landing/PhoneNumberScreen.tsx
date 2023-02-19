import { Text, TextInput, View } from "react-native"
import { useState, useRef } from "react"
import { parsePhoneNumber } from "libphonenumber-js/mobile"
import useLandingStore from "./shared/useLandingStore"
import LandingScreenContainer, { type LandingScreen } from "./shared/LandingScreen"
import ContinueButton from "./shared/ContinueButton"
import { trpc } from "../shared/lib/trpc"
import colors from "../../../colors"
import showErrorAlert from "../shared/util/showErrorAlert"

const PhoneNumberScreen: LandingScreen = ({ goToNextScreen }) => {
	const [phoneNumberInput, setPhoneNumberInput] = useState("")
	const [countryCodeInput, setCountryCodeInput] = useState("+1")

	const [inputIsValid, setInputIsValid] = useState(false)

	const onChangePhoneNumberInput = (newPhoneNumberInput: string) => {
		setPhoneNumberInput(newPhoneNumberInput)

		if (newPhoneNumberInput.replaceAll(/\D/g, "").length === 10) {
			newPhoneNumberInput = `${countryCodeInput}${newPhoneNumberInput}`
		}

		newPhoneNumberInput = `+${newPhoneNumberInput.replaceAll(/\D/g, "")}`

		try {
			const phoneNumber = parsePhoneNumber(newPhoneNumberInput)

			if (
				phoneNumber &&
				phoneNumber.isValid() &&
				phoneNumber.countryCallingCode === countryCodeInput.slice(1)
			) {
				if (!inputIsValid) setInputIsValid(true)

				return
			}
		} catch {}

		if (inputIsValid) setInputIsValid(false)
	}

	const onChangeCountryCodeInput = (newCountryCodeInput: string) => {
		setCountryCodeInput(
			newCountryCodeInput.startsWith("+")
				? newCountryCodeInput.slice(0, 4)
				: `+${newCountryCodeInput.replaceAll("+", "").slice(0, 3)}`
		)
	}

	const { mutate: sendOTP } = trpc.landing.sendOTP.useMutation({
		onError: ({ message }) => showErrorAlert(message),
	})

	const onContinue = () => {
		let phoneNumberString = phoneNumberInput.replaceAll(/\D/g, "")

		if (phoneNumberString.length === 10) {
			phoneNumberString = `${countryCodeInput.slice(1)}${phoneNumberString}`
		}

		const phoneNumber = parseInt(phoneNumberString)

		useLandingStore.setState({ phoneNumber })

		sendOTP({ phoneNumber })

		goToNextScreen()
	}

	return (
		<LandingScreenContainer backgroundColor="purple">
			<Text className="mt-2.5 text-center text-lg font-bold text-white-text">
				Now, please enter your{"\n"}phone number.
			</Text>
			<View className="flex-1 flex-row">
				<View className="bottom-[0.5px] mr-3 h-10 w-16 items-center justify-center rounded-full border-[1.5px] border-white-background">
					<TextInput
						value={countryCodeInput}
						onChangeText={onChangeCountryCodeInput}
						selectTextOnFocus
						selectionColor={colors["white-selection-color"]}
						keyboardType="number-pad"
						autoComplete="tel-country-code"
						className="bottom-1.5 text-lg text-white-text"
					/>
				</View>

				<TextInput
					value={phoneNumberInput}
					onChangeText={onChangePhoneNumberInput}
					autoFocus
					placeholder="Your number"
					placeholderTextColor="#FFFFFF80"
					selectionColor={colors["white-selection-color"]}
					keyboardType="phone-pad"
					textContentType="telephoneNumber"
					autoComplete="tel-national"
					style={{
						fontSize: phoneNumberInput.length < 14 ? 36 : 29,
					}}
					className="h-10 flex-1 font-bold text-white-text"
				/>
			</View>

			<ContinueButton
				text="Send verification code"
				onPress={onContinue}
				disabled={!inputIsValid}
				buttonColor="white"
				raisedByKeyboard
			/>
		</LandingScreenContainer>
	)
}

export default PhoneNumberScreen
