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

const PhoneNumberPage: LandingStackScreen<"Phone"> = ({ navigation }) => {
	const [phoneNumber, setPhoneNumber] = useState("")

	const { mutate: sendOTP } = trpc.auth.sendOTP.useMutation()

	return (
		<SafeAreaView>
			<KeyboardAvoidingView>
				<Text>Please enter your phone number here</Text>
				<Pressable
					onPress={() => {
						sendOTP({ phoneNumber })
						navigation.push("OTP", { phoneNumber })
					}}
					style={{ backgroundColor: "blue", height: 50, width: 100 }}
				>
					<Text>Send OTP</Text>
				</Pressable>
			</KeyboardAvoidingView>
			<TextInput
				style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
				value={phoneNumber}
				onChangeText={setPhoneNumber}
				keyboardType="phone-pad"
				textContentType="telephoneNumber"
			></TextInput>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({})

export default PhoneNumberPage
