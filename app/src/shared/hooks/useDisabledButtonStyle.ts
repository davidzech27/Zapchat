import { useAnimatedStyle, withTiming } from "react-native-reanimated"

const useDisabledButtonStyle = ({ disabled }: { disabled: boolean }) => {
	const buttonStyle = useAnimatedStyle(() => {
		return {
			opacity: disabled ? withTiming(0.5, { duration: 75 }) : withTiming(1, { duration: 75 }),
		}
	})

	return { buttonStyle }
}

export default useDisabledButtonStyle
