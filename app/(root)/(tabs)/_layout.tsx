import icons from "@/_shard/constants/icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { View, Text, Image, ImageSourcePropType, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TabIcon = ({ focused, icon, title }: { focused: boolean; icon: ImageSourcePropType; title: string }) => (
	<View className="flex-1 mt-3 flex flex-col items-center">
		<Image source={icon} tintColor={focused ? "#5C27C0" : "#666876"} resizeMode="contain" className="size-6" />
		<Text
			className={`${
				focused ? "text-primary font-poppins-medium" : "text-black-200 font-poppins"
			} text-xs w-full text-center mt-1`}
		>
			{title}
		</Text>
	</View>
);

const AppHomeLayout = () => {
	const { loading, isLogged } = { loading: false, isLogged: true };

	if (loading) {
		return (
			<SafeAreaView className="bg-white h-full flex items-center justify-center">
				<ActivityIndicator className="text-primary-300" size="large" />
			</SafeAreaView>
		);
	}

	if (!isLogged) return <Redirect href="./signin" />;

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: {
					backgroundColor: "white",
					position: "absolute",
					borderTopColor: "#0061FF1A",
					borderTopWidth: 1,
					minHeight: 70,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "home",
					headerShown: false,
					tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.home} title={"Home"} />,
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					title: "search",
					headerShown: false,
					tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.search} title="Explore" />,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: "Profil",
					headerShown: false,
					tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.person} title="Profile" />,
				}}
			/>
		</Tabs>
	);
};

export default AppHomeLayout;
