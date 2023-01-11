import { type FC, useState } from "react"
import { Image, View, ImageStyle } from "react-native"
import { PROFILE_PHOTOS_ENDPOINT } from "env"

const ProfilePhoto: FC<{
	username: string
	name: string
	small?: boolean
	extraClassName?: string
}> = ({ username, small, name, extraClassName }) => {
	const [isError, setIsError] = useState(false)

	const [isFallbackError, setIsFallbackError] = useState(false)

	const dimensionStyles = !small ? "h-[52px] w-[52px]" : "h-[36px] w-[36px]"

	if (!isError && username) {
		return (
			<Image
				source={{ uri: `${PROFILE_PHOTOS_ENDPOINT}/${username}` }}
				onError={() => setIsError(true)}
				className={`${dimensionStyles} rounded-full ${extraClassName}`}
			/>
		)
	} else if (!isFallbackError && username) {
		return (
			<Image
				source={{
					uri: `https://avatars.dicebear.com/api/initials/${name
						.split(" ")
						.map((namePart) => namePart[0])
						.join("")}.jpg?backgroundColorLevel=700&fontSize=42`,
				}}
				onError={() => setIsFallbackError(true)}
				className={`${dimensionStyles} rounded-full ${extraClassName}`}
			/>
		)
	}

	return <View className={`${dimensionStyles} bg-[#00000020] rounded-full ${extraClassName}`} />
}

export default ProfilePhoto
