import { Pressable, TextProps } from "react-native"
import { type FC } from "react"
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated"

interface PressableTextProps {
	children: TextProps["children"]
	onPress: () => void
	opacity: number
	textProps: TextProps
}

const PressableText: FC<PressableTextProps> = ({ children, onPress, opacity, textProps }) => {
	const pressed = useSharedValue(false)

	const opacityStyle = useAnimatedStyle(() => {
		return {
			opacity: pressed.value
				? withTiming(opacity, { duration: 50 })
				: withTiming(1, { duration: 125 }),
		}
	})

	return (
		<Pressable
			onPress={onPress}
			onPressIn={() => {
				pressed.value = true
			}}
			onPressOut={() => {
				pressed.value = false
			}}
			hitSlop={{ bottom: 8, top: 8 }}
		>
			<Animated.Text
				{...textProps}
				style={[textProps.style, opacityStyle]}
				children={children}
			/>
		</Pressable>
	)
}

export default PressableText
