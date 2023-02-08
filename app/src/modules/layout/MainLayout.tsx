import { type FC, useState, useRef } from "react"
import { View, Text, Modal, Pressable } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Icon from "@expo/vector-icons/Feather"
import { StatusBar } from "expo-status-bar"
import Animated, {
	Layout,
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import clsx from "clsx"
import useHideSplashScreen from "../../shared/hooks/useHideSplashScreen"
import useChatStore from "../chat/useChatStore"
import Chat from "../chat/Chat"
import ScreenSwiper, { ScreenSwiperRef } from "./ScreenSwiper"
import Inbox from "../inbox/Inbox"
import TextLogo from "../landing/shared/TextLogo"
import { trpc } from "../../shared/lib/trpc"
import colors from "../../../colors"
import ProfilePhoto from "../../shared/components/ProfilePhoto"
import ScreenIndicator from "./ScreenIndicator"
import ProfileScreen from "../profile/ProfileScreen"

const AnimatedIcon = Animated.createAnimatedComponent(Icon)
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

const MainLayout: FC = () => {
	useHideSplashScreen({ if: true }) // todo - wait till loading inbox to set if to true

	const { data: profile } = trpc.profile.me.useQuery() // todo - should store basic profile data in async storage to avoid need to do this

	const { currentChat, closeChat } = useChatStore(({ currentChat, closeChat }) => ({
		currentChat,
		closeChat,
	}))

	const [currentScreen, setCurrentScreen] = useState<
		"chooserConversations" | "chooseeConversations"
	>("chooserConversations")

	const currentScreenProgress = useSharedValue(0)

	const onSwiperIndexChange = (newIndex: number) => {
		setCurrentScreen((["chooserConversations", "chooseeConversations"] as const)[newIndex])
	}

	const screenSwiperRef = useRef<ScreenSwiperRef>(null)

	const onScreenIndicatorChangeScreen = (
		newScreen: "chooserConversations" | "chooseeConversations"
	) =>
		({
			chooserConversations: () => screenSwiperRef.current?.navigateToIndex(0),
			chooseeConversations: () => screenSwiperRef.current?.navigateToIndex(1),
		}[newScreen]())

	const userPlusIconColorStyle = useAnimatedStyle(() => {
		return {
			color: `rgba(${255 - currentScreenProgress.value * 255}, ${
				255 - currentScreenProgress.value * 255
			}, ${255 - currentScreenProgress.value * 255}, 1)`,
		}
	}, [currentScreenProgress])

	const [profileScreenOpen, setProfileScreenOpen] = useState(false)

	const insets = useSafeAreaInsets()

	return (
		<>
			<View style={{ top: insets.top + 11 }} className="absolute left-0 right-0 z-20">
				<View className="mb-[7px] flex-row">
					<View className="bottom-[5px] flex-1 justify-center pl-6">
						<AnimatedIcon style={userPlusIconColorStyle} name="user-plus" size={27} />
					</View>
					<View className="justify-center">
						<TextLogo color={colors["purple-text"]} />
					</View>
					<View className="ml-[7.5px] flex-1 items-end pr-5">
						<ProfilePhoto
							username={profile?.self.username}
							name={profile?.self.name}
							onPress={() => setProfileScreenOpen(true)}
							dark={currentScreen === "chooserConversations"}
							extraSmall
							extraClassName="bottom-[5px]"
						/>
					</View>
				</View>

				{/* <Animated.View></Animated.View> */}
				<ScreenIndicator
					currentScreen={currentScreen}
					currentScreenProgress={currentScreenProgress}
					onChangeScreen={onScreenIndicatorChangeScreen}
				/>
			</View>
			<ScreenSwiper
				initialIndex={0}
				onIndexChange={onSwiperIndexChange}
				syncWithIndexProgress={currentScreenProgress}
				ref={screenSwiperRef}
			>
				<Inbox active={currentScreen === "chooserConversations"} type="asChooser" />
				<Inbox active={currentScreen === "chooseeConversations"} type="asChoosee" />
			</ScreenSwiper>

			<Chat chat={currentChat} onClose={closeChat} />

			{profileScreenOpen && (
				<ProfileScreen
					open={profileScreenOpen}
					profile={
						profile?.self && {
							username: profile?.self.username,
							name: profile?.self.name,
						}
					}
					type="self"
					onClose={() => setProfileScreenOpen(false)}
				/>
			)}

			<StatusBar
				animated={false}
				style={currentScreen === "chooserConversations" ? "light" : "dark"}
			/>
		</>
	)
}

export default MainLayout
