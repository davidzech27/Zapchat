import { type FC } from "react"
import { View } from "react-native"
import useHideSplashScreen from "../auth/useHideSplashScreen"
import TabBar from "./TabBar"
import Inbox from "../inbox/Inbox"
import UserPickingPage from "../picking/UserPickingPage"
import AddPage from "../connections/AddPage"
import { Swiper } from "./Swiper"
import { trpc } from "../../lib/trpc"

const MainLayout: FC = () => {
	useHideSplashScreen()

	const queryClient = trpc.useContext()

	queryClient.profile.me.prefetch()

	return (
		<View className="flex-1">
			<Swiper.Navigator TabBar={(props) => <TabBar {...(props as any)} />}>
				<Swiper.Screen name="Add" component={AddPage} />
				<Swiper.Screen name="Inbox" component={Inbox} />
				<Swiper.Screen name="Picking" component={UserPickingPage} />
			</Swiper.Navigator>
		</View>
	)
}

export default MainLayout
