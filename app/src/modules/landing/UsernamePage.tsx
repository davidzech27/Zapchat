import { SafeAreaView } from "react-native-safe-area-context"
import { Text, TextInput, KeyboardAvoidingView, Pressable } from "react-native"
import { useState, useCallback } from "react"
import { LandingStackScreen } from "./Stack"
import useLandingStore from "./useLandingStore"
import useAuthStore from "../auth/useAuthStore"
import { trpc } from "../../lib/trpc"

const UsernamePage: LandingStackScreen<"Username"> = ({ navigation }) => {
	const { mutate: createAccount } = trpc.landing.createAccount.useMutation()

	const [usernameInput, setUsernameInput] = useState("")

	const { accountCreationToken, name } = useLandingStore(
		useCallback(
			({ accountCreationToken, name }) => ({
				accountCreationToken,
				name,
			}),
			[]
		)
	)

	const { setAccessToken } = useAuthStore(
		useCallback(({ setAccessToken }) => ({ setAccessToken }), [])
	)

	return (
		<SafeAreaView>
			<KeyboardAvoidingView>
				<Text>Enter your username please</Text>
				<TextInput value={usernameInput} onChangeText={setUsernameInput} />

				<Pressable
					onPress={() => {
						useLandingStore.setState({ username: usernameInput })
						createAccount(
							{
								accountCreationToken: accountCreationToken!,
								name: name!,
								username: usernameInput,
							},
							{
								onSuccess: ({ accessToken }) => {
									setAccessToken(accessToken)
								},
							}
						)
					}}
					style={{ backgroundColor: "blue", height: 50, width: 100 }}
				>
					<Text>Create account</Text>
				</Pressable>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

export default UsernamePage
