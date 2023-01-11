import { type ReactNode, type FC } from "react"
import { Pressable, View } from "react-native"
import Animated, { useSharedValue } from "react-native-reanimated"
import useKeyboard from "../../hooks/useKeyboard"
import useInteractiveButtonStyle from "../../hooks/useInteractiveButtonStyle"
import useDisabledButtonStyle from "../../hooks/useDisabledButtonStyle"
import colors from "../../../colors"

interface ContinueButtonProps {
	text: ReactNode
	onPress: () => void
	disabled: boolean
	outlineButton?: {
		text: ReactNode
		onPress: () => void
		disabled: boolean
	}
	aboveText?: ReactNode
	aboveTextGap?: number
	buttonColor: "purple" | "white"
	raisedByKeyboard?: boolean
}

const buttonColors: {
	[K in ContinueButtonProps["buttonColor"]]: string
} = {
	purple: colors["purple-background"],
	white: colors["white-background"],
}

const textColorsByButtonColor: {
	[K in ContinueButtonProps["buttonColor"]]: string
} = {
	purple: colors["white-background"],
	white: colors["purple-background"],
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ContinueButton: FC<ContinueButtonProps> = ({
	text,
	onPress,
	disabled,
	outlineButton,
	aboveText,
	aboveTextGap,
	buttonColor,
	raisedByKeyboard = false,
}) => {
	const pressed = useSharedValue(false)

	const { buttonStyle: buttonInteractiveStyle, buttonTextStyle } = useInteractiveButtonStyle({
		pressed,
		duration: 75,
		scale: 0.95,
		textOpacity: 0.5,
	})

	const { buttonStyle: buttonDisabledStyle } = useDisabledButtonStyle({
		disabled,
	})

	const outlineButtonPressed = useSharedValue(false)

	const { buttonStyle: outlineButtonInteractiveStyle, buttonTextStyle: outlineButtonTextStyle } =
		useInteractiveButtonStyle({
			pressed: outlineButtonPressed,
			duration: 75,
			scale: 0.95,
			textOpacity: 0.5,
		})

	const { buttonStyle: outlineButtonDisabledStyle } = useDisabledButtonStyle({
		disabled: !!outlineButton?.disabled,
	})

	const { keyboardSpace } = useKeyboard({ scheduleLayoutAnimation: false })

	const content = (
		<>
			{aboveText && <View style={{ marginBottom: aboveTextGap }}>{aboveText}</View>}
			{outlineButton && (
				<AnimatedPressable
					onPress={outlineButton.onPress}
					onPressIn={() => {
						outlineButtonPressed.value = true
					}}
					onPressOut={() => {
						outlineButtonPressed.value = false
					}}
					disabled={outlineButton.disabled}
					style={[
						{
							borderColor: buttonColors[buttonColor],
						},
						outlineButtonInteractiveStyle,
						outlineButtonDisabledStyle,
					]}
					className="w-full h-16 border-[1.5px] rounded-2xl justify-center mb-3"
				>
					<Animated.Text
						style={[{ color: buttonColors[buttonColor] }, outlineButtonTextStyle]}
						className="text-lg font-bold text-center"
					>
						{outlineButton.text}
					</Animated.Text>
				</AnimatedPressable>
			)}
			<AnimatedPressable
				onPress={onPress}
				onPressIn={() => {
					pressed.value = true
				}}
				onPressOut={() => {
					pressed.value = false
				}}
				disabled={disabled}
				style={[
					{ backgroundColor: buttonColors[buttonColor] },
					buttonInteractiveStyle,
					buttonDisabledStyle,
				]}
				className="w-full h-16 rounded-2xl justify-center"
			>
				<Animated.Text
					style={[{ color: textColorsByButtonColor[buttonColor] }, buttonTextStyle]}
					className="text-lg font-bold text-center"
				>
					{text}
				</Animated.Text>
			</AnimatedPressable>
		</>
	)
	console.log

	return (
		<View
			style={raisedByKeyboard && { paddingBottom: keyboardSpace }}
			className="w-full items-center"
		>
			{content}
		</View>
	)
}

export default ContinueButton
