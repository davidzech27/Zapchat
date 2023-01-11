const colors = require("./colors")

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{tsx,ts}"],
	theme: {
		extend: {
			colors,
			opacity: {
				"sub-text-on-white-background": 0.48,
			},
		},
	},
	plugins: [],
}
