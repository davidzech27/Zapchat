import { createStackNavigator } from "@react-navigation/stack"
import type { StackScreenProps } from "@react-navigation/stack"
import { type FC } from "react"

type LandingStackParamList = {
	Phone: undefined
	OTP: undefined
	Name: undefined
	Username: undefined
}

export const LandingStack = createStackNavigator<LandingStackParamList>()

export type LandingStackScreen<RouteName extends keyof LandingStackParamList> = FC<
	StackScreenProps<LandingStackParamList, RouteName>
>
