import type { FC } from "react"
import ScreenSwiper, { ScreenProps, TabBarProps } from "../../components/ScreenSwiper"

type MainSwiperParamList = {
	Add: undefined
	Inbox: undefined
	Picking: undefined
}

export const Swiper = ScreenSwiper<MainSwiperParamList>()

export type MainSwiperScreen<RouteName extends keyof MainSwiperParamList> = FC<
	ScreenProps<MainSwiperParamList, RouteName>
>

export type MainSwiperTabBar = FC<TabBarProps<MainSwiperParamList>>
