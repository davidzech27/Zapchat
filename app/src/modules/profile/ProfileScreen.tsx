import { FC } from "react"
import { View, Modal, Image, Pressable, Text, useWindowDimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Icon from "@expo/vector-icons/Feather"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	runOnJS,
	FadeOut,
} from "react-native-reanimated"
import { bezierEasing } from "../shared/util/easing"
import { PROFILE_PHOTOS_ENDPOINT } from "env"
import { trpc } from "../shared/lib/trpc"
import getTimeAgo from "../shared/util/getTimeAgo"
import SelfInfo from "./SelfInfo"
import WideButton from "../shared/components/WideButton"
import type { Profile } from "../shared/stores/useModalStore"

interface ProfileScreenContentProps {
	profile: Profile
	onClose: () => void
}

const ProfileScreenContent: FC<ProfileScreenContentProps> = ({ profile, onClose }) => {
	const screenHeight = useWindowDimensions().height

	const yOffset = useSharedValue(0)

	const panGesture = Gesture.Pan()
		.onUpdate(({ translationY }) => {
			yOffset.value = translationY > 0 ? translationY : 0
		})
		.onEnd(({ velocityY }) => {
			if (yOffset.value > screenHeight / 4 || velocityY > 350) {
				yOffset.value = withTiming(screenHeight, {
					easing: bezierEasing,
					duration: 500,
				})

				runOnJS(onClose)()
			} else {
				yOffset.value = withTiming(0, {
					easing: bezierEasing,
					duration: 500,
				})
			}
		})

	const yOffsetStyle = useAnimatedStyle(() => {
		return { transform: [{ translateY: yOffset.value }] }
	})

	const insets = useSafeAreaInsets()

	return (
		<GestureDetector gesture={panGesture}>
			<Animated.View
				style={[{ paddingTop: insets.top, paddingBottom: insets.bottom }, yOffsetStyle]}
				className="flex-1 items-center bg-black-background px-6 pb-4"
			>
				<Pressable
					onPress={onClose}
					style={{ paddingTop: insets.top - 6 }}
					className="absolute top-0 right-0 z-20 mr-4"
				>
					<Icon name="chevron-down" color="white" size={36} />
				</Pressable>
				<Image
					source={{ uri: `${PROFILE_PHOTOS_ENDPOINT}/${profile.username}` }}
					className="mt-20 h-64 w-64 rounded-full"
				/>
				<Text className="mt-4 text-center text-3xl font-bold text-white">
					{profile.name}
				</Text>
				<Text className="mt-1 mb-6 text-center text-[22px] font-medium text-white opacity-50">
					{profile.username}
				</Text>
				<SelfInfo />
				<View className="flex-1" />
				<WideButton
					color="purple"
					text="Edit profile"
					onPress={() => console.log("1")}
					className="z-50"
				/>
			</Animated.View>
		</GestureDetector>
	)
}

interface ProfileScreenProps {
	profile: Profile | undefined
	onClose: () => void
}

const ProfileScreen: FC<ProfileScreenProps> = ({ profile, onClose }) => {
	return (
		<Modal
			visible={profile !== undefined}
			animationType="slide"
			transparent
			onRequestClose={onClose}
			className="flex-1"
		>
			{profile && (
				<Animated.View exiting={FadeOut.duration(0).delay(300)} className="flex-1">
					<ProfileScreenContent profile={profile} onClose={onClose} />
				</Animated.View>
			)}
		</Modal>
	)
}

export default ProfileScreen
