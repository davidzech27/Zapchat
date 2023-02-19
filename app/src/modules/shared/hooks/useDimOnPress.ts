import { useSharedValue, withTiming, useAnimatedStyle } from "react-native-reanimated"

const useDimOnPress = () => {
	const pressed = useSharedValue(false)

	const dimStyle = useAnimatedStyle(() => {
		return {
			opacity: withTiming(pressed.value ? 0.8 : 1, { duration: 75 }),
		}
	})

	const dimProps = {
		onPressIn: () => {
			pressed.value = true
		},
		onPressOut: () => {
			pressed.value = false
		},
	}

	return {
		dimStyle,
		dimProps,
	}
}

export default useDimOnPress
