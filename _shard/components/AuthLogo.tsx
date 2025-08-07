import { Image, TouchableOpacity, View } from "react-native";
import images from "@/_shard/constants/images";
import { useRouter } from "expo-router";

const AuthLogo = () => {
	const router = useRouter();

	return (
		<View className="items-center mb-6">
			<TouchableOpacity onPress={() => router.push("/")}>
				<Image source={images.logoTransparent} className="h-[250px] w-[300px] mb-2" />
			</TouchableOpacity>
		</View>
	);
};

export default AuthLogo;
