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
import useHideSplashScreen from "../shared/hooks/useHideSplashScreen"
import useModalStore from "../shared/stores/useModalStore"
import ChatScreen from "../chat/ChatScreen"
import ScreenSwiper, { ScreenSwiperRef } from "./ScreenSwiper"
import ChooserInbox from "../inbox/ChooserInbox"
import ChooseeInbox from "../inbox/ChooseeInbox"
import TextLogo from "../landing/shared/TextLogo"
import { trpc } from "../shared/lib/trpc"
import colors from "../../../colors"
import ProfilePhoto from "../shared/components/ProfilePhoto"
import ScreenIndicator from "./ScreenIndicator"
import ProfileScreen from "../profile/ProfileScreen"
import type { UserProfile } from "../profile/useProfileStore"
import PickingButton from "../picking/PickingButton"
import PickingScreen from "../picking/PickingScreen"

interface MainLayoutProps {
	profile: UserProfile
}

const AnimatedIcon = Animated.createAnimatedComponent(Icon)

const MainLayout: FC<MainLayoutProps> = ({ profile }) => {
	const chooserConversationsLoaded =
		trpc.inbox.conversationsAsChooser.useQuery().data !== undefined

	useHideSplashScreen({ if: chooserConversationsLoaded })

	const {
		openedChat,
		closeChat,
		openedProfile,
		closeProfile,
		openProfile,
		openedChoices,
		closeChoices,
	} = useModalStore(
		({
			openedChat,
			closeChat,
			openedProfile,
			closeProfile,
			openProfile,
			openedChoices,
			closeChoices,
		}) => ({
			openedChat,
			closeChat,
			openedProfile,
			closeProfile,
			openProfile,
			openedChoices,
			closeChoices,
		})
	)

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

	const insets = useSafeAreaInsets()

	return (
		<>
			<View style={{ top: insets.top + 11 }} className="absolute left-0 right-0 z-20">
				<View className="mb-[11px] flex-row">
					<View className="bottom-[5.4px] flex-1 justify-center pl-6">
						<AnimatedIcon style={userPlusIconColorStyle} name="user-plus" size={27} />
					</View>
					<View className="justify-center">
						<TextLogo color={colors["purple-text"]} />
					</View>
					<View className="ml-[7.5px] flex-1 items-end pr-5">
						<ProfilePhoto
							username={profile.username}
							name={profile.name}
							onPress={() =>
								openProfile({
									username: profile.username,
									name: profile.name,
									type: "self",
								})
							}
							dark={currentScreen === "chooserConversations"}
							small
							extraClassName="bottom-[5px]"
						/>
					</View>
				</View>

				<ScreenIndicator
					currentScreen={currentScreen}
					currentScreenProgress={currentScreenProgress}
					onChangeScreen={onScreenIndicatorChangeScreen}
				/>
			</View>

			<View style={{ bottom: insets.bottom + 16 }} className="absolute right-7 z-50">
				<PickingButton />
			</View>

			<ScreenSwiper
				initialIndex={0}
				onIndexChange={onSwiperIndexChange}
				syncWithIndexProgress={currentScreenProgress}
				ref={screenSwiperRef}
			>
				<ChooserInbox active={currentScreen === "chooserConversations"} />
				<ChooseeInbox active={currentScreen === "chooseeConversations"} />
			</ScreenSwiper>

			<ChatScreen chat={openedChat} onClose={closeChat} />

			<ProfileScreen profile={openedProfile} onClose={closeProfile} />

			<PickingScreen choices={openedChoices} onClose={closeChoices} />

			<StatusBar
				animated={false}
				style={currentScreen === "chooserConversations" ? "light" : "dark"}
			/>
		</>
	)
}

export default MainLayout
