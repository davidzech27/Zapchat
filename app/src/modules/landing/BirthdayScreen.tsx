import { Text, TextInput, View, Alert } from "react-native"
import { useState, useRef } from "react"
import useLandingStore from "./shared/useLandingStore"
import ContinueButton from "./shared/ContinueButton"
import colors from "../../../colors"
import LandingScreenContainer, { type LandingScreen } from "./shared/LandingScreen"

//! keep message up to date with feature of app involving birthday

const BirthdayScreen: LandingScreen = ({ goToNextScreen, reset }) => {
	const { name } = useLandingStore(({ name }) => ({
		name,
	}))

	const [monthInput, setMonthInput] = useState("")
	const [dayInput, setDayInput] = useState("")
	const [yearInput, setYearInput] = useState("")

	const monthInputRef = useRef<TextInput>(null)
	const dayInputRef = useRef<TextInput>(null)
	const yearInputRef = useRef<TextInput>(null)

	const [inputIsValid, setInputIsValid] = useState(false)

	const checkIfInputIsValid = ({
		month,
		day,
		year,
	}: {
		month: string
		day: string
		year: string
	}) => {
		const monthInt = parseInt(month)
		const dayInt = parseInt(day)
		const yearInt = parseInt(year)

		const currentYear = new Date().getFullYear()

		if (
			monthInt >= 1 &&
			monthInt <= 12 &&
			dayInt >= 1 &&
			dayInt <= 31 &&
			yearInt >= currentYear - 125 &&
			yearInt <= currentYear - 1
		) {
			if (!inputIsValid) setInputIsValid(true)
		} else if (inputIsValid) {
			setInputIsValid(false)
		}
	}

	const onChangeMonthInput = (newMonthInput: string) => {
		if (newMonthInput.length > 2) {
			setMonthInput(newMonthInput.slice(0, 2))
			setDayInput((prevDayInput) => {
				const dateConcat = `${newMonthInput}${prevDayInput}${yearInput}`
				return dateConcat.slice(2, 4)
			})
			setYearInput((prevYearInput) => {
				const dateConcat = `${newMonthInput}${dayInput}${prevYearInput}`
				return dateConcat.slice(4, 8)
			})

			if (dayInput.length === 0) {
				dayInputRef.current?.focus()
			} else {
				yearInputRef.current?.focus()
			}

			checkIfInputIsValid({
				month: newMonthInput.slice(0, 2),
				day: dayInput,
				year: yearInput,
			})

			return
		}

		setMonthInput(newMonthInput)

		if (newMonthInput.length === 2) {
			dayInputRef.current?.focus()
		}

		checkIfInputIsValid({
			month: newMonthInput,
			day: dayInput,
			year: yearInput,
		})
	}

	const onChangeDayInput = (newDayInput: string) => {
		if (newDayInput.length > 2) {
			setDayInput(newDayInput.slice(0, 2))
			setYearInput((prevYearInput) => {
				const dateConcat = `${dayInput}${prevYearInput}`
				return dateConcat.slice(2, 6)
			})

			yearInputRef.current?.focus()

			checkIfInputIsValid({
				month: monthInput,
				day: newDayInput.slice(0, 2),
				year: yearInput,
			})

			return
		}

		setDayInput(newDayInput)

		if (newDayInput.length === 2) {
			yearInputRef.current?.focus()
		}

		checkIfInputIsValid({
			month: monthInput,
			day: newDayInput,
			year: yearInput,
		})
	}

	const onChangeYearInput = (newYearInput: string) => {
		if (newYearInput.length > 4) {
			setYearInput(newYearInput.slice(0, 4))

			checkIfInputIsValid({
				month: monthInput,
				day: dayInput,
				year: newYearInput.slice(0, 4),
			})

			return
		}

		setYearInput(newYearInput)

		checkIfInputIsValid({
			month: monthInput,
			day: dayInput,
			year: newYearInput,
		})
	}

	const onBackspaceDayInput = () => {
		if (dayInput.length === 0) {
			monthInputRef.current?.focus()
		}
	}

	const onBackspaceYearInput = () => {
		if (yearInput.length === 0) {
			dayInputRef.current?.focus()
		}
	}

	const onBlurMonthInput = () => {
		if (monthInput.length === 1) setMonthInput((prev) => `0${prev}`)
	}

	const onBlurDayInput = () => {
		if (dayInput.length === 1) setDayInput((prev) => `0${prev}`)
	}

	const onContinue = () => {
		const birthday = new Date(parseInt(yearInput), parseInt(monthInput) - 1, parseInt(dayInput))

		const now = new Date()

		if (
			now.getFullYear() - birthday.getFullYear() < 13 ||
			(now.getFullYear() - birthday.getFullYear() === 13 &&
				now.getMonth() - birthday.getMonth() < 0) ||
			(now.getFullYear() - birthday.getFullYear() === 13 &&
				now.getMonth() - birthday.getMonth() === 0 &&
				now.getDate() - birthday.getDate() < 0)
		) {
			Alert.alert("You're too young to be on zap.", "You must be 13+ to use zap.", [
				{ onPress: reset },
			])
		} else {
			useLandingStore.setState({
				birthday,
			})

			goToNextScreen()
		}
	}

	return (
		<LandingScreenContainer backgroundColor="white">
			<Text className="mt-6 text-center text-lg font-bold text-black-text">
				Hi {name?.split(" ")[0]}, when's your birthday?
			</Text>

			<View className="mt-2.5 h-10 flex-row space-x-1.5">
				<TextInput
					value={monthInput}
					onChangeText={onChangeMonthInput}
					onBlur={onBlurMonthInput}
					autoFocus
					ref={monthInputRef}
					placeholder="MM"
					placeholderTextColor="#00000033"
					selectionColor={colors["purple-background"]}
					keyboardType="number-pad"
					autoComplete="birthdate-month"
					className="w-16 text-center text-4xl font-bold text-black-text"
				/>
				<TextInput
					value={dayInput}
					onChangeText={onChangeDayInput}
					onKeyPress={({ nativeEvent: { key } }) => {
						if (key === "Backspace") onBackspaceDayInput()
					}}
					onBlur={onBlurDayInput}
					ref={dayInputRef}
					placeholder="DD"
					placeholderTextColor="#00000033"
					selectionColor={colors["purple-background"]}
					keyboardType="number-pad"
					autoComplete="birthdate-day"
					className="w-[52px] text-center text-4xl font-bold text-black-text"
				/>
				<TextInput
					value={yearInput}
					onChangeText={onChangeYearInput}
					onKeyPress={({ nativeEvent: { key } }) => {
						if (key === "Backspace") onBackspaceYearInput()
					}}
					ref={yearInputRef}
					placeholder="YYYY"
					placeholderTextColor="#00000033"
					maxLength={4}
					selectionColor={colors["purple-background"]}
					keyboardType="number-pad"
					autoComplete="birthdate-year"
					className="-mr-4 w-[98px] text-center text-4xl font-bold text-black-text"
				/>
			</View>

			<View className="flex-1" />

			<ContinueButton
				text="Continue"
				aboveText={
					<Text className="text-center opacity-sub-text-on-white-background">
						Used just to make sure that you're{"\n"}old enough to use zap.
					</Text>
				}
				aboveTextGap={26}
				onPress={onContinue}
				disabled={!inputIsValid}
				buttonColor="purple"
				raisedByKeyboard
			/>
		</LandingScreenContainer>
	)
}

export default BirthdayScreen
