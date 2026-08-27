import { View, Text, ScrollView, Image, TouchableOpacity, ImageSourcePropType, Alert } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import icons from "@/_shard/constants/icons";
import images from "@/_shard/constants/images";

interface SettingsItemProp {
	icon: ImageSourcePropType;
	title: string;
	subtitle?: string;
	textStyle?: string;
	showArrow?: boolean;
	onPress?: () => void;
	iconBgColor?: string;
}

const SettingsItem = ({ 
	icon, 
	title, 
	subtitle,
	textStyle, 
	showArrow = true, 
	onPress,
	iconBgColor = "bg-purple-100" 
}: SettingsItemProp) => (
	<TouchableOpacity 
		onPress={onPress}
		className="flex-row items-center justify-between py-4 px-4 bg-white rounded-2xl mb-3"
		style={{ elevation: 2 }}
	>
		<View className="flex-row items-center flex-1">
			<View className={`${iconBgColor} p-3 rounded-xl mr-4`}>
				<Image source={icon} className="size-5" tintColor="#5C27C0" />
			</View>
			<View className="flex-1">
				<Text className={`text-base font-poppins-semibold text-gray-800 ${textStyle}`}>{title}</Text>
				{subtitle && <Text className="text-xs font-poppins text-gray-500 mt-0.5">{subtitle}</Text>}
			</View>
		</View>
		{showArrow && (
			<View className="bg-gray-100 p-2 rounded-full">
				<Image source={icons.rightArrow} tintColor="#5C27C0" className="size-4" />
			</View>
		)}
	</TouchableOpacity>
);

const StatCard = ({ value, label, icon }: { value: string; label: string; icon: ImageSourcePropType }) => (
	<View className="flex-1 bg-white rounded-2xl p-4 items-center" style={{ elevation: 2 }}>
		<View className="bg-purple-100 p-3 rounded-xl mb-2">
			<Image source={icon} className="size-6" tintColor="#5C27C0" />
		</View>
		<Text className="text-2xl font-poppins-bold text-gray-800">{value}</Text>
		<Text className="text-xs font-poppins text-gray-500">{label}</Text>
	</View>
);

const Profile = () => {
	const user = {
		name: "Jehovanie RAMANDRIJOEL",
		email: "jehovanieram@gmail.com",
		phone: "+509 1234 5678",
		memberSince: "janv. 2024",
	};

	const handleLogout = () => {
		Alert.alert(
			"Déconnexion",
			"Voulez-vous vraiment vous déconnecter ?",
			[
				{ text: "Annuler", style: "cancel" },
				{ text: "Se déconnecter", style: "destructive", onPress: () => console.log("Déconnecté") }
			]
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32">
				{/* Header with Gradient */}
				<LinearGradient
					colors={["#5C27C0", "#7C3AED"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					className="pt-2 pb-20 rounded-b-[40px]"
				>
					{/* Top Bar */}
					<View className="px-5 flex-row items-center justify-between mb-6">
						<View>
							<Text className="text-2xl font-poppins-bold text-white">Profil</Text>
							<Text className="text-sm font-poppins text-white/70">Gérez votre compte</Text>
						</View>
						<View className="flex-row gap-3">
							<TouchableOpacity className="bg-white/20 p-3 rounded-full">
								<Image source={icons.bell} tintColor="#FFFFFF" className="size-5" />
							</TouchableOpacity>
							<TouchableOpacity className="bg-white/20 p-3 rounded-full">
								<Image source={icons.edit} tintColor="#FFFFFF" className="size-5" />
							</TouchableOpacity>
						</View>
					</View>

					{/* Profile Card */}
					<View className="items-center">
						<View className="relative">
							<View className="bg-white p-1.5 rounded-full shadow-lg">
								<Image source={images.avatar} className="size-28 rounded-full" />
							</View>
							<TouchableOpacity 
								className="absolute bottom-0 right-0 bg-primary p-2.5 rounded-full border-4 border-white"
								style={{ elevation: 4 }}
							>
								<Image source={icons.edit} tintColor="#FFFFFF" className="size-4" />
							</TouchableOpacity>
						</View>
						<Text className="text-2xl font-poppins-bold text-white mt-4">{user.name}</Text>
						<Text className="text-sm font-poppins text-white/80">{user.email}</Text>
					</View>
				</LinearGradient>

				{/* Stats Cards - Overlapping */}
				<View className="flex-row px-5 gap-3 -mt-10">
					<StatCard value="12" label="Événements" icon={icons.calendar} />
					<StatCard value="3" label="À venir" icon={icons.star} />
					<StatCard value="450 000 Ar" label="Dépensé" icon={icons.wallet} />
				</View>

				{/* Quick Actions */}
				<View className="px-5 mt-6">
					<Text className="text-lg font-poppins-bold text-gray-800 mb-4">Actions rapides</Text>
					<View className="flex-row gap-3">
						<TouchableOpacity 
							className="flex-1 bg-primary rounded-2xl p-4 flex-row items-center justify-center"
							style={{ elevation: 4 }}
						>
							<Image source={icons.calendar} className="size-5 mr-2" tintColor="#fff" />
							<Text className="text-white font-poppins-semibold">Mes réservations</Text>
						</TouchableOpacity>
						<TouchableOpacity 
							className="flex-1 bg-white rounded-2xl p-4 flex-row items-center justify-center border border-primary"
							style={{ elevation: 2 }}
						>
							<Image source={icons.wallet} className="size-5 mr-2" tintColor="#5C27C0" />
							<Text className="text-primary font-poppins-semibold">Paiements</Text>
						</TouchableOpacity>
					</View>
				</View>

				{/* Account Settings */}
				<View className="px-5 mt-6">
					<Text className="text-lg font-poppins-bold text-gray-800 mb-4">Paramètres du compte</Text>
					<SettingsItem 
						icon={icons.person} 
						title="Informations personnelles" 
						subtitle="Nom, e-mail, numéro de téléphone"
					/>
					<SettingsItem 
						icon={icons.shield} 
						title="Sécurité" 
						subtitle="Mot de passe, double authentification"
					/>
					<SettingsItem 
						icon={icons.bell} 
						title="Notifications" 
						subtitle="Préférences push et e-mail"
					/>
					<SettingsItem 
						icon={icons.language} 
						title="Langue" 
						subtitle="Français"
					/>
				</View>

				{/* Support */}
				<View className="px-5 mt-6">
					<Text className="text-lg font-poppins-bold text-gray-800 mb-4">Assistance</Text>
					<SettingsItem 
						icon={icons.info} 
						title="Centre d’aide" 
						subtitle="FAQ, contacter l’assistance"
					/>
					<SettingsItem 
						icon={icons.people} 
						title="Inviter des amis" 
						subtitle="Partagez et gagnez des récompenses"
					/>
				</View>

				{/* Logout */}
				<View className="px-5 mt-6">
					<TouchableOpacity 
						onPress={handleLogout}
						className="flex-row items-center justify-center py-4 bg-red-50 rounded-2xl border border-red-200"
					>
						<Image source={icons.logout} className="size-5 mr-3" tintColor="#EF4444" />
						<Text className="text-red-500 font-poppins-semibold text-base">Déconnexion</Text>
					</TouchableOpacity>
				</View>

				{/* App Version */}
				<View className="items-center mt-8 mb-4">
					<Text className="text-gray-400 font-poppins text-sm">TicketUp v1.0.0</Text>
					<Text className="text-gray-400 font-poppins text-xs mt-1">Membre depuis {user.memberSince}</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Profile;
