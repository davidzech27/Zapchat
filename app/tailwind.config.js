/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{tsx,ts}"],
	theme: {
		extend: {
			colors: {
				"primary-300": "#707CFF",
				"primary-400": "#5D6AF8",
				"primary-500": "#565EF0",
				"primary-600": "#474EE9",
				"secondary-500": "#9B58FF",
			},
		},
	},
	plugins: [],
}
