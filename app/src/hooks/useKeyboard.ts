import { useState, useEffect } from "react"
import { Platform, UIManager, Keyboard, useWindowDimensions } from "react-native"

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
	UIManager.setLayoutAnimationEnabledExperimental(true)
}

export const KEYBOARD_DURATION = 250

const useKeyboard = (options: { scheduleLayoutAnimation: boolean } | void) => {
	const [keyboardSpace, setKeyboardSpace] = useState(0)

	const screenHeight = useWindowDimensions().height

	const scheduleLayoutAnimation = options?.scheduleLayoutAnimation ?? true

	useEffect(() => {
		const subscribers = [
			Keyboard.addListener(
				Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
				(event) => {
					if (scheduleLayoutAnimation) {
						Keyboard.scheduleLayoutAnimation(event)
					}

					setKeyboardSpace(screenHeight - event.endCoordinates.screenY)
				}
			),
			Keyboard.addListener(
				Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
				(event) => {
					if (scheduleLayoutAnimation) {
						Keyboard.scheduleLayoutAnimation(event)
					}

					setKeyboardSpace(0)
				}
			),
		]

		return () => {
			subscribers.forEach((subscriber) => subscriber.remove())
		}
	}, [])

	const dismissKeyboard = ({ onHidden }: { onHidden: () => void }) => {
		Keyboard.dismiss()
		setTimeout(onHidden, KEYBOARD_DURATION)
	}

	return { keyboardSpace, dismissKeyboard }
}

export default useKeyboard
