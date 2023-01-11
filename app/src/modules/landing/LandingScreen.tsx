import type { FC, ReactNode } from "react"
import { useWindowDimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import Animated, { withTiming, Easing } from "react-native-reanimated"
import useLandingStore from "./useLandingStore"
import TextLogo from "./TextLogo"
import colors from "../../../colors"

interface LandingScreenContainerProps {
	backgroundColor: "purple" | "white" | "black"
	first?: boolean
	last?: boolean
	children: ReactNode
}

const backgroundColors: {
	[K in LandingScreenContainerProps["backgroundColor"]]: string
} = {
	purple: colors["purple-background"],
	white: colors["white-background"],
	black: colors["black-background"],
}

const logoColorsByBackgroundColor: {
	[K in LandingScreenContainerProps["backgroundColor"]]: string
} = {
	purple: colors["white-background"],
	white: colors["purple-background"],
	black: colors["purple-text-on-black-surface"],
}

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView)

const LandingScreenContainer: FC<LandingScreenContainerProps> = ({
	children,
	first = false,
	last = false,
	backgroundColor,
}) => {
	const screenWidth = useWindowDimensions().width

	const { navigatingForward } = useLandingStore(({ navigatingForward }) => ({
		navigatingForward,
	}))

	const enteringAnimation = () => {
		"worklet"

		return {
			initialValues: {
				transform: [
					{
						translateX: screenWidth * (navigatingForward.value ? 1 : -1),
					},
				],
			},
			animations: {
				transform: [
					{
						translateX: withTiming(0, {
							easing: Easing.bezier(0.17, 1.11, 0.8, 0.95),
							duration: 500,
						}),
					},
				],
			},
		}
	}

	const exitingAnimation = () => {
		"worklet"

		return {
			initialValues: {
				transform: [{ translateX: 0 }],
			},
			animations: {
				transform: [
					{
						translateX: withTiming(screenWidth * (navigatingForward.value ? -1 : 1), {
							easing: Easing.bezier(0.17, 1.11, 0.8, 0.95),
							duration: 500,
						}),
					},
				],
			},
		}
	}

	return (
		<AnimatedSafeAreaView
			entering={!first ? enteringAnimation : undefined}
			exiting={!last ? exitingAnimation : undefined}
			style={{ backgroundColor: backgroundColors[backgroundColor] }}
			className="flex-1 items-center pt-10 pb-4 px-6"
		>
			<TextLogo color={logoColorsByBackgroundColor[backgroundColor]} />

			{children}

			<StatusBar style={backgroundColor !== "white" ? "light" : "dark"} />
		</AnimatedSafeAreaView>
	)
}

export default LandingScreenContainer

interface LandingScreenProps {
	goToNextScreen: () => void
	goToPreviousScreen: () => void
	reset: () => void
}

export type LandingScreen = FC<LandingScreenProps>
