import { ActivityIndicator, FlatList, Image, Text, TextInput, TouchableOpacity, View, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import NoResults from "@/_shard/components/NoResult";
import { Card, FeaturedCard } from "@/_shard/components/Cards";
import icons from "@/_shard/constants/icons";
import images from "@/_shard/constants/images";
import Filters from "@/_shard/components/Filters";
import { useContext, useEffect, useState } from "react";
import { EventContext } from "@/_core/context/EventContext";
import { CategoryContext } from "@/_core/context/CategoryContext";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const Index = () => {
	const loading = false;
	const lastestPropertiesLoading = false;

	const [properties, setProperties] = useState<any>([]);
	const [latestProperties, setLatestProperties] = useState<any>([]);

	const [allCategories, setAllsProperties] = useState<any>([]);

	const router = useRouter();

	const handleCardPress = (eventId: number) => {
		router.push(`/(root)/event/${eventId}`);
	};

	const [search, setSearch] = useState("");
	const [isSearchMode, setIsSearchMode] = useState(false);

	const handleSearch = () => {};

	const toggleSearchMode = () => {
		setIsSearchMode((state) => !state);
	};

	const eventContext = useContext(EventContext);
	const categoriesContext = useContext(CategoryContext);

	if (!eventContext) throw new Error("Must be used inside EventProvider");
	if (!categoriesContext) throw new Error("Must be used inside CategoryContext");

	const {
		events,
		isLoading: isLoadingEvent,
		errors: errorsEventContext,
		hasMore,
		loadMore,
	} = eventContext;
	const { categories, isLoading: isLoadingCategories, errors: errorsCategoriesContext } = categoriesContext;

	useEffect(() => {
		// `events` vient du contexte : ne pas le muter avec `reverse()`.
		setLatestProperties(events);
		setProperties([...events].reverse());
	}, [events]);

	useEffect(() => {
		setAllsProperties(categories);
	}, [categories]);

	return (
		<SafeAreaView className="bg-gray-50 flex-1">
			<FlatList
				data={properties}
				renderItem={({ item }) => <Card event={item} onPress={() => handleCardPress(item.id)} />}
				keyExtractor={(item) => item.id.toString()}
				numColumns={2}
				onEndReached={() => hasMore && loadMore()}
				onEndReachedThreshold={0.5}
				contentContainerClassName="pb-32"
				columnWrapperClassName="flex gap-4 px-4"
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					isLoadingEvent ? <ActivityIndicator size="large" className="text-primary-300 mt-5" /> : <NoResults />
				}
				ListHeaderComponent={
					<View>
						{/* Header Section with Gradient */}
						<LinearGradient
							colors={["#5C27C0", "#7C3AED"]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							className="pb-8 rounded-b-[40px]"
						>
							{/* Top Bar */}
							<View className="px-5 pt-2">
								<View className="flex-row items-center justify-between mb-6">
									<View>
										<Text className="text-white/70 text-sm font-poppins">Bon retour 👋</Text>
										<Text className="text-2xl font-poppins-bold text-white">Découvrez les événements</Text>
									</View>
									<View className="flex-row items-center gap-3">
										<TouchableOpacity className="bg-white/20 p-3 rounded-full">
											<Image source={icons.bell} tintColor="#FFFFFF" className="size-5" />
										</TouchableOpacity>
										<TouchableOpacity className="bg-white/20 p-3 rounded-full">
											<Image source={icons.search} tintColor="#FFFFFF" className="size-5" />
										</TouchableOpacity>
									</View>
								</View>

								{/* Search Bar */}
								<View className="bg-white/20 rounded-2xl flex-row items-center px-4 py-3 mb-6">
									<Image source={icons.search} tintColor="#FFFFFF" className="size-5" />
									<TextInput
										placeholder="Rechercher un événement, un artiste..."
										placeholderTextColor="rgba(255,255,255,0.6)"
										className="flex-1 ml-3 text-white font-poppins"
										value={search}
										onChangeText={setSearch}
									/>
									<TouchableOpacity className="bg-white/20 p-2 rounded-xl">
										<Image source={icons.filter} tintColor="#FFFFFF" className="size-5" />
									</TouchableOpacity>
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
										<Text className="text-white text-xs font-poppins-bold">À LA UNE</Text>
									</View>

									<View className="absolute bottom-4 left-4 right-4">
										<Text className="font-poppins-bold text-white text-xl mb-1">
											Imagine Dragons
										</Text>
										<View className="flex-row items-center justify-between">
											<View className="flex-row items-center">
												<Image source={icons.location} className="size-4 mr-1" tintColor="#fff" />
												<Text className="font-poppins text-white/80 text-sm">
													Los Angeles, CA
												</Text>
											</View>
											<View className="bg-white px-4 py-2 rounded-full">
												<Text className="font-poppins-bold text-primary-300 text-sm">
													Dès 145 000 Ar
												</Text>
											</View>
										</View>
									</View>
								</TouchableOpacity>
							</View>
						</LinearGradient>

						{/* This Week Section */}
						<View className="px-5 mt-6 mb-5">
							<View className="flex-row items-center justify-between mb-4">
								<View>
									<Text className="text-xl font-poppins-bold text-gray-800">Cette semaine</Text>
									<Text className="text-sm font-poppins text-gray-500">À ne pas manquer !</Text>
								</View>
								<TouchableOpacity className="flex-row items-center">
									<Text className="text-sm font-poppins-semibold text-primary-300 mr-1">Tout voir</Text>
									<Image source={icons.rightArrow} className="size-4" tintColor="#5C27C0" />
								</TouchableOpacity>
							</View>

							{lastestPropertiesLoading ? (
								<ActivityIndicator size="large" className="text-primary-300 mt-5" />
							) : !latestProperties || latestProperties.length === 0 ? (
								<NoResults />
							) : (
								<FlatList
									data={latestProperties}
									renderItem={({ item }) => <FeaturedCard event={item} onPress={() => handleCardPress(item.id)} />}
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
						<View className="px-5">
							<View className="flex-row items-center justify-between mb-4">
								<View>
									<Text className="text-xl font-poppins-bold text-gray-800">Explorer</Text>
									<Text className="text-sm font-poppins text-gray-500">Parcourir par catégorie</Text>
								</View>
								<TouchableOpacity className="flex-row items-center">
									<Text className="text-sm font-poppins-semibold text-primary-300 mr-1">Tout voir</Text>
									<Image source={icons.rightArrow} className="size-4" tintColor="#5C27C0" />
								</TouchableOpacity>
							</View>
							<Filters categories={[...allCategories].reverse()} />
						</View>

						{/* All Events Header */}
						<View className="px-5 mt-6 mb-2">
							<View className="flex-row items-center justify-between">
								<View>
									<Text className="text-xl font-poppins-bold text-gray-800">Événements à venir</Text>
									<Text className="text-sm font-poppins text-gray-500">{properties.length} événements près de chez vous</Text>
								</View>
							</View>
						</View>
					</View>
				}
			/>
		</SafeAreaView>
	);
};

export default Index;
