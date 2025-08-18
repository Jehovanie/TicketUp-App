import { Stack } from "expo-router";

export const unstable_settings = {
	initialRouteName: "(tabs)", // ou "(auth)" si tu préfères démarrer là
};

export default function RootLayout() {
	return <Stack screenOptions={{ headerShown: false }} />;
}
