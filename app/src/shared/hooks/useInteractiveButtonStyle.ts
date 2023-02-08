import { useAnimatedStyle, withTiming, type SharedValue } from "react-native-reanimated"

const useInteractiveButtonStyle = ({
	pressed,
	duration,
	scale,
	textOpacity,
}: {
	pressed: SharedValue<boolean>
	duration: number
	scale: number
	textOpacity: number
}) => {
	const interactiveButtonStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					scale: pressed.value
						? withTiming(scale, {
								duration,
						  })
						: withTiming(1, { duration }),
				},
			],
		}
	})

	const interactiveTextStyle = useAnimatedStyle(() => {
		return {
			opacity: pressed.value
				? withTiming(textOpacity, { duration })
				: withTiming(1, { duration }),
		}
	})

	return {
		interactiveButtonStyle,
		interactiveTextStyle,
	}
}

export default useInteractiveButtonStyle
