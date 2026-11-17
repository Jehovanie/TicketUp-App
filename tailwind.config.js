const palette = require("./_shard/constants/palette");

/** @type {import('tailwindcss').Config} */
module.exports = {
	// `_shard` en entier (et plus seulement `_shard/components`) : la restriction
	// précédente faisait silencieusement disparaître les classes écrites ailleurs.
	content: ["./app/**/*.{js,jsx,ts,tsx}", "./_shard/**/*.{js,jsx,ts,tsx}"],
	presets: [require("nativewind/preset")],
	theme: {
		extend: {
			fontFamily: {
				poppins: ["Poppins-Regular", "sans-serif"],
				"poppins-light": ["Poppins-Light", "sans-serif"],
				"poppins-medium": ["Poppins-Medium", "sans-serif"],
				"poppins-semibold": ["Poppins-SemiBold", "sans-serif"],
				"poppins-bold": ["Poppins-Bold", "sans-serif"],
				"poppins-extrabold": ["Poppins-ExtraBold", "sans-serif"],
			},
			colors: palette,
		},
	},
	plugins: [],
};
