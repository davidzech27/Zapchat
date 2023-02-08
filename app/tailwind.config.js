const colors = require("./colors")
const opacity = require("./opacity")

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{tsx,ts}"],
	theme: {
		extend: {
			colors,
			opacity,
		},
	},
	plugins: [],
}
