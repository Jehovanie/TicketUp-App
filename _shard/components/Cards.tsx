import icons from "@/_shard/constants/icons";
import images from "@/_shard/constants/images";
import { IEvent } from "@/_core/model/IEvent";
import { ITicketType } from "@/_core/model/ITicketType";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
	event: IEvent;
	onPress?: () => void;
}

export const FeaturedCard = ({ event, onPress }: Props) => {
	const { ticket_type } = event;

	const min_price_ticket = ticket_type.reduce((a: ITicketType, b: ITicketType) => (a.prix > b.prix ? a : b));

	// Format date
	const eventDate = new Date(event.startedAt);
	const day = eventDate.getDate();
	const month = eventDate.toLocaleString("en-US", { month: "short" }).toUpperCase();

	return (
		<TouchableOpacity 
			onPress={onPress} 
			className="w-72 h-80 rounded-3xl overflow-hidden shadow-lg"
			style={{ elevation: 8 }}
		>
			<Image source={images.maitreGims} className="size-full absolute" resizeMode="cover" />
			<LinearGradient
				colors={["transparent", "rgba(0,0,0,0.8)"]}
				className="size-full absolute"
			/>

			{/* Date Badge */}
			<View className="absolute top-4 left-4 bg-white rounded-xl px-3 py-2 items-center shadow-md">
				<Text className="text-2xl font-poppins-bold text-primary-300">{day}</Text>
				<Text className="text-xs font-poppins-semibold text-gray-500">{month}</Text>
			</View>

			{/* Favorite Button */}
			<TouchableOpacity className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2.5 rounded-full">
				<Image source={icons.heart} className="size-5" tintColor="#fff" />
			</TouchableOpacity>

			{/* Content */}
			<View className="absolute bottom-0 left-0 right-0 p-5">
				<View className="flex-row items-center mb-2">
					<View className="bg-primary/20 px-3 py-1 rounded-full">
						<Text className="text-xs font-poppins-semibold text-white">
							{event.category?.name || "Event"}
						</Text>
					</View>
				</View>
				
				<Text className="text-xl font-poppins-bold text-white mb-1" numberOfLines={1}>
					{event.title}
				</Text>
				
				<View className="flex-row items-center mb-3">
					<Image source={icons.location} className="size-4 mr-1" tintColor="#fff" />
					<Text className="text-sm font-poppins text-white/80" numberOfLines={1}>
						{event.location.name}
					</Text>
				</View>

				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<Text className="text-white/70 text-sm font-poppins">From </Text>
						<Text className="text-2xl font-poppins-bold text-white">${min_price_ticket.prix}</Text>
					</View>
					<View className="bg-white px-4 py-2 rounded-full">
						<Text className="text-primary-300 font-poppins-bold text-sm">Get Ticket</Text>
					</View>
				</View>
			</View>
		</TouchableOpacity>
	);
};

export const Card = ({ event, onPress }: Props) => {
	const { ticket_type } = event;
	const min_price_ticket = ticket_type.length > 0 
		? ticket_type.reduce((a: ITicketType, b: ITicketType) => (a.prix < b.prix ? a : b))
		: { prix: 0 };

	// Format date
	const eventDate = new Date(event.startedAt);
	const day = eventDate.getDate();
	const month = eventDate.toLocaleString("en-US", { month: "short" });
	const time = eventDate.toLocaleString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

	return (
		<TouchableOpacity 
			onPress={onPress}
			className="flex-1 bg-white rounded-2xl overflow-hidden mt-4 shadow-lg"
			style={{ elevation: 5 }}
		>
			{/* Image Container */}
			<View className="relative">
				<Image source={images.lafouine} className="w-full h-36 rounded-t-2xl" resizeMode="cover" />
				
				{/* Date Badge */}
				<View className="absolute top-3 left-3 bg-white rounded-lg px-2 py-1.5 items-center shadow-sm">
					<Text className="text-lg font-poppins-bold text-primary-300">{day}</Text>
					<Text className="text-[10px] font-poppins-semibold text-gray-500 uppercase">{month}</Text>
				</View>

				{/* Favorite Button */}
				<TouchableOpacity className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-sm">
					<Image source={icons.heart} className="size-4" tintColor="#5C27C0" />
				</TouchableOpacity>
			</View>

			{/* Content */}
			<View className="p-3">
				<Text className="text-sm font-poppins-bold text-gray-800 mb-1" numberOfLines={1}>
					{event.title}
				</Text>
				
				<View className="flex-row items-center mb-2">
					<Image source={icons.location} className="size-3 mr-1" tintColor="#666" />
					<Text className="text-xs font-poppins text-gray-500 flex-1" numberOfLines={1}>
						{event.location.name}
					</Text>
				</View>

				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<Image source={icons.calendar} className="size-3 mr-1" tintColor="#5C27C0" />
						<Text className="text-xs font-poppins-medium text-primary-300">{time}</Text>
					</View>
					<Text className="text-sm font-poppins-bold text-primary-300">${min_price_ticket.prix}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};

// New Compact Card for horizontal lists
export const CompactCard = ({ event, onPress }: Props) => {
	const { ticket_type } = event;
	const min_price_ticket = ticket_type.length > 0 
		? ticket_type.reduce((a: ITicketType, b: ITicketType) => (a.prix < b.prix ? a : b))
		: { prix: 0 };

	const eventDate = new Date(event.startedAt);
	const formattedDate = eventDate.toLocaleString("en-US", { 
		month: "short", 
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true 
	});

	return (
		<TouchableOpacity 
			onPress={onPress}
			className="flex-row bg-white rounded-2xl overflow-hidden shadow-md p-3 mb-3"
			style={{ elevation: 3 }}
		>
			<Image source={images.lafouine} className="w-20 h-20 rounded-xl" resizeMode="cover" />
			
			<View className="flex-1 ml-3 justify-center">
				<Text className="text-base font-poppins-bold text-gray-800 mb-1" numberOfLines={1}>
					{event.title}
				</Text>
				
				<View className="flex-row items-center mb-1">
					<Image source={icons.calendar} className="size-3.5 mr-1.5" tintColor="#666" />
					<Text className="text-xs font-poppins text-gray-500">{formattedDate}</Text>
				</View>
				
				<View className="flex-row items-center justify-between">
					<View className="flex-row items-center">
						<Image source={icons.location} className="size-3.5 mr-1" tintColor="#666" />
						<Text className="text-xs font-poppins text-gray-500" numberOfLines={1}>
							{event.location.name}
						</Text>
					</View>
					<Text className="text-sm font-poppins-bold text-primary-300">${min_price_ticket.prix}</Text>
				</View>
			</View>
		</TouchableOpacity>
	);
};
