import { type FC, useState, useRef } from "react"
import { View } from "react-native"
import PagerView from "react-native-pager-view"
import { styled } from "nativewind"
import { type ScreenNames, screenPositions, initialScreenPosition } from "./MainLayoutScreens"
import TabBar from "./TabBar"
import Inbox from "../inbox/Inbox"
import UserPickingPage from "../picking/UserPickingPage"

const StyledPagerView = styled(PagerView)

const MainLayout: FC = () => {
	const [currentScreen, setCurrentScreen] = useState<ScreenNames>("Picking")

	const pagerViewRef = useRef<PagerView>(null)

	return (
		<View className="flex-1">
			<StyledPagerView
				onPageSelected={({ nativeEvent: { position } }) =>
					setCurrentScreen(screenPositions[position])
				}
				initialPage={initialScreenPosition}
				ref={pagerViewRef}
				className="flex-1"
			>
				<Inbox active={currentScreen === "Inbox"} />
				<UserPickingPage active={currentScreen === "Picking"} />
			</StyledPagerView>
			<TabBar
				currentScreen={currentScreen}
				setCurrentScreen={(newScreen) =>
					pagerViewRef.current?.setPage(screenPositions.indexOf(newScreen))
				}
			/>
		</View>
	)
}

export default MainLayout
