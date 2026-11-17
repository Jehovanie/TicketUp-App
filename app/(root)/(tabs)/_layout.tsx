import { Tabs, useRouter } from "expo-router";
import { View, Text, Image, ImageSourcePropType, ActivityIndicator } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import icons from "@/_shard/constants/icons";
import { colors } from "@/_shard/constants/colors";
import { TAB_BAR_HEIGHT } from "@/_shard/constants/layout";
import { useSession } from "@/_core/context/SessionContext";

const TabIcon = ({ focused, icon, title }: { focused: boolean; icon: ImageSourcePropType; title: string }) => (
	<View className="flex-1 mt-3 items-center">
		{/* Pastille sous l'onglet actif : repère plus lisible qu'une simple teinte. */}
		<View
			className={`items-center justify-center rounded-xl px-4 py-1.5 ${focused ? "bg-primary-50" : ""}`}
		>
			<Image
				source={icon}
				tintColor={focused ? colors.primary[900] : colors.ink[400]}
				resizeMode="contain"
				className="size-5"
			/>
		</View>
		<Text
			className={`text-[10px] w-full text-center mt-1 ${
				focused ? "text-primary-900 font-poppins-semibold" : "text-ink-400 font-poppins"
			}`}
		>
			{title}
		</Text>
	</View>
);

const AppHomeLayout = () => {
	const { isLogged, isLoading } = useSession();
	const insets = useSafeAreaInsets();
	const router = useRouter();

	if (isLoading) {
		return (
			<SafeAreaView className="bg-surface h-full items-center justify-center">
				<ActivityIndicator size="large" color={colors.primary[600]} />
			</SafeAreaView>
		);
	}

	// Pas de `<Redirect href="./signin" />` ici : la consultation est publique.
	// La barre reste visible en permanence — c'est le troisième onglet qui
	// change de nature selon la session.
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: {
					backgroundColor: colors.surface.raised,
					position: "absolute",
					borderTopColor: colors.ink[200],
					borderTopWidth: 1,
					// `height` et non `minHeight` : c'est cette valeur que React
					// Navigation publie dans `BottomTabBarHeightContext`, dont les
					// écrans déduisent la place à réserver sous leurs listes.
					height: TAB_BAR_HEIGHT + insets.bottom,
					// Les icônes remontent au-dessus de la barre gestuelle.
					paddingBottom: insets.bottom,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Accueil",
					tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.home} title="Accueil" />,
				}}
			/>
			<Tabs.Screen
				name="explore"
				options={{
					title: "Explorer",
					tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.search} title="Explorer" />,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: isLogged ? "Profil" : "Se connecter",
					tabBarIcon: ({ focused }) => (
						<TabIcon
							focused={focused}
							icon={icons.person}
							title={isLogged ? "Profil" : "Se connecter"}
						/>
					),
				}}
				listeners={{
					// Déconnecté, l'onglet est un raccourci vers la connexion, pas une
					// destination : on intercepte avant la navigation plutôt que de
					// rediriger depuis `profile`. L'écran ne s'affiche donc jamais une
					// fraction de seconde, et l'onglet ne prend pas l'état actif.
					tabPress: (event) => {
						if (isLogged) return;

						event.preventDefault();
						router.push({
							pathname: "/(root)/(auth)/signin",
							params: { redirect: "/(root)/(tabs)" },
						});
					},
				}}
			/>
		</Tabs>
	);
};

export default AppHomeLayout;
