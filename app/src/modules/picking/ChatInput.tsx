import {
	Keyboard,
	TextInput,
	useWindowDimensions,
	Platform,
	UIManager,
	Pressable,
	View,
} from "react-native"
import { type FC, useEffect, useState } from "react"
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated"
import { LinearGradient } from "expo-linear-gradient"
import useKeyboard, { KEYBOARD_DURATION } from "../../shared/hooks/useKeyboard"

interface ChatInputProps {
	open: boolean
	onClose: () => void
	placeholder: string
	onSubmit: (input: { textInput: string }) => void
}

const ChatInput: FC<ChatInputProps> = ({ open, onClose, placeholder, onSubmit }) => {
	const [textInput, setTextInput] = useState("")

	const [rendering, setRendering] = useState(false)

	const { keyboardSpace, dismissKeyboard } = useKeyboard()

	useEffect(() => {
		if (open) {
			setRendering(true)
		} else {
			dismissKeyboard({ onHidden: () => setRendering(false) })
		}
	}, [open])

	const animatedOpacityStyle = useAnimatedStyle(() => {
		return {
			opacity: withTiming(open ? 1 : 0, {
				duration: KEYBOARD_DURATION,
			}),
		}
	}, [open])

	return rendering ? (
		<>
			<Animated.View
				className="absolute top-0 bottom-0 left-0 right-0"
				style={animatedOpacityStyle}
			>
				<LinearGradient
					colors={["#000000B0", "#00000085", "#00000085", "#000000AA"]}
					locations={[0, 0.5, 0.7, 1]}
					style={{ flex: 1 }}
				/>
				<View style={{ height: keyboardSpace, backgroundColor: "#000000AA" }} />
				<Pressable onPressIn={onClose} className="absolute top-0 bottom-0 left-0 right-0" />
			</Animated.View>

			<Animated.View
				className="absolute left-0 right-0 px-5 py-2"
				style={[animatedOpacityStyle, { bottom: keyboardSpace }]}
			>
				<TextInput
					value={textInput}
					onChangeText={setTextInput}
					autoFocus
					autoCapitalize="none"
					selectionColor="#FFF"
					placeholder={placeholder}
					placeholderTextColor="#AAA"
					onSubmitEditing={() => {
						onSubmit({ textInput })
						onClose()
						setTextInput("")
					}}
					keyboardAppearance="dark"
					returnKeyType="send"
					className="h-[46px] rounded-full bg-[#FFFFFF30] px-5 text-[18px] text-white"
				/>
			</Animated.View>
		</>
	) : null
}

export default ChatInput
