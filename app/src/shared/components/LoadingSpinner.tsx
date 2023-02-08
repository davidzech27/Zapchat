import type { FC } from "react"
import Icon from "@expo/vector-icons/MaterialCommunityIcons"
import Animated, {
	useAnimatedStyle,
	withTiming,
	withRepeat,
	withSequence,
} from "react-native-reanimated"
import colors from "../../../colors"

interface LoadingSpinnerProps {
	color: "white" | "purple"
	size: number
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({ color, size }) => {
	const spinningStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					rotateZ: withRepeat(
						withSequence(
							withTiming("0deg", { duration: 0 }),
							withTiming("360deg", { duration: 400 })
						),
						9999
					),
				},
			],
		}
	}, [])

	return (
		<Animated.View style={spinningStyle}>
			<Icon
				name="loading"
				size={size}
				color={
					{ white: colors["white-background"], purple: colors["purple-background"] }[
						color
					]
				}
			/>
		</Animated.View>
	)
}

export default LoadingSpinner
