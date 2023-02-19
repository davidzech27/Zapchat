import { Text, TextInput, View } from "react-native"
import { useState, useEffect } from "react"
import useLandingStore from "./shared/useLandingStore"
import LandingScreenContainer, { type LandingScreen } from "./shared/LandingScreen"
import ContinueButton from "./shared/ContinueButton"
import PressableText from "../shared/components/PressableText"
import LoadingSpinner from "../shared/components/LoadingSpinner"
import { trpc } from "../shared/lib/trpc"
import colors from "../../../colors"
import LandingContants from "../../../../trpc/src/modules/landing/constants"
import showErrorAlert from "../shared/util/showErrorAlert"

const { RESEND_COOLDOWN_SECONDS } = LandingContants
// todo - handle errors and loading and state while verifying
//* consider using a TextInput with an underline for each digit
const OTPVerificationScreen: LandingScreen = ({ goToNextScreen, goToPreviousScreen }) => {
	const { mutate: verifyOTP, isLoading: isVerifyingOTP } = trpc.landing.verifyOTP.useMutation({
		onError: ({ message }) => showErrorAlert(message),
	})

	const setAccountCreationToken = useLandingStore((s) => s.setAccountCreationToken)

	const [OTPInput, setOTPInput] = useState("")

	const onChangeOTPInput = (newOTPInput: string) => {
		setOTPInput(newOTPInput.slice(0, 6))

		if (newOTPInput.length >= 6 && !isVerifyingOTP) {
			verifyOTP(
				{
					OTP: parseInt(newOTPInput.slice(0, 6)),
					phoneNumber: useLandingStore.getState().phoneNumber!,
				},
				{
					onSuccess: ({ accountCreationToken }) => {
						setAccountCreationToken(accountCreationToken)

						goToNextScreen()
					},
				}
			)
		}
	}

	const [secondsUntilCanResend, setSecondsUntilCanResend] = useState(RESEND_COOLDOWN_SECONDS)

	useEffect(() => {
		if (secondsUntilCanResend !== 0) {
			const timeoutId = setTimeout(() => setSecondsUntilCanResend((prev) => prev - 1), 1000)

			return () => {
				clearInterval(timeoutId)
			}
		}
	}, [secondsUntilCanResend])

	const { mutate: sendOTP } = trpc.landing.sendOTP.useMutation({
		onError: ({ message }) => showErrorAlert(message),
	})

	const onResend = () => {
		const { phoneNumber } = useLandingStore.getState()

		sendOTP({ phoneNumber: phoneNumber! })

		setSecondsUntilCanResend(RESEND_COOLDOWN_SECONDS)
	}

	const phoneNumberString = useLandingStore().phoneNumber!.toString()

	const lengthOfCountryCode = phoneNumberString?.length - 10

	const phoneNumberFormatted = `+${phoneNumberString.slice(
		0,
		lengthOfCountryCode
	)} (${phoneNumberString.slice(
		lengthOfCountryCode,
		lengthOfCountryCode + 3
	)}) ${phoneNumberString.slice(
		lengthOfCountryCode + 3,
		lengthOfCountryCode + 6
	)}-${phoneNumberString.slice(lengthOfCountryCode + 6, lengthOfCountryCode + 10)}`

	return (
		<LandingScreenContainer backgroundColor="black">
			<Text className="mt-2.5 text-center text-lg font-bold text-white-text">
				Enter the code we sent you{"\n"}at {phoneNumberFormatted}
			</Text>
			<TextInput
				value={OTPInput}
				onChangeText={onChangeOTPInput}
				autoFocus
				placeholder="••••••"
				placeholderTextColor="#FFFFFF4C"
				maxLength={6}
				selectionColor={colors["purple-text"]} // consider white
				keyboardType="number-pad"
				textContentType="oneTimeCode"
				autoComplete="sms-otp"
				className="h-10 text-4xl font-bold text-white-text"
			/>

			<View className="flex-1" />

			<ContinueButton
				text={
					isVerifyingOTP ? (
						<>
							Verifying{"  "}
							<LoadingSpinner color="white" size={22} />
						</>
					) : secondsUntilCanResend !== 0 ? (
						`Resend in ${secondsUntilCanResend}s`
					) : (
						"Send a new code"
					)
				}
				aboveText={
					<PressableText
						onPress={goToPreviousScreen}
						opacity={0.5}
						textProps={{
							style: { color: colors["purple-text"] },
						}}
					>
						Use another phone number
					</PressableText>
				}
				aboveTextGap={26}
				onPress={onResend}
				disabled={secondsUntilCanResend !== 0}
				buttonColor="purple"
				raisedByKeyboard
			/>
		</LandingScreenContainer>
	)
}

export default OTPVerificationScreen
