import {
	StyleSheet,
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

interface ChatInputProps {
	open: boolean
	onClose: () => void
	placeholder: string
	onSubmit: (input: { textInput: string }) => void
}

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true)
}

const KEYBOARD_DURATION = 250

const ChatInput: FC<ChatInputProps> = ({ open, onClose, placeholder, onSubmit }) => {
	const [textInput, setTextInput] = useState("")

	const [keyBoardSpace, setKeyBoardSpace] = useState(0)

	const screenHeight = useWindowDimensions().height

	const [rendering, setRendering] = useState(false)

	useEffect(() => {
		if (open) {
			setRendering(true)
		} else {
			Keyboard.dismiss()

			setTimeout(() => setRendering(false), KEYBOARD_DURATION)
		}
	}, [open])

	useEffect(() => {
		const subscribers = [
			Keyboard.addListener(
				Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
				(event) => {
					Keyboard.scheduleLayoutAnimation(event)

					setKeyBoardSpace(screenHeight - event.endCoordinates.screenY)
				}
			),
			Keyboard.addListener(
				Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
				(event) => {
					Keyboard.scheduleLayoutAnimation(event)

					setKeyBoardSpace(0)
				}
			),
		]

		return () => {
			subscribers.forEach((subscriber) => subscriber.remove())
		}
	}, [])

	const animatedOpacityStyle = useAnimatedStyle(() => {
		return {
			opacity: withTiming(open ? 1 : 0, {
				duration: KEYBOARD_DURATION,
			}),
		}
	}, [open])

	return rendering ? (
		<>
			<Animated.View style={[styles.fullScreen, animatedOpacityStyle]}>
				<LinearGradient
					colors={["#000000B0", "#00000080", "#000000AA"]}
					locations={[0, 0.6, 1]}
					style={{ flex: 1 }}
				/>
				<View style={{ height: keyBoardSpace, backgroundColor: "#000000AA" }} />
				<Pressable onPressIn={onClose} style={styles.fullScreen} />
			</Animated.View>

			<Animated.View
				style={[styles.inputContainer, animatedOpacityStyle, { bottom: keyBoardSpace }]}
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
					}}
					keyboardAppearance="dark"
					style={styles.inputBox}
					returnKeyType="send"
				/>
			</Animated.View>
		</>
	) : null
}

const styles = StyleSheet.create({
	fullScreen: {
		position: "absolute",
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
	},
	inputContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		paddingVertical: 8,
		paddingHorizontal: 20,
	},
	inputBox: {
		backgroundColor: "#FFFFFF30",
		color: "#FFF",
		height: 46,
		fontSize: 18,
		flex: 1,
		paddingHorizontal: 20,
		borderRadius: 9999,
	},
})

export default ChatInput
