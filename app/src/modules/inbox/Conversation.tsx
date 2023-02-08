import { type FC } from "react"
import { View, Text, Pressable } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import useChatStore from "../chat/useChatStore"
import Chat from "../chat/Chat"
import clsx from "clsx"
import getTimeAgo from "../../shared/util/getTimeAgo"
import UserRow from "../../shared/components/UserRow"
import ProfilePhoto from "../../shared/components/ProfilePhoto"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import colors from "../../../colors"

interface ConversationProps {
	id: number
	name?: string
	username?: string
	createdOn: Date
	type: "asChooser" | "asChoosee"
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const Conversation: FC<ConversationProps> = ({ id, name, username, createdOn, type }) => {
	const { openChat } = useChatStore(({ openChat }) => ({ openChat }))

	const newNotification = false // ! will be used later

	const pressed = useSharedValue(false)

	const pressedStyle = useAnimatedStyle(() => {
		return {
			backgroundColor:
				type === "asChooser"
					? withTiming(pressed.value ? colors["overlay-on-dark"] : "#00000000", {
							duration: 75,
					  })
					: withTiming(pressed.value ? colors["overlay-on-light-darker"] : "#FFFFFF00", {
							duration: 75,
					  }),
		}
	}, [type])

	return (
		<AnimatedPressable
			onPress={() => openChat({ id, type: "asChooser", name, username, createdOn })}
			onPressIn={() => (pressed.value = true)}
			onPressOut={() => (pressed.value = false)}
			style={pressedStyle}
		>
			<UserRow
				profilePhoto={
					<ProfilePhoto username={username} name={name} dark={type === "asChooser"} />
				}
				textContent={
					<View className="flex-shrink flex-col justify-between py-2">
						<Text
							numberOfLines={1}
							className={clsx(
								type === "asChooser" ? "text-white-text" : "text-black-text",
								newNotification && "font-medium"
							)}
						>
							{name}
						</Text>

						<Text
							numberOfLines={1}
							className={clsx(
								"text-xs",
								type === "asChooser"
									? "text-white-text opacity-sub-text-on-black-background"
									: "text-black-text opacity-sub-text-on-white-background-darker",
								newNotification && "font-medium"
							)}
						>
							Chat began {getTimeAgo({ date: createdOn })}
						</Text>
					</View>
				}
				rightButtons={<></>}
			/>
		</AnimatedPressable>
	)
}

export default Conversation
