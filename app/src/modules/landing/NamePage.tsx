import { SafeAreaView } from "react-native-safe-area-context"
import { Text, TextInput, KeyboardAvoidingView, Pressable } from "react-native"
import { useState } from "react"
import { LandingStackScreen } from "./Stack"
import useLandingStore from "./useLandingStore"

const NamePage: LandingStackScreen<"Name"> = ({ navigation }) => {
	const [nameInput, setNameInput] = useState("")

	return (
		<SafeAreaView>
			<KeyboardAvoidingView>
				<Text>Enter your name please</Text>
				<TextInput value={nameInput} onChangeText={setNameInput} />

				<Pressable
					onPress={() => {
						useLandingStore.setState({ name: nameInput })
						navigation.push("Username")
					}}
					style={{ backgroundColor: "blue", height: 50, width: 100 }}
				>
					<Text>Next</Text>
				</Pressable>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

export default NamePage
