import { Fragment, useState, type FC } from "react"
import { Modal, View, Pressable, Text, useWindowDimensions, Image } from "react-native"
import Animated, {
	FadeOut,
	useSharedValue,
	runOnJS,
	withTiming,
	useAnimatedStyle,
	FadeIn,
} from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import type { Choice } from "../shared/stores/useModalStore"
import { bezierEasing } from "../shared/util/easing"
import WideButton from "../shared/components/WideButton"
import ChatInput from "./ChatInput"
import Icon from "@expo/vector-icons/Feather"
import ScreenSwiper from "../layout/ScreenSwiper"
import { PROFILE_PHOTOS_ENDPOINT } from "env"

interface PickingContentProps {
	choices: Choice[]
	onClose: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const PickingContent: FC<PickingContentProps> = ({ choices, onClose }) => {
	const [chatInputOpen, setChatInputOpen] = useState(false)

	const screenHeight = useWindowDimensions().height

	const yOffset = useSharedValue(0)

	const panGesture = Gesture.Pan()
		.onUpdate(({ translationY }) => {
			yOffset.value = translationY > 0 ? translationY : 0

			runOnJS(() => setChatInputOpen(false))()
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

	const [focusedChoice, setFocusedChoice] = useState(choices[0])

	const insets = useSafeAreaInsets()

	return (
		<GestureDetector gesture={panGesture}>
			<Animated.View
				style={[{ paddingTop: insets.top, paddingBottom: insets.bottom }, yOffsetStyle]}
				className="flex-1 bg-purple-background"
			>
				{!chatInputOpen && (
					<AnimatedPressable
						onPress={onClose}
						entering={FadeIn.duration(250)}
						exiting={FadeOut.duration(250)}
						style={{ paddingTop: insets.top - 6 }}
						className="absolute top-0 right-0 z-20 mr-4"
					>
						<Icon name="chevron-down" color="white" size={36} />
					</AnimatedPressable>
				)}

				<ScreenSwiper
					onIndexChange={(newIndex) => setFocusedChoice(choices[newIndex])}
					initialIndex={0}
				>
					{choices.map((choice) => (
						<View key={choice.username} className="flex-1 items-center px-6 pb-4">
							<Image
								source={{
									uri: `https://avatars.dicebear.com/api/initials/${choice.name
										.split(" ")
										.map((namePart) => namePart[0])
										.join("")}.jpg?backgroundColorLevel=700&fontSize=42`,
								}}
								className="mt-20 h-64 w-64 rounded-full"
							/>

							<View className="absolute top-[78px] h-[260px] w-[260px] rounded-full border-[5px] border-white" />

							<Text className="mt-4 text-center text-3xl font-bold text-white">
								{choice.name}
							</Text>
							<Text className="mt-1 mb-6 text-center text-[22px] font-medium text-white opacity-100">
								{choice.username}
							</Text>

							<View className="flex-1" />

							<WideButton
								color="white"
								text="Chat"
								onPress={() => setChatInputOpen(true)}
								className="z-50"
							/>
						</View>
					))}
				</ScreenSwiper>

				<ChatInput
					onSubmit={() => {}}
					open={chatInputOpen}
					onClose={() => setChatInputOpen(false)}
					placeholder={`Send ${focusedChoice?.name} a chat`}
				/>
			</Animated.View>
		</GestureDetector>
	)
}

interface PickingScreenProps {
	choices: Choice[] | undefined
	onClose: () => void
}

const PickingScreen: FC<PickingScreenProps> = ({ choices, onClose }) => {
	return (
		<Modal
			animationType="slide"
			transparent
			visible={choices !== undefined}
			onRequestClose={onClose}
			className="flex-1"
		>
			{choices !== undefined && (
				// used so that ChatContent can be removed from dom before invisible because it needs to be removed before conversationId is undefined
				<Animated.View exiting={FadeOut.duration(0).delay(300)} className="flex-1">
					<PickingContent choices={choices} onClose={onClose} />
				</Animated.View>
			)}
		</Modal>
	)
}

export default PickingScreen
