import { Text, TextInput, View } from "react-native"
import { useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import useLandingStore from "./useLandingStore"
import useAuthStore from "../auth/useAuthStore"
import LandingScreenContainer, { type LandingScreen } from "./LandingScreen"
import ContinueButton from "./ContinueButton"
import LoadingSpinner from "../../components/LoadingSpinner"
import { trpc } from "../../lib/trpc"
import colors from "../../../colors"

// unable to position LoadingSpinner with checking text
// look for best debouncing time

const UsernameScreen: LandingScreen = ({ goToNextScreen }) => {
	const [usernameInput, setUsernameInput] = useState("")

	const [isUsernameAvailable, setIsUsernameAvailable] = useState<"yes" | "no" | "uncertain">(
		"uncertain"
	)

	const { phoneNumber } = useLandingStore(({ phoneNumber }) => ({ phoneNumber }))

	const { refetch: checkIsUserNameAvailable, isFetching: isCheckingIsUserNameAvailable } =
		trpc.landing.isUsernameAvailable.useQuery(
			{ username: usernameInput, phoneNumber: phoneNumber! },
			{
				enabled: false,
				onSuccess: (isUsernameAvailable) =>
					setIsUsernameAvailable(isUsernameAvailable ? "yes" : "no"),
			}
		)

	const queryClient = trpc.useContext()

	const debouncedCheckIsUserNameAvailable = useDebouncedCallback((shouldCheck: boolean) => {
		if (shouldCheck) checkIsUserNameAvailable()
	}, 400)

	const onChangeUsernameInput = (newUsernameInput: string) => {
		setUsernameInput(newUsernameInput.replaceAll(" ", "_"))

		if (isUsernameAvailable !== "uncertain") setIsUsernameAvailable("uncertain")

		queryClient.landing.isUsernameAvailable.cancel()

		debouncedCheckIsUserNameAvailable(
			newUsernameInput.length >= 2 && newUsernameInput.length <= 50
		)
	}

	const { mutate: createAccount, isLoading: creatingAccount } =
		trpc.landing.createAccount.useMutation()

	const setAccessToken = useAuthStore((s) => s.setAccessToken)

	const onContinue = () => {
		const { name, birthday, accountCreationToken } = useLandingStore.getState()

		createAccount(
			{
				name: name!,
				birthday: birthday!,
				username: usernameInput,
				accountCreationToken: accountCreationToken!,
			},
			{
				onSuccess: ({ accessToken }) => {
					setAccessToken(accessToken)

					goToNextScreen()
				},
			}
		)
	}

	return (
		<LandingScreenContainer backgroundColor="purple">
			<Text className="text-white-text text-lg font-bold text-center mt-6">
				Pick a username
			</Text>

			<TextInput
				value={usernameInput}
				onChangeText={onChangeUsernameInput}
				autoFocus
				autoCapitalize="none"
				autoCorrect={false}
				placeholder="Username"
				placeholderTextColor="#FFFFFF80"
				selectionColor={colors["white-selection-color"]}
				autoComplete="username-new"
				className="h-10 text-white-text text-4xl font-bold text-center mt-2.5"
			/>

			<View className="flex-1" />

			<ContinueButton
				text={
					creatingAccount ? (
						<>
							Creating account{"  "}
							<LoadingSpinner color="purple" size={22} />
						</>
					) : (
						"Continue"
					)
				}
				aboveText={
					<Text className="text-white-text">
						{
							{
								yes: "Username is available!",
								no: "Username is taken :(",
								uncertain: isCheckingIsUserNameAvailable ? (
									<>
										Checking if username is available{"  "}
										<LoadingSpinner color="white" size={16} />
									</>
								) : null,
							}[isUsernameAvailable]
						}
					</Text>
				}
				aboveTextGap={26}
				onPress={onContinue}
				disabled={isUsernameAvailable !== "yes"}
				buttonColor="white"
				raisedByKeyboard
			/>
		</LandingScreenContainer>
	)
}

export default UsernameScreen
