import { type FC, useState } from "react"
import { Image, View, ImageStyle, Pressable } from "react-native"
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated"
import { PROFILE_PHOTOS_ENDPOINT } from "env"
import useDimOnPress from "../hooks/useDimOnPress"

const ProfilePhoto: FC<{
	username: string | undefined
	name: string | undefined
	small?: boolean
	extraSmall?: boolean
	dark?: boolean
	extraClassName?: string
	onPress?: () => void
}> = ({ username, small, extraSmall, name, dark, extraClassName, onPress }) => {
	const [isError, setIsError] = useState(false)

	const [isFallbackError, setIsFallbackError] = useState(false)

	const dimensionStyles =
		!small && !extraSmall
			? "h-[52px] w-[52px]"
			: !extraSmall
			? "h-[42px] w-[42px]"
			: "h-[36px] w-[36px]"

	const { dimStyle, dimProps } = useDimOnPress()

	if (!isError && username) {
		return (
			<Pressable {...dimProps} onPress={onPress}>
				<Animated.Image
					source={{ uri: `${PROFILE_PHOTOS_ENDPOINT}/${username}` }}
					onError={() => setIsError(true)}
					style={dimStyle}
					className={`${dimensionStyles} rounded-full ${extraClassName}`}
				/>
			</Pressable>
		)
	} else if (!isFallbackError && username && name) {
		return (
			<Pressable {...dimProps} onPress={onPress}>
				<Animated.Image
					source={{
						uri: `https://avatars.dicebear.com/api/initials/${name
							.split(" ")
							.map((namePart) => namePart[0])
							.join("")}.jpg?backgroundColorLevel=700&fontSize=42`,
					}}
					onError={() => setIsFallbackError(true)}
					style={dimStyle}
					className={`${dimensionStyles} rounded-full ${extraClassName}`}
				/>
			</Pressable>
		)
	}

	return (
		<Pressable {...dimProps} onPress={onPress}>
			<Animated.View
				style={dimStyle}
				className={`${dimensionStyles} ${
					!dark ? "bg-[#ECECEC]" : "bg-[#FFFFFF1A]"
				} rounded-full ${extraClassName}`}
			/>
		</Pressable>
	)
}

export default ProfilePhoto
