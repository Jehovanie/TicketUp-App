/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./_shard/components/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			fontFamily: {
				poppins: ["Poppins-Regular", "serif"],
				"poppins-bold": ["Poppins-Bold", "sans-serif"],
				"poppins-extrabold": ["Poppins-ExtraBold", "sans-serif"],
				"poppins-medium": ["Poppins-Medium", "sans-serif"],
				"poppins-semibold": ["Poppins-SemiBold", "sans-serif"],
				"poppins-light": ["Rubik-Light", "sans-serif"],
			},
			colors: {
				primary: {
					DEFAULT: "#5C27C0",
					100: "#F7F3FF",
					200: "#0061FF1A",
					300: "#AF8BF3",
				},
				accent: {
					100: "#FBFBFD",
				},
				black: {
					DEFAULT: "#000000",
					100: "#8C8E98",
					200: "#666876",
					300: "#191D31",
				},
				danger: "#F75555",
			},
		},
	},
	plugins: [],
};
