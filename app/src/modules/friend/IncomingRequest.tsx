import { type FC, useState } from "react"
import { View, Pressable } from "react-native"
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated"
import MainText from "../shared/components/MainText"
import UserRow from "../shared/components/UserRow"
import getTimeAgo from "../shared/util/getTimeAgo"
import { trpc } from "../shared/lib/trpc"
import ProfilePhoto from "../shared/components/ProfilePhoto"

interface IncomingRequestProps {
	name: string
	username: string
	sentAt: Date
}

const IncomingRequest: FC<IncomingRequestProps> = ({ name, username, sentAt }) => {
	const [accepted, setAccepted] = useState(false)

	const { mutate: acceptRequest } = trpc.connection.acceptRequest.useMutation({
		onMutate: () => setAccepted(true),
		onError: () => setAccepted(false),
	})

	const onAccept = () => {
		if (!accepted) {
			setAccepted(true)
			acceptRequest({ otherUsername: username })
		}
	}

	const acceptButtonPressed = useSharedValue(false)

	const acceptButtonAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					scale: acceptButtonPressed.value
						? withSpring(0.95, { stiffness: 200, mass: 0.05 })
						: withSpring(1, { stiffness: 200, mass: 0.05 }),
				},
			],
		}
	})

	const acceptButtonTextAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: acceptButtonPressed.value
				? withTiming(0.3, { duration: 100 })
				: withTiming(1, { duration: 100 }),
		}
	})

	return (
		<UserRow
			profilePhoto={<ProfilePhoto username={username} name={name} />}
			textContent={
				<View className="flex-shrink flex-col justify-between">
					<MainText numberOfLines={1}>{name}</MainText>
					<MainText numberOfLines={1} className="text-xs opacity-50">
						{username}
					</MainText>
					<MainText numberOfLines={1} className="text-xs italic opacity-50">
						{`Sent ${getTimeAgo({
							date: sentAt,
						})}`}
					</MainText>
				</View>
			}
			rightButtons={
				<Animated.View style={acceptButtonAnimatedStyle}>
					<Pressable
						onPressIn={() => {
							acceptButtonPressed.value = true
						}}
						onPressOut={() => {
							acceptButtonPressed.value = false
						}}
						onPress={onAccept}
						className="bg-dark-overlay-500 rounded-full px-5 py-1.5"
					>
						{!accepted ? (
							<MainText animated style={acceptButtonTextAnimatedStyle}>
								Accept
							</MainText>
						) : (
							<MainText className="opacity-30">Accepted</MainText>
						)}
					</Pressable>
				</Animated.View>
			}
		/>
	)
}

export default IncomingRequest
