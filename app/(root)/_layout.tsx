import { Stack } from "expo-router";

export const unstable_settings = {
	anchor: "(tabs)", // `initialRouteName` est déprécié depuis expo-router 55
};

export default function RootLayout() {
	return <Stack screenOptions={{ headerShown: false }} />;
}
