import { type FC } from "react"
import { View } from "react-native"
import { type ScreenNames } from "./MainLayoutScreens"
import MainText from "../../components/MainText"

interface TabBarProps {
	currentScreen: ScreenNames
	setCurrentScreen: (screen: ScreenNames) => void
}

const TabBar: FC<TabBarProps> = ({ currentScreen, setCurrentScreen }) => {
	return (
		<>
			<View className="h-16" />
			<View className="h-16 bg-black flex-row justify-between items-center px-10 absolute bottom-0 left-0 right-0">
				<View className="flex-1 px-1 py-2">
					<MainText light className="text-center">
						Add
					</MainText>
				</View>
				<View
					className={`flex-1 px-1 py-2 ${
						currentScreen === "Inbox" ? "rounded-full bg-primary-400" : ""
					}`}
				>
					<MainText
						onPress={() => setCurrentScreen("Inbox")}
						light={currentScreen !== "Inbox"}
						className="text-center"
					>
						Inbox
					</MainText>
				</View>
				<View
					className={`flex-1 px-1 py-2 ${
						currentScreen === "Picking" ? "rounded-full bg-primary-400" : ""
					}`}
				>
					<MainText
						onPress={() => setCurrentScreen("Picking")}
						light={currentScreen !== "Picking"}
						className="text-center"
					>
						Pick
					</MainText>
				</View>
				<View className="flex-1 px-1 py-2">
					<MainText light className="text-center">
						Profile
					</MainText>
				</View>
				<View className="flex-1 px-1 py-2">
					<MainText light className="text-center">
						About
					</MainText>
				</View>
			</View>
		</>
	)
}

export default TabBar
