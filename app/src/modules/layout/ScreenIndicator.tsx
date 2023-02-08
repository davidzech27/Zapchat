import { FC } from "react"
import { Pressable, View } from "react-native"
import Animated, {
	useAnimatedStyle,
	Layout,
	type SharedValue,
	withTiming,
} from "react-native-reanimated"
import clsx from "clsx"
import { bezierEasing } from "../../shared/util/easing"

interface ScreenIndicatorProps {
	currentScreen: "chooserConversations" | "chooseeConversations"
	currentScreenProgress: SharedValue<number>
	onChangeScreen: (newScreen: "chooserConversations" | "chooseeConversations") => void
}

const ScreenIndicator: FC<ScreenIndicatorProps> = ({
	currentScreen,
	currentScreenProgress,
	onChangeScreen,
}) => {
	const backgroundColorStyle = useAnimatedStyle(() => {
		return {
			backgroundColor: `rgba(${255 - currentScreenProgress.value * 255}, ${
				255 - currentScreenProgress.value * 255
			}, ${255 - currentScreenProgress.value * 255}, ${
				(32 - currentScreenProgress.value * 12) / 255
			})`,
		}
	}, [currentScreenProgress])

	const buttonColorStyle = useAnimatedStyle(() => {
		return {
			backgroundColor: `rgba(255, 255, 255, ${
				((32 + currentScreenProgress.value * 200) / 255) *
				(Math.abs(currentScreenProgress.value - 0.5) * 2) // todo - make transition delay until screen past certain point
			})`,
		}
	}, [currentScreen])

	const textColorStyle = useAnimatedStyle(() => {
		return {
			color: `rgba(${255 - currentScreenProgress.value * 255}, ${
				255 - currentScreenProgress.value * 255
			}, ${255 - currentScreenProgress.value * 255}, ${
				1 - 0.4 * currentScreenProgress.value
			})`,
		}
	}, [currentScreenProgress])

	const underlayColorStyle = useAnimatedStyle(() => {
		return {
			backgroundColor: `rgba(${currentScreenProgress.value * 255}, ${
				currentScreenProgress.value * 255
			}, ${currentScreenProgress.value * 255}, ${
				(Math.abs(currentScreenProgress.value - 0.5) * 2) ** 2
			})`,
		}
	})

	const widthStyle = useAnimatedStyle(() => {
		return {
			width: withTiming(
				{ chooserConversations: 54, chooseeConversations: 58 }[currentScreen],
				{ duration: 250 }
			),
		}
	}, [currentScreen])

	return (
		<View className="mx-auto h-[30px] w-[116px]">
			<Animated.View
				style={underlayColorStyle}
				className="absolute h-full w-full rounded-full bg-black"
			/>

			<Animated.View
				style={backgroundColorStyle}
				className="h-full w-full rounded-full px-[2.5px] py-[2px]"
			>
				<Animated.View
					layout={Layout.duration(250).easing(bezierEasing.factory())}
					style={[widthStyle, buttonColorStyle]}
					className={clsx(
						"h-full w-[54px] rounded-full", // w necessary because animated width doesn't work at first
						{ chooserConversations: "self-start", chooseeConversations: "self-end" }[
							currentScreen
						]
					)}
				/>

				<View className="absolute top-0 bottom-0 left-0 right-0 flex-row">
					<Pressable
						onPress={() => onChangeScreen("chooserConversations")}
						className="flex-1 items-start justify-center pl-3"
					>
						<Animated.Text style={textColorStyle} className="text-xs font-semibold">
							Yours
						</Animated.Text>
					</Pressable>
					<Pressable
						onPress={() => onChangeScreen("chooseeConversations")}
						className="flex-1 items-end justify-center pr-3"
					>
						<Animated.Text style={textColorStyle} className="text-xs font-semibold">
							Theirs
						</Animated.Text>
					</Pressable>
				</View>
			</Animated.View>
		</View>
	)
}

export default ScreenIndicator
