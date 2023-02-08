import { type ReactNode, type FC } from "react"
import { Pressable, View } from "react-native"
import Animated, { useSharedValue } from "react-native-reanimated"
import useKeyboard from "../../../shared/hooks/useKeyboard"
import useInteractiveButtonStyle from "../../../shared/hooks/useInteractiveButtonStyle"
import useDisabledButtonStyle from "../../../shared/hooks/useDisabledButtonStyle"
import colors from "../../../../colors"

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

	const { interactiveButtonStyle, interactiveTextStyle } = useInteractiveButtonStyle({
		pressed,
		duration: 75,
		scale: 0.95,
		textOpacity: 0.5,
	})

	const { buttonStyle: buttonDisabledStyle } = useDisabledButtonStyle({
		disabled,
	})

	const outlineButtonPressed = useSharedValue(false)

	const {
		interactiveButtonStyle: interactiveOutlineButtonStyle,
		interactiveTextStyle: interactiveOutlineTextStyle,
	} = useInteractiveButtonStyle({
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
						interactiveOutlineButtonStyle,
						outlineButtonDisabledStyle,
					]}
					className="mb-3 h-16 w-full justify-center rounded-2xl border-[1.5px]"
				>
					<Animated.Text
						style={[{ color: buttonColors[buttonColor] }, interactiveOutlineTextStyle]}
						className="text-center text-lg font-bold"
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
					interactiveButtonStyle,
					buttonDisabledStyle,
				]}
				className="h-16 w-full justify-center rounded-2xl"
			>
				<Animated.Text
					style={[{ color: textColorsByButtonColor[buttonColor] }, interactiveTextStyle]}
					className="text-center text-lg font-bold"
				>
					{text}
				</Animated.Text>
			</AnimatedPressable>
		</>
	)

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
