import type { ExpoConfig, ConfigContext } from "expo/config"

export default ({ config }: ConfigContext): ExpoConfig => {
	return {
		name: "Zapchat",
		slug: "Zapchat",
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
		ios: {
			supportsTablet: true,
		},
		android: {
			adaptiveIcon: {
				foregroundImage: "./assets/icon.png",
				backgroundColor: "#000000",
			},
		},
		extra: {
			eas: {
				projectId: "71f52372-adc4-4cf9-88bb-7b47455e2edc",
			},
		},
	}
}
