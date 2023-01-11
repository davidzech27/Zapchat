import { type FC, useEffect } from "react"
import { useWindowDimensions, View } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withTiming,
	Easing,
	runOnJS,
} from "react-native-reanimated"
import {
	useNavigationBuilder,
	TabRouter,
	CommonActions,
	DefaultNavigatorOptions,
	ParamListBase,
	TabNavigationState,
	TabRouterOptions,
	createNavigatorFactory,
	NavigationHelpers,
	Descriptor,
	RouteProp,
	NavigationProp,
	TabActionHelpers,
} from "@react-navigation/native"

type ScreenSwiperNavigationProp<
	ParamList extends ParamListBase,
	RouteName extends keyof ParamList = keyof ParamList,
	NavigatorID extends string | undefined = undefined
> = NavigationProp<
	ParamList,
	RouteName,
	NavigatorID,
	TabNavigationState<ParamList>,
	TabNavigationOptions,
	TabNavigationEventMap
> &
	TabActionHelpers<ParamList>

export type TabBarProps<ParamList extends ParamListBase = ParamListBase> = {
	state: TabNavigationState<ParamList>
	navigation: NavigationHelpers<ParamList, TabNavigationEventMap>
	descriptors: Record<
		string,
		Descriptor<
			TabNavigationOptions,
			ScreenSwiperNavigationProp<ParamList>,
			RouteProp<ParamList>
		>
	>
}

export type ScreenProps<
	ParamList extends ParamListBase,
	RouteName extends keyof ParamList,
	NavigatorID extends string | undefined = undefined
> = {
	navigation: ScreenSwiperNavigationProp<ParamList, RouteName, NavigatorID>
	route: RouteProp<ParamList, RouteName>
}

type TabNavigationConfig = {
	TabBar?: FC<TabBarProps>
} //* config for the navigator

type TabNavigationOptions = {} //* configurable options for each screen

type TabNavigationEventMap = {} //* map of events emitted

type Props = DefaultNavigatorOptions<
	ParamListBase,
	TabNavigationState<ParamListBase>,
	TabNavigationOptions,
	TabNavigationEventMap
> &
	TabRouterOptions &
	TabNavigationConfig

const ScreenSwiper: FC<Props> = ({ initialRouteName, children, screenOptions, TabBar }) => {
	const { state, navigation, descriptors, NavigationContent } = useNavigationBuilder(TabRouter, {
		children,
		screenOptions,
		initialRouteName,
	})

	const screenWidth = useWindowDimensions().width

	const xOffset = useSharedValue(state.index * screenWidth)

	const animatedOffsetStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: xOffset.value }],
		}
	})

	useEffect(() => {
		if (xOffset.value % screenWidth === 0) {
			// relies on this only being true when navigation occurs not as a result of swiping
			xOffset.value = -1 * state.index * screenWidth
		}
	}, [state.index])

	const navigateToScreen = ({ name }: { name: string }) => {
		navigation.dispatch({
			...CommonActions.navigate({
				name,
				merge: true,
			}),
			target: state.key,
		})
	}

	const panGesture = Gesture.Pan()
		.onUpdate(({ translationX }) => {
			if (
				(translationX > 0 && state.index === 0) ||
				(translationX < 0 && state.index === state.routeNames.length - 1)
			)
				return

			xOffset.value = translationX - state.index * screenWidth // relies on navigation state not changing until onEnd
		})
		.onEnd(({ translationX, velocityX }) => {
			if (
				(translationX > 0 && state.index === 0) ||
				(translationX < 0 && state.index === state.routeNames.length - 1)
			)
				return // works because when user tries to reverse their swipe before transitions completes, xOffset changes will still reflect translationX

			if (
				(Math.abs(translationX) > screenWidth / 6 || Math.abs(velocityX) > 50) &&
				(Math.sign(velocityX) === Math.sign(translationX) || velocityX === 0)
			) {
				const newOffset =
					-1 * state.index * screenWidth + screenWidth * Math.sign(translationX)

				xOffset.value = withTiming(newOffset, {
					easing: Easing.bezier(0.17, 1.11, 0.8, 0.95),
					duration: 250,
				})

				runOnJS(navigateToScreen)({
					name: state.routeNames[state.index - Math.sign(translationX)],
				})
			} else {
				xOffset.value = withTiming(state.index * screenWidth * -1, {
					easing: Easing.bezier(0.17, 1.11, 0.8, 0.95), //(0.2, 1.13, 0.67, 0.95),
					duration: 250,
				})
			}
		})

	return (
		<NavigationContent>
			<>
				<GestureDetector gesture={panGesture}>
					<Animated.View style={[{ flex: 1, flexDirection: "row" }, animatedOffsetStyle]}>
						{state.routes.map((route, routeIndex) => {
							return (
								<View key={route.key} style={[{ width: screenWidth }]}>
									{descriptors[route.key].render()}
								</View>
							)
						})}
					</Animated.View>
				</GestureDetector>
				{!!TabBar && (
					<TabBar
						descriptors={descriptors as any}
						navigation={navigation}
						state={state}
					/>
				)}
			</>
		</NavigationContent>
	)
}

export default createNavigatorFactory(ScreenSwiper)
