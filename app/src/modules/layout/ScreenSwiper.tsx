import { useImperativeHandle, forwardRef, Children, ReactNode } from "react"
import { useWindowDimensions, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	runOnJS,
	withTiming,
	SharedValue,
} from "react-native-reanimated"
import { bezierEasing } from "../shared/util/easing"

interface ScreenSwiperProps {
	initialIndex: number
	onIndexChange?: (newIndex: number) => void
	syncWithIndexProgress?: SharedValue<number>
	children: ReactNode[]
}

export interface ScreenSwiperRef {
	navigateToIndex: (newIndex: number) => void
}

const ScreenSwiper = forwardRef<ScreenSwiperRef, ScreenSwiperProps>(
	({ initialIndex, onIndexChange, syncWithIndexProgress, children }, ref) => {
		const currentIndex = useSharedValue(initialIndex)

		const lastIndex = children.length - 1

		const screenWidth = useWindowDimensions().width

		const xOffset = useSharedValue(-1 * currentIndex.value * screenWidth)

		const animatedOffsetStyle = useAnimatedStyle(() => {
			return {
				transform: [{ translateX: xOffset.value }],
			}
		})

		useImperativeHandle(ref, () => ({
			navigateToIndex: (newIndex) => {
				currentIndex.value = newIndex
				xOffset.value = withTiming(-1 * newIndex * screenWidth, {
					easing: bezierEasing,
					duration: 250,
				})
				syncWithIndexProgress &&
					(syncWithIndexProgress.value = withTiming(newIndex, {
						easing: bezierEasing,
						duration: 250,
					}))
				onIndexChange && onIndexChange(newIndex)
			},
		}))

		const panGesture = Gesture.Pan()
			.onUpdate(({ translationX }) => {
				const possibleNewXOffset = translationX - currentIndex.value * screenWidth

				xOffset.value =
					possibleNewXOffset > 0
						? 0
						: possibleNewXOffset < lastIndex * -1 * screenWidth
						? lastIndex * -1 * screenWidth
						: possibleNewXOffset // relies on navigation state not changing until onEnd
				syncWithIndexProgress &&
					(syncWithIndexProgress.value = xOffset.value / -screenWidth)
			})
			.onEnd(({ translationX, velocityX }) => {
				if (
					(translationX > 0 && currentIndex.value === 0) ||
					(translationX < 0 && currentIndex.value === lastIndex)
				) {
					return
				}

				if (
					(Math.abs(translationX) > screenWidth / 6 || Math.abs(velocityX) > 50) &&
					(Math.sign(velocityX) === Math.sign(translationX) || velocityX === 0)
				) {
					const newOffset =
						-1 * currentIndex.value * screenWidth +
						screenWidth * Math.sign(translationX)

					xOffset.value = withTiming(newOffset, {
						easing: bezierEasing,
						duration: 250,
					})
					syncWithIndexProgress &&
						(syncWithIndexProgress.value = withTiming(
							currentIndex.value - Math.sign(translationX),
							{
								easing: bezierEasing,
								duration: 250,
							}
						))

					const newIndex = currentIndex.value - Math.sign(translationX)

					currentIndex.value = newIndex

					onIndexChange && runOnJS(onIndexChange)(newIndex)
				} else {
					xOffset.value = withTiming(currentIndex.value * screenWidth * -1, {
						easing: bezierEasing,
						duration: 250,
					})
					syncWithIndexProgress &&
						(syncWithIndexProgress.value = withTiming(currentIndex.value, {
							easing: bezierEasing,
							duration: 250,
						}))
				}
			})

		return (
			<View style={{ flex: 1 }}>
				<GestureDetector gesture={panGesture}>
					<Animated.View style={[{ flex: 1, flexDirection: "row" }, animatedOffsetStyle]}>
						{Children.map(children, (screen, screenIndex) => {
							return (
								<View key={screenIndex} style={[{ width: screenWidth }]}>
									{screen}
								</View>
							)
						})}
					</Animated.View>
				</GestureDetector>
			</View>
		)
	}
)

export default ScreenSwiper
