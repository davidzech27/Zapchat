import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Icon from "@expo/vector-icons/Feather"
import type { MainSwiperTabBar } from "./Swiper"

const TabBar: MainSwiperTabBar = ({ state, navigation }) => {
	const insets = useSafeAreaInsets()

	const currentRouteName = state.routeNames[state.index]

	return (
		<>
			<View
				className="bg-black flex-row justify-around items-center px-2"
				style={{ paddingBottom: insets.bottom }}
			>
				<View className="px-1 py-2">
					<Icon
						name="user-plus"
						size={30}
						color={currentRouteName === "Add" ? "#5D6AF8" : "white"}
						onPress={() => navigation.navigate("Add")}
					/>
				</View>
				<View className="px-1 py-2">
					<Icon
						name="message-square"
						size={30}
						color={currentRouteName === "Inbox" ? "#5D6AF8" : "white"}
						onPress={() => navigation.navigate("Inbox")}
					/>
				</View>
				<View className="px-1 py-2">
					<Icon
						name="zap"
						size={30}
						color={currentRouteName === "Picking" ? "#5D6AF8" : "white"}
						onPress={() => navigation.navigate("Picking")}
					/>
				</View>
				<View className="px-1 py-2">
					<Icon name="cloud-lightning" size={30} color={"white"} />
				</View>
				<View className="px-1 py-2">
					<Icon name="align-center" size={30} color={"white"} />
				</View>
			</View>
		</>
	)
}

export default TabBar
