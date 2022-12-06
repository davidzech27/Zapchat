import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import { StyleSheet, Text, Pressable, TextInput, KeyboardAvoidingView } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { createStackNavigator } from "@react-navigation/stack"
import { useState, FC, useEffect } from "react"
import * as SplashScreen from "expo-splash-screen"
import { TRPCProvider, trpc } from "./lib/trpc"
import AuthSwitch from "./modules/auth/AuthSwitch"
import useAuthStore from "./modules/auth/useAuthStore"
import Landing from "./modules/landing/Landing"

SplashScreen.preventAutoHideAsync()

const App = () => {
	const accessTokenLoaded = useAuthStore((s) => s.accessToken !== undefined)

	const loadAccessToken = useAuthStore((s) => s.loadAccessToken)

	if (!accessTokenLoaded) {
		loadAccessToken()
	}

	useEffect(() => {
		if (accessTokenLoaded) SplashScreen.hideAsync()
	}, [accessTokenLoaded])

	return (
		<TRPCProvider>
			<SafeAreaProvider>
				<NavigationContainer>
					<AuthSwitch authed={<></>} unauthed={<Landing />} />
					<StatusBar style="auto" />
				</NavigationContainer>
			</SafeAreaProvider>
		</TRPCProvider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
})

export default App
