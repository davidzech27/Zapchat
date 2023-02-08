import { FC } from "react"
import { Pressable, type ViewStyle } from "react-native"
import clsx from "clsx"
import Animated, { useSharedValue } from "react-native-reanimated"
import { styled } from "nativewind"
import useInteractiveButtonStyle from "../hooks/useInteractiveButtonStyle"
import useDisabledButtonStyle from "../hooks/useDisabledButtonStyle"

interface WideButtonProps {
	text: string
	color: "white" | "purple" | "darker-purple"
	onPress?: () => void
	disabled?: boolean
	outline?: boolean
	style?: ViewStyle
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const WideButton: FC<WideButtonProps> = ({
	text,
	color,
	onPress,
	disabled = false,
	outline = false,
	style,
}) => {
	const pressed = useSharedValue(false)

	const { interactiveButtonStyle, interactiveTextStyle } = useInteractiveButtonStyle({
		pressed,
		duration: 75,
		scale: 0.95,
		textOpacity: 0.5,
	})

	const { buttonStyle: buttonDisabledStyle } = useDisabledButtonStyle({
		disabled,
	})

	return (
		<AnimatedPressable
			onPress={onPress}
			onPressIn={() => {
				pressed.value = true
			}}
			onPressOut={() => {
				pressed.value = false
			}}
			disabled={disabled}
			style={[style, interactiveButtonStyle, buttonDisabledStyle]}
			className={clsx(
				"h-16 w-full justify-center rounded-2xl",
				!outline
					? {
							white: "bg-white",
							purple: "bg-purple-background",
							"darker-purple": "bg-purple-text",
					  }[color]
					: [
							"border-[1.5px]",
							{
								white: "border-white",
								purple: "border-purple-background",
								"darker-purple": "border-purple-text",
							}[color],
					  ]
			)}
		>
			<Animated.Text
				style={interactiveTextStyle}
				className={clsx(
					"text-center text-lg font-bold",
					!outline
						? color === "white"
							? "text-purple-background"
							: "text-white"
						: {
								white: "text-white",
								purple: "text-purple-text",
								"darker-purple": "text-purple-text",
						  }[color]
				)}
			>
				{text}
			</Animated.Text>
		</AnimatedPressable>
	)
}

export default styled(WideButton)
