import { type FC } from "react"
import { View, Text, Pressable } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import useModalStore, { type Chat } from "../shared/stores/useModalStore"
import clsx from "clsx"
import getTimeAgo from "../shared/util/getTimeAgo"
import UserRow from "../shared/components/UserRow"
import ProfilePhoto, { InvisibleProfilePhoto } from "../shared/components/ProfilePhoto"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"
import colors from "../../../colors"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const Conversation: FC<Chat> = ({
	id,
	name,
	username,
	createdAt,
	chooseePresence,
	identified,
	type,
}) => {
	const { openChat } = useModalStore(({ openChat }) => ({ openChat }))

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
			onPress={() =>
				openChat({ id, name, username, createdAt, chooseePresence, identified, type })
			}
			onPressIn={() => (pressed.value = true)}
			onPressOut={() => (pressed.value = false)}
			style={pressedStyle}
		>
			<UserRow
				profilePhoto={
					username !== undefined && name !== undefined ? (
						<ProfilePhoto username={username} name={name} dark={type === "asChooser"} />
					) : (
						<InvisibleProfilePhoto />
					)
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
							{chooseePresence !== undefined && chooseePresence !== null ? (
								<>Last on chat {getTimeAgo({ date: chooseePresence })}</>
							) : (
								<>Chat began {getTimeAgo({ date: createdAt })}</>
							)}
						</Text>
					</View>
				}
				rightButtons={<></>}
			/>
		</AnimatedPressable>
	)
}

export default Conversation
