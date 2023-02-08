import { useState, useEffect } from "react"
import { View, Image, Text } from "react-native"
import * as ImagePicker from "expo-image-picker"
import Icon from "@expo/vector-icons/MaterialIcons"
import LandingScreenContainer, { type LandingScreen } from "./shared/LandingScreen"
import useHideSplashScreen from "../../shared/hooks/useHideSplashScreen"
import ContinueButton from "./shared/ContinueButton"
import PressableText from "../../shared/components/PressableText"
import useAuthStore from "../auth/useAuthStore"
import useLandingStore from "./shared/useLandingStore"
import uploadProfilePhoto from "../profile/uploadProfilePhoto"
import { trpc } from "../../shared/lib/trpc"
import colors from "../../../colors"

// still need to handle android errors

const imagePickerOptions: ImagePicker.ImagePickerOptions = {
	mediaTypes: ImagePicker.MediaTypeOptions.Images,
	allowsEditing: true,
	aspect: [1, 1],
	quality: 0.2,
}

const ProfilePhotoScreen: LandingScreen = () => {
	useHideSplashScreen()

	const [chosenPhoto, setChosenPhoto] = useState<ImagePicker.ImagePickerAsset | undefined>()

	const [status, requestPermission] = ImagePicker.useCameraPermissions()

	useEffect(() => {
		const retrieveLostPhoto = async () => {
			const [result] = (await ImagePicker.getPendingResultAsync()) as [
				ImagePicker.ImagePickerResult
			]

			if (result && !result.canceled && result.assets && result.assets[0]) {
				setChosenPhoto(result.assets[0])
			}
		}

		retrieveLostPhoto()
	}, [])

	const onUseCamera = async () => {
		if (!status?.granted) {
			const { granted } = await requestPermission()

			if (!granted) return
		}

		const result = await ImagePicker.launchCameraAsync(imagePickerOptions)

		if (!result.canceled) {
			setChosenPhoto(result.assets[0])
		}
	}

	const onUseLibrary = async () => {
		const result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions)

		if (!result.canceled) {
			setChosenPhoto(result.assets[0])
		}
	}

	const { mutate: useDefaultProfilePhoto } = trpc.profile.useDefaultProfilePhoto.useMutation()

	const completeLanding = useAuthStore((s) => s.completeLanding)

	const onSkip = () => {
		useDefaultProfilePhoto({ name: useLandingStore.getState().name! })

		completeLanding()
	}

	const onContinue = () => {
		try {
			uploadProfilePhoto(chosenPhoto!)
		} catch (err) {
			console.log(err)
		}

		completeLanding()
	}

	const onChangePhoto = () => setChosenPhoto(undefined)

	const hasChosenPhoto = Boolean(chosenPhoto)

	return (
		<LandingScreenContainer last backgroundColor="purple">
			<Text className="mt-6 text-center text-lg font-bold text-white-text">
				Add a profile photo
			</Text>

			<View className="flex-1 justify-center pb-[0px]">
				{chosenPhoto ? (
					<Image source={{ uri: chosenPhoto.uri }} className="h-56 w-56 rounded-full" />
				) : (
					<View className="h-56 w-56 items-center justify-center rounded-full bg-[#FFFFFF20]">
						<Icon name="camera-alt" size={124} color={"#FFFFFF86"} />
					</View>
				)}
			</View>

			{hasChosenPhoto && <View className="h-[78px]" />}

			<ContinueButton
				aboveText={
					<PressableText
						onPress={hasChosenPhoto ? onChangePhoto : onSkip}
						opacity={0.5}
						textProps={{
							style: { color: colors["white-text"], fontSize: 18, fontWeight: "700" },
						}}
					>
						{hasChosenPhoto ? "Change photo" : "Skip"}
					</PressableText>
				}
				aboveTextGap={23}
				outlineButton={
					hasChosenPhoto
						? undefined
						: {
								text: "Choose from camera roll",
								onPress: onUseLibrary,
								disabled: false,
						  }
				}
				text={hasChosenPhoto ? "Continue" : "Take a photo"}
				onPress={hasChosenPhoto ? onContinue : onUseCamera}
				disabled={false}
				buttonColor="white"
			/>
		</LandingScreenContainer>
	)
}

export default ProfilePhotoScreen
