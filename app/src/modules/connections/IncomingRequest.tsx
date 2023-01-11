import { type FC, useState } from "react"
import { View, Pressable } from "react-native"
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated"
import MainText from "../../components/MainText"
import UserRow from "../../components/UserRow"
import useTimeAgo from "../../hooks/useTimeAgo"
import { trpc } from "../../lib/trpc"
import ProfilePhoto from "../../components/ProfilePhoto"

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
				<View className="flex-col justify-between flex-shrink">
					<MainText numberOfLines={1}>{name}</MainText>
					<MainText numberOfLines={1} className="opacity-50 text-xs">
						{username}
					</MainText>
					<MainText numberOfLines={1} className="opacity-50 text-xs italic">
						{`Sent ${useTimeAgo({
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
						className="px-5 py-1.5 bg-dark-overlay-500 rounded-full"
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
