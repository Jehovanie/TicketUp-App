import { FlatList, Image, Text, TouchableOpacity, View, Dimensions, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import NoResults from "@/_shard/components/NoResult";
import { Card, FeaturedCard } from "@/_shard/components/Cards";
import { FeaturedCardsSkeletonGroup, CardsSkeletonGroup } from "@/_shard/components/Skeleton";
import icons from "@/_shard/constants/icons";
import images from "@/_shard/constants/images";
import Filters from "@/_shard/components/Filters";
import { useContext, useEffect, useState } from "react";
import { EventContext } from "@/_core/context/EventContext";
import { CategoryContext } from "@/_core/context/CategoryContext";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const Index = () => {
	const lastestPropertiesLoading = false;

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [properties, setProperties] = useState<any>([]);
	const [latestProperties, setLatestProperties] = useState<any>([]);

	const [allCategories, setAllsProperties] = useState<any>([]);

	const router = useRouter();

	const handleCardPress = (eventId: number) => {
		router.push(`/(root)/event/${eventId}`);
	};

	const handleNavigateToExplore = () => {
		router.push("/(root)/(tabs)/explore");
	};

	const eventContext = useContext(EventContext);
	const categoriesContext = useContext(CategoryContext);

	if (!eventContext) throw new Error("Must be used inside EventProvider");
	if (!categoriesContext) throw new Error("Must be used inside CategoryContext");

	const { events, isLoading: isLoadingEvent, errors: errorsEventContext, fetchEvents, currentPage, itemsPerPage } = eventContext;
	const { categories, isLoading: isLoadingCategories, errors: errorsCategoriesContext } = categoriesContext;

	// Exemple: Charger plus d'événements
	const loadMoreEvents = () => {
		fetchEvents(currentPage + 1, itemsPerPage);
	};

	useEffect(() => {
		setIsLoading(isLoadingEvent);
		setLatestProperties([...events]);
		setProperties([...events].reverse());
	}, [events]);

	useEffect(() => {
		setAllsProperties(categories);
	}, [isLoadingCategories]);

	return (
		<SafeAreaView className="bg-gray-50 flex-1">
			<ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
				{/* Header fixe avec gradient et sections avant This Week */}
				<View>
					{/* Header Section with Gradient */}
					<LinearGradient
						colors={["#5C27C0", "#7C3AED"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						className="pb-8 rounded-b-[40px]"
					>
						{/* Top Bar */}
						<View className="px-5 pt-4 pb-6">
							<View className="flex-row items-center justify-between">
								<View className="flex-1">
									<Text className="text-white/70 text-sm font-poppins mb-1">Welcome back 👋</Text>
									<Text className="text-3xl font-poppins-bold text-white">Discover Events</Text>
								</View>
								<View className="flex-row items-center gap-3">
									<TouchableOpacity className="bg-white/20 p-3 rounded-full">
										<Image source={icons.bell} tintColor="#FFFFFF" className="size-5" />
									</TouchableOpacity>
									<TouchableOpacity
										className="bg-white/20 p-3 rounded-full"
										onPress={() => router.push("/(root)/(tabs)/explore")}
									>
										<Image source={icons.search} tintColor="#FFFFFF" className="size-5" />
									</TouchableOpacity>
								</View>
							</View>
						</View>

						{/* Featured Event Banner */}
						<View className="px-5">
							<TouchableOpacity className="relative h-[200px] w-full rounded-3xl overflow-hidden">
								<Image source={images.imageiDragons} className="size-full" resizeMode="cover" />
								<LinearGradient
									colors={["transparent", "rgba(0,0,0,0.8)"]}
									className="absolute inset-0"
								/>

								{/* Live Badge */}
								<View className="absolute top-4 left-4 bg-red-500 px-3 py-1 rounded-full flex-row items-center">
									<View className="w-2 h-2 bg-white rounded-full mr-2" />
									<Text className="text-white text-xs font-poppins-bold">FEATURED</Text>
								</View>

								<View className="absolute bottom-4 left-4 right-4">
									<Text className="font-poppins-bold text-white text-xl mb-1">Imagine Dragons</Text>
									<View className="flex-row items-center justify-between">
										<View className="flex-row items-center">
											<Image source={icons.location} className="size-4 mr-1" tintColor="#fff" />
											<Text className="font-poppins text-white/80 text-sm">Los Angeles, CA</Text>
										</View>
										<View className="bg-white px-4 py-2 rounded-full">
											<Text className="font-poppins-bold text-primary-300 text-sm">
												From $145
											</Text>
										</View>
									</View>
								</View>
							</TouchableOpacity>
						</View>
					</LinearGradient>
				</View>

				{/* This Week Section - STICKY */}
				<View className="bg-gray-50">
					<View className="px-5 py-6">
						<View className="flex-row items-center justify-between mb-4">
							<View>
								<Text className="text-xl font-poppins-bold text-gray-800">This Week</Text>
								<Text className="text-sm font-poppins text-gray-500">Don't miss out!</Text>
							</View>
							<TouchableOpacity className="flex-row items-center" onPress={handleNavigateToExplore}>
								<Text className="text-sm font-poppins-semibold text-primary-300 mr-1">See all</Text>
								<Image source={icons.rightArrow} className="size-4" tintColor="#5C27C0" />
							</TouchableOpacity>
						</View>

						{isLoading ? (
							<FeaturedCardsSkeletonGroup count={3} />
						) : (!isLoading && latestProperties.length === 0) ? (
							<NoResults />
						) : (
							<FlatList
								data={latestProperties}
								renderItem={({ item }) => (
									<FeaturedCard event={item} onPress={() => handleCardPress(item.id)} />
								)}
								keyExtractor={(item) => item.id.toString()}
								horizontal
								bounces={false}
								showsHorizontalScrollIndicator={false}
								contentContainerClassName="gap-4"
								snapToInterval={width * 0.75 + 16}
								decelerationRate="fast"
							/>
						)}
					</View>

					{/* Categories & Recommendations */}
					<View className="px-5 pb-5">
						<View className="flex-row items-center justify-between mb-4">
							<View>
								<Text className="text-xl font-poppins-bold text-gray-800">Explore</Text>
								<Text className="text-sm font-poppins text-gray-500">Browse by category</Text>
							</View>
							<TouchableOpacity className="flex-row items-center" onPress={handleNavigateToExplore}>
								<Text className="text-sm font-poppins-semibold text-primary-300 mr-1">See all</Text>
								<Image source={icons.rightArrow} className="size-4" tintColor="#5C27C0" />
							</TouchableOpacity>
						</View>
						<Filters categories={allCategories.reverse()} />
					</View>

					{/* All Events Header */}
					<View className="px-5 mb-2">
						<View className="flex-row items-center justify-between">
							<View>
								<Text className="text-xl font-poppins-bold text-gray-800">Upcoming Events</Text>
								<Text className="text-sm font-poppins text-gray-500">
									{properties.length} events near you
								</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Upcoming Events - Section scrollable */}
				<View className="px-4 pb-32">
					{isLoading ? (
						<CardsSkeletonGroup count={6} />
					) : (!isLoading && properties.length === 0) ? (
						<NoResults />
					) : (
						<View className="flex-row flex-wrap gap-4">
							{properties.map((item: any) => (
								<View key={item.id.toString()} style={{ width: (width - 48) / 2 }}>
									<Card event={item} onPress={() => handleCardPress(item.id)} />
								</View>
							))}
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
};

export default Index;
