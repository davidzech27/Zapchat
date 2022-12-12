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
import useLandingStore from "./useLandingStore"

const PhoneNumberPage: LandingStackScreen<"Phone"> = ({ navigation }) => {
	const [phoneNumberInput, setPhoneNumberInput] = useState("")

	const { mutate: sendOTP } = trpc.landing.sendOTP.useMutation()

	return (
		<SafeAreaView>
			<KeyboardAvoidingView>
				<Text>Please enter your phone number here</Text>
				<Pressable
					onPress={() => {
						const phoneNumber = parseInt(phoneNumberInput.replaceAll(/\D/g, ""))
						sendOTP({ phoneNumber })
						useLandingStore.setState({ phoneNumber })
						navigation.push("OTP")
					}}
					style={{ backgroundColor: "blue", height: 50, width: 100 }}
				>
					<Text>Send OTP</Text>
				</Pressable>
			</KeyboardAvoidingView>
			<TextInput
				style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
				value={phoneNumberInput}
				onChangeText={setPhoneNumberInput}
				keyboardType="phone-pad"
				textContentType="telephoneNumber"
			></TextInput>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({})

export default PhoneNumberPage
