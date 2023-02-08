import type { ExpoConfig, ConfigContext } from "expo/config"
import Constants from "expo-constants"

export default ({ config }: ConfigContext): ExpoConfig => {
	return {
		name: "zap",
		slug: "zap",
		version: "1.0.0",
		orientation: "portrait",
		icon: "./assets/icon.png",
		userInterfaceStyle: "automatic",
		splash: {
			image: "./assets/icon.png",
			resizeMode: "contain",
			backgroundColor: "#000000",
		},
		updates: {
			fallbackToCacheTimeout: 0,
		},
		assetBundlePatterns: ["**/*"],
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/icon.png",
				backgroundColor: "#000000",
			},
		},
		plugins: [
			[
				"expo-image-picker",
				{
					photosPermission: "Your photos are used to choose your profile photo from.",
					cameraPermission: "Your camera is used to take your profile photo.",
				},
			],
		],
		jsEngine: "hermes",
		extra: {
			eas: {
				projectId: "7b85293e-9be4-4e0f-9d8b-b04699911777",
			},
		},
	}
}
