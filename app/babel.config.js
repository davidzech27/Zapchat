module.exports = function (api) {
	api.cache(true)
	return {
		presets: ["babel-preset-expo", "@babel/preset-typescript"],
		plugins: [
			[
				"module:react-native-dotenv",
				{
					moduleName: "env",
					path: ".env",
					safe: false,
				},
			],
			"react-native-reanimated/plugin",
			"nativewind/babel",
		],
	}
}
