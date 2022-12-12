import {
	Pressable,
	SafeAreaView,
	Text,
	TextInput,
	KeyboardAvoidingView,
	StyleSheet,
} from "react-native"
import { useState, useCallback } from "react"
import { type LandingStackScreen } from "./Stack"
import { trpc } from "../../lib/trpc"
import useLandingStore from "./useLandingStore"

const OTPVerificationPage: LandingStackScreen<"OTP"> = ({ navigation }) => {
	const { mutate: verifyOTP } = trpc.landing.verifyOTP.useMutation()

	const [OTP, setOTP] = useState("")

	const phoneNumber = useLandingStore(useCallback((s) => s.phoneNumber, []))

	return (
		<SafeAreaView>
			<KeyboardAvoidingView>
				<Text>Your six-digit verification code:</Text>
				<Pressable
					onPress={() => {
						verifyOTP(
							{
								phoneNumber: phoneNumber!,
								OTP: parseInt(OTP),
							},
							{
								onSuccess: ({ accountCreationToken }) =>
									useLandingStore.setState({ accountCreationToken }),
							}
						)
						navigation.push("Name")
					}}
					style={{ backgroundColor: "blue", height: 50, width: 100 }}
				>
					<Text>Verify OTP</Text>
				</Pressable>
			</KeyboardAvoidingView>
			<TextInput
				style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
				value={OTP}
				onChangeText={setOTP}
				keyboardType="number-pad"
				textContentType="oneTimeCode"
			></TextInput>
		</SafeAreaView>
	)
}

export default OTPVerificationPage
