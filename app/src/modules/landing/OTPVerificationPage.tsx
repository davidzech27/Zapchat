import {
	Pressable,
	SafeAreaView,
	Text,
	TextInput,
	KeyboardAvoidingView,
	StyleSheet,
} from "react-native"
import { useState } from "react"
import { type LandingStackScreen } from "./Stack"
import { trpc } from "../../lib/trpc"

const OTPVerificationPage: LandingStackScreen<"OTP"> = ({ route }) => {
	const { mutate: verifyOTP } = trpc.auth.verifyOTP.useMutation()

	const [OTP, setOTP] = useState("")

	return (
		<SafeAreaView>
			<KeyboardAvoidingView>
				<Text>Your six-digit verification code:</Text>
				<Pressable
					onPress={() =>
						verifyOTP({
							phoneNumber: route.params.phoneNumber,
							OTP: parseInt(OTP),
						})
					}
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
