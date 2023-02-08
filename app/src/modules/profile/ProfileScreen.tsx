import { FC } from "react"
import { View, Modal, Image, Pressable, Text } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Animated, { FadeOut } from "react-native-reanimated"
import Icon from "@expo/vector-icons/Feather"
import { PROFILE_PHOTOS_ENDPOINT } from "env"
import { trpc } from "../../shared/lib/trpc"
import getTimeAgo from "../../shared/util/getTimeAgo"
import WideButton from "../../shared/components/WideButton"

interface ProfileScreenContentProps {
	profile: {
		username: string
		name: string
	}
	type: "self" | "friend" | "unknown"
	onClose: () => void
}

const ProfileScreenContent: FC<ProfileScreenContentProps> = ({ profile, type, onClose }) => {
	let userStats: { joinedOn?: Date } = {
		self: () => {
			let data = trpc.profile.me.useQuery().data

			return { joinedOn: data?.self.joinedOn }
		},
		friend: () => {
			let data = trpc.profile.me.useQuery().data

			return {
				joinedOn: data?.friends.find((friend) => friend.username === profile.username)
					?.joinedOn,
			}
		},
		unknown: () => {
			// return { // todo
			// 	joinedOn: data?.friends.find((friend) => friend.username === username)?.joinedOn,
			// }

			return {}
		},
	}[type]()

	const insets = useSafeAreaInsets()

	return (
		<View className="flex-1 bg-black-background">
			<View className="flex-1">
				<Pressable
					onPress={onClose}
					style={{ paddingTop: insets.top - 6 }}
					className="absolute top-0 right-0 z-20 mr-4"
				>
					<Icon name="chevron-down" color="white" size={36} />
				</Pressable>

				<LinearGradient
					colors={["#000000F8", "#00000000"]}
					className="absolute top-0 left-0 right-0 z-10 h-24"
					onStartShouldSetResponder={() => false}
					onMoveShouldSetResponder={() => false}
					onStartShouldSetResponderCapture={() => false}
					onMoveShouldSetResponderCapture={() => false}
				/>

				<Image
					source={{ uri: `${PROFILE_PHOTOS_ENDPOINT}/${profile.username}` }}
					className="flex-1"
				/>

				<LinearGradient
					colors={["#00000000", "#000000F8"]}
					className="absolute bottom-0 left-0 right-0 z-10 h-44"
					onStartShouldSetResponder={() => false}
					onMoveShouldSetResponder={() => false}
					onStartShouldSetResponderCapture={() => false}
					onMoveShouldSetResponderCapture={() => false}
				/>
			</View>

			<View className="flex-1">
				<View className="absolute -top-16 z-20 w-full">
					<Text className="bottom-1 ml-9 text-3xl font-bold text-white">
						{profile.name}
					</Text>
					<Text className="bottom-1.5 ml-9 text-lg font-medium text-white">
						{profile.username}
					</Text>
					{userStats && userStats.joinedOn && (
						<Text className="bottom-2 ml-9 text-lg font-medium text-white opacity-70">
							Joined {getTimeAgo({ date: userStats.joinedOn })}
						</Text>
					)}

					<WideButton
						color="darker-purple"
						text="Edit profile"
						onPress={() => console.log("1")}
						className="z-50 mx-6 h-[72px]"
					/>
				</View>
			</View>
		</View>
	)
}

interface ProfileScreenProps {
	profile:
		| {
				username: string
				name: string
		  }
		| undefined
	type: "self" | "friend" | "unknown"
	onClose: () => void
}

const ProfileScreen: FC<ProfileScreenProps> = ({ profile, type, onClose }) => {
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
					<ProfileScreenContent profile={profile} type={type} onClose={onClose} />
				</Animated.View>
			)}
		</Modal>
	)
}

export default ProfileScreen
