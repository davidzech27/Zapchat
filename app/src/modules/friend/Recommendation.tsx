import { type FC } from "react"
import { View, Pressable } from "react-native"
import { AntDesign } from "@expo/vector-icons"
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withSpring,
	withTiming,
} from "react-native-reanimated"
import MainText from "../../components/MainText"
import UserRow from "../shared/components/UserRow"
import { trpc } from "../shared/lib/trpc"
import ProfilePhoto from "../shared/components/ProfilePhoto"

interface RecommendationProps {
	name: string
	username: string
	joinedOn: Date
	requested: boolean
}

const Recommendation: FC<RecommendationProps> = ({ name, username, requested }) => {
	const queryClient = trpc.useContext()

	const { mutate: sendRequest } = trpc.connection.sendRequest.useMutation({
		onMutate: async () => {
			await queryClient.connection.outgoingRequests.cancel()

			const previousOutgoingRequests = queryClient.connection.outgoingRequests.getData()

			queryClient.connection.outgoingRequests.setData(
				undefined,
				(prev) => prev && new Set([...Array.from(prev), username])
			)

			return { previousOutgoingRequests }
		},
		onError: (_, __, context) => {
			queryClient.connection.outgoingRequests.setData(
				undefined,
				context?.previousOutgoingRequests
			)
		},
	})

	const { mutate: unsendRequest } = trpc.connection.unsendRequest.useMutation({
		onMutate: async () => {
			await queryClient.connection.outgoingRequests.cancel()

			const previousOutgoingRequests = queryClient.connection.outgoingRequests.getData()

			queryClient.connection.outgoingRequests.setData(
				undefined,
				(prev) =>
					prev &&
					new Set(
						Array.from(prev).filter((requestUsername) => requestUsername !== username)
					)
			)

			return { previousOutgoingRequests }
		},
		onError: (_, __, context) => {
			queryClient.connection.outgoingRequests.setData(
				undefined,
				context?.previousOutgoingRequests
			)
		},
	})

	const onAdd = () => {
		if (!requested) {
			sendRequest({ otherUsername: username })
		} else {
			unsendRequest({ otherUsername: username })
		}
	}

	const addButtonPressed = useSharedValue(false)

	const addButtonAnimatedStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					scale: addButtonPressed.value
						? withSpring(0.95, { stiffness: 200, mass: 0.05 })
						: withSpring(1, { stiffness: 200, mass: 0.05 }),
				},
			],
		}
	})

	const addButtonTextAnimatedStyle = useAnimatedStyle(() => {
		return {
			opacity: addButtonPressed.value
				? withTiming(0.3, { duration: 100 })
				: withTiming(1, { duration: 100 }),
		}
	})

	return (
		<Pressable
			style={({ pressed }) => ({
				backgroundColor: pressed ? "#00000011" : undefined,
				borderRadius: 16,
				marginHorizontal: 4,
			})}
		>
			<UserRow
				profilePhoto={<ProfilePhoto username={username} name={name} />}
				textContent={
					<View className="flex-shrink flex-col justify-between py-1.5">
						<MainText numberOfLines={1}>{name}</MainText>

						<MainText numberOfLines={1} className="text-xs opacity-50">
							{username}
						</MainText>
					</View>
				}
				rightButtons={
					<View className="flex-row space-x-2">
						<Animated.View style={addButtonAnimatedStyle}>
							<Pressable
								onPressIn={() => {
									addButtonPressed.value = true
								}}
								onPressOut={() => {
									addButtonPressed.value = false
								}}
								onPress={onAdd}
								className="bg-primary-500 items-center rounded-full px-5 py-1.5"
							>
								{!requested ? (
									<MainText light animated style={addButtonTextAnimatedStyle}>
										Add
									</MainText>
								) : (
									<MainText light className="opacity-30">
										Added
									</MainText>
								)}
							</Pressable>
						</Animated.View>
						<Pressable className="h-5 self-center opacity-30">
							<AntDesign name="close" size={20} color="black" />
						</Pressable>
						{/* //! won't do anything until backend is capable of remembering hidden recommendations */}
					</View>
				}
			/>
		</Pressable>
	)
}

export default Recommendation
