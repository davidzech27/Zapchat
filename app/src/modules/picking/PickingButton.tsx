import { type FC, useState, useEffect } from "react"
import { Pressable, View } from "react-native"
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withRepeat,
	withTiming,
} from "react-native-reanimated"
import { trpc } from "../shared/lib/trpc"
import LightningIcon from "./LightningIcon"
import useInteractiveButtonStyle from "../shared/hooks/useInteractiveButtonStyle"
import useModalStore from "../shared/stores/useModalStore"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const PickingButton: FC = () => {
	const { data: canPickAt } = trpc.picking.canPickAt.useQuery()

	const { data: choices } = trpc.picking.choices.useQuery()

	const queryClient = trpc.useContext()

	const openChoices = useModalStore((s) => s.openChoices)

	const onPress = async () => {
		if (secondsUntilCanPickAt === 0) {
			openChoices(choices ?? (await queryClient.picking.choices.fetch()))
		} else {
			shakeXOffset.value = withSequence(
				withTiming(1, { duration: 37.5 }),
				withRepeat(withTiming(-1, { duration: 75 }), 5, true),
				withTiming(0, { duration: 37.5 })
			)
		}
	}

	useEffect(() => {
		let intervalId: NodeJS.Timer

		if (canPickAt !== undefined) {
			if (canPickAt === null) {
				setSecondsUntilCanPickAt(0)
			} else {
				setSecondsUntilCanPickAt(
					Math.floor((canPickAt.valueOf() - new Date().valueOf()) / 1000)
				)
			}

			intervalId = setInterval(() => {
				setSecondsUntilCanPickAt((prev) =>
					prev! > 0
						? prev! - 1
						: (() => {
								clearInterval(intervalId)
								return 0
						  })()
				)
			}, 1000)
		}

		return () => clearInterval(intervalId)
	}, [canPickAt])

	const [secondsUntilCanPickAt, setSecondsUntilCanPickAt] = useState<number>()

	const minutesUntilCanPickAt =
		secondsUntilCanPickAt !== undefined ? Math.floor(secondsUntilCanPickAt / 60) : undefined

	const pressed = useSharedValue(false)

	const { interactiveButtonStyle, interactiveTextStyle } = useInteractiveButtonStyle({
		pressed,
		duration: 25,
		scale: 0.965,
		textOpacity: 0.5,
	})

	const shakeXOffset = useSharedValue(0)

	const shakeXOffsetStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: shakeXOffset.value }],
		}
	})

	return secondsUntilCanPickAt !== undefined && minutesUntilCanPickAt !== undefined ? (
		<AnimatedPressable
			onPress={onPress}
			onPressIn={() => {
				if (secondsUntilCanPickAt === 0) pressed.value = true
			}}
			onPressOut={() => (pressed.value = false)}
			style={[interactiveButtonStyle, shakeXOffsetStyle]}
			className="h-[76px] w-[76px] items-center justify-center rounded-full bg-purple-text"
		>
			<Animated.Text
				style={interactiveTextStyle}
				className="text-[18px] font-semibold text-white"
			>
				{secondsUntilCanPickAt === 0 ? (
					<LightningIcon />
				) : (
					<>
						{minutesUntilCanPickAt.toString().padStart(2, "0")}:
						{(secondsUntilCanPickAt % 60).toString().padStart(2, "0")}
					</>
				)}
			</Animated.Text>
		</AnimatedPressable>
	) : null
}

export default PickingButton
