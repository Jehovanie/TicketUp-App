import { Slot, SplashScreen, Stack } from "expo-router";

import "./global.css";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import { EventProvider } from "@/_core/context/EventContext";
import { CategoryProvider } from "@/_core/context/CategoryContext";
import { SessionProvider } from "@/_core/context/SessionContext";

export default function AppLayout() {
	const [fontsLoaded] = useFonts({
		"Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
		"Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
		"Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
		"Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
		"Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
		"Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
	});

	useEffect(() => {
		if (fontsLoaded) {
			// Hide the splash screen once the fonts are loaded
			SplashScreen.hideAsync();
		}
	}, [fontsLoaded]);

	if (!fontsLoaded) return null;

	// `SessionProvider` englobe les autres : le jeton qu'il pose sur le client
	// doit être en place avant tout appel des contextes de données.
	return (
		<SessionProvider>
			<CategoryProvider>
				<EventProvider>
					<Slot />
				</EventProvider>
			</CategoryProvider>
		</SessionProvider>
	);
}
