import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import AuthLogo from "@/_shard/components/AuthLogo";

const SignIn = () => {
	const handleSignIn = () => {};

	return (
		<SafeAreaView className="bg-primary-300 flex-1 relative h-screen">
			<View className="w-full h-[250px]">
				<AuthLogo />
			</View>
			<View className="absolute left-0 right-0 bottom-0 h-[75vh]">
				<View className="w-full h-full bg-white rounded-tl-[40px] rounded-tr-[40px] shadow-lg p-10">
					<Text className="text-2xl font-poppins-extrabold mb-4 text-black">Sign In</Text>
					<View className="mt-2">
						<View className="mb-4 w-full">
							<TextInput
								placeholder="Email"
								className="border border-gray-300 rounded-lg px-4 py-2"
								keyboardType="email-address"
							/>
							<Text className="text-red-600 text-sm ms-1 font-poppins-light">Email required</Text>
						</View>
						<View className="mb-4 w-full">
							<TextInput placeholder="Password" className="border border-gray-300 rounded-lg px-4 py-2" />
							<Text className="text-red-600 text-sm ms-1 font-poppins-light">Password required</Text>
						</View>

						<TouchableOpacity
							className="bg-purple-600 rounded-2xl py-3 mb-4 items-center"
							onPress={handleSignIn}
						>
							<Text className="text-white font-poppins-bold text-xl">Sign In</Text>
						</TouchableOpacity>
					</View>

					<View className="flex-row items-center justify-center mt-4">
						<Text className="font-poppins">
							Don't have an account?{" "}
							<Link href="/signup" className="font-poppins-bold text-primary">
								{" "}
								Sign Up{" "}
							</Link>
						</Text>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
};
export default SignIn;
