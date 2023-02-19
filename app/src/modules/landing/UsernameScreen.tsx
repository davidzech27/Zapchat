import { Text, TextInput, View } from "react-native"
import { useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import useLandingStore from "./shared/useLandingStore"
import useAuthStore from "../auth/useAuthStore"
import useProfileStore from "../profile/useProfileStore"
import LandingScreenContainer, { type LandingScreen } from "./shared/LandingScreen"
import ContinueButton from "./shared/ContinueButton"
import LoadingSpinner from "../shared/components/LoadingSpinner"
import { trpc } from "../shared/lib/trpc"
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

	const setProfile = useProfileStore((s) => s.setProfile)

	const onContinue = () => {
		const { name, accountCreationToken } = useLandingStore.getState()

		createAccount(
			{
				name: name!,
				username: usernameInput,
				accountCreationToken: accountCreationToken!,
			},
			{
				onSuccess: ({ accessToken, joinedOn }) => {
					setAccessToken(accessToken)

					setProfile({
						name: name!,
						username: usernameInput,
						joinedOn,
					})

					goToNextScreen()
				},
			}
		)
	}

	return (
		<LandingScreenContainer backgroundColor="purple">
			<Text className="mt-6 text-center text-lg font-bold text-white-text">
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
				className="mt-2.5 h-10 text-center text-4xl font-bold text-white-text"
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
