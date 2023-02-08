import type { FC, ReactNode } from "react"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"

const FadeAnimation: FC<{ children: ReactNode; visible: boolean; duration: number }> = ({
	children,
	visible,
	duration,
}) => {
	const animatedOpacityStyle = useAnimatedStyle(() => {
		return {
			opacity: withTiming(visible ? 1 : 0, {
				duration,
			}),
		}
	}, [visible])

	return <Animated.View style={animatedOpacityStyle}>{children}</Animated.View>
}

export default FadeAnimation
