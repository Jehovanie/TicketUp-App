import { Card, CompactCard } from "@/_shard/components/Cards";
import Filters from "@/_shard/components/Filters";
import NoResults from "@/_shard/components/NoResult";
import icons from "@/_shard/constants/icons";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image, TextInput, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventContext } from "@/_core/context/EventContext";
import { CategoryContext } from "@/_core/context/CategoryContext";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const Explore = () => {
	const router = useRouter();
	
	const eventContext = useContext(EventContext);
	const categoriesContext = useContext(CategoryContext);
	
	if (!eventContext) throw new Error("Must be used inside EventProvider");
	if (!categoriesContext) throw new Error("Must be used inside CategoryContext");
	
	const { events, isLoading, errors } = eventContext;
	const { categories, isLoading: isLoadingCategories } = categoriesContext;

	const [filteredEvents, setFilteredEvents] = useState<any>([]);
	const [search, setSearch] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [selectedCategory, setSelectedCategory] = useState("All");

	const handleCardPress = (eventId: number) => {
		router.push(`/(root)/event/${eventId}`);
	};

	useEffect(() => {
		let result = events;
		
		// Filter by search
		if (search) {
			result = result.filter((event: any) => 
				event.title.toLowerCase().includes(search.toLowerCase()) ||
				event.location?.name?.toLowerCase().includes(search.toLowerCase())
			);
		}
		
		// Filter by category
		if (selectedCategory && selectedCategory !== "All") {
			result = result.filter((event: any) => 
				event.category?.name === selectedCategory
			);
		}
		
		setFilteredEvents(result);
	}, [isLoading, search, selectedCategory, events]);

	const handleCategoryPress = (categoryName: string) => {
		setSelectedCategory(categoryName);
	};

	const clearSearch = () => {
		setSearch("");
	};

	return (
		<SafeAreaView className="bg-gray-50 flex-1">
			<FlatList
				data={filteredEvents}
				renderItem={({ item }) => 
					viewMode === "grid" ? (
						<Card event={item} onPress={() => handleCardPress(item.id)} />
					) : (
						<View className="px-4">
							<CompactCard event={item} onPress={() => handleCardPress(item.id)} />
						</View>
					)
				}
				keyExtractor={(item) => item.id.toString()}
				numColumns={viewMode === "grid" ? 2 : 1}
				key={viewMode}
				contentContainerClassName="pb-32"
				columnWrapperClassName={viewMode === "grid" ? "flex gap-4 px-4" : undefined}
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					isLoading ? (
						<View className="flex-1 items-center justify-center py-20">
							<ActivityIndicator size="large" color="#5C27C0" />
							<Text className="text-gray-500 font-poppins mt-3">Loading events...</Text>
						</View>
					) : (
						<NoResults />
					)
				}
				ListHeaderComponent={
					<View>
						{/* Header with Gradient */}
						<LinearGradient
							colors={["#5C27C0", "#7C3AED"]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 1 }}
							className="pb-6 rounded-b-[40px]"
						>
							<View className="px-5 pt-2">
								{/* Title */}
								<View className="flex-row items-center justify-between mb-5">
									<View>
										<Text className="text-2xl font-poppins-bold text-white">Explore</Text>
										<Text className="text-sm font-poppins text-white/70">Find your next experience</Text>
									</View>
									<TouchableOpacity className="bg-white/20 p-3 rounded-full">
										<Image source={icons.filter} tintColor="#FFFFFF" className="size-5" />
									</TouchableOpacity>
								</View>

								{/* Search Bar */}
								<View className="bg-white rounded-2xl flex-row items-center px-4 py-3 shadow-lg">
									<Image source={icons.search} tintColor="#5C27C0" className="size-5" />
									<TextInput
										value={search}
										onChangeText={setSearch}
										placeholder="Search events, venues, artists..."
										placeholderTextColor="#9CA3AF"
										className="flex-1 ml-3 text-gray-800 font-poppins"
									/>
									{search.length > 0 && (
										<TouchableOpacity onPress={clearSearch} className="p-1">
											<View className="bg-gray-200 rounded-full p-1">
												<Text className="text-gray-500 text-xs font-bold px-1">✕</Text>
											</View>
										</TouchableOpacity>
									)}
								</View>
							</View>
						</LinearGradient>

						{/* Quick Stats */}
						<View className="flex-row px-5 py-4 gap-3">
							<View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
								<View className="flex-row items-center">
									<View className="bg-purple-100 p-2 rounded-xl mr-3">
										<Image source={icons.calendar} className="size-5" tintColor="#5C27C0" />
									</View>
									<View>
										<Text className="text-2xl font-poppins-bold text-gray-800">{events.length}</Text>
										<Text className="text-xs font-poppins text-gray-500">Events</Text>
									</View>
								</View>
							</View>
							<View className="flex-1 bg-white rounded-2xl p-4 shadow-sm">
								<View className="flex-row items-center">
									<View className="bg-purple-100 p-2 rounded-xl mr-3">
										<Image source={icons.location} className="size-5" tintColor="#5C27C0" />
									</View>
									<View>
										<Text className="text-2xl font-poppins-bold text-gray-800">{categories.length}</Text>
										<Text className="text-xs font-poppins text-gray-500">Categories</Text>
									</View>
								</View>
							</View>
						</View>

						{/* Categories */}
						<View className="px-5 mb-4">
							<Text className="text-lg font-poppins-bold text-gray-800 mb-3">Categories</Text>
							<ScrollView horizontal showsHorizontalScrollIndicator={false}>
								{[{ id: 0, name: "All" }, ...categories].map((item: any, index) => (
									<TouchableOpacity
										key={index}
										onPress={() => handleCategoryPress(item.name)}
										className={`mr-3 px-5 py-3 rounded-2xl ${
											selectedCategory === item.name 
												? "bg-primary" 
												: "bg-white border border-gray-200"
										}`}
										style={{ elevation: selectedCategory === item.name ? 4 : 1 }}
									>
										<Text
											className={`text-sm font-poppins-semibold ${
												selectedCategory === item.name ? "text-white" : "text-gray-600"
											}`}
										>
											{item.name}
										</Text>
									</TouchableOpacity>
								))}
							</ScrollView>
						</View>

						{/* Results Header */}
						<View className="px-5 flex-row items-center justify-between mb-2">
							<View>
								<Text className="text-lg font-poppins-bold text-gray-800">
									{search ? "Search Results" : "All Events"}
								</Text>
								<Text className="text-sm font-poppins text-gray-500">
									{filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"} found
								</Text>
							</View>
							
							{/* View Toggle */}
							<View className="flex-row bg-white rounded-xl p-1 shadow-sm">
								<TouchableOpacity 
									onPress={() => setViewMode("grid")}
									className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-primary" : ""}`}
								>
									<Image 
										source={icons.filter} 
										className="size-5" 
										tintColor={viewMode === "grid" ? "#fff" : "#666"} 
									/>
								</TouchableOpacity>
								<TouchableOpacity 
									onPress={() => setViewMode("list")}
									className={`p-2 rounded-lg ${viewMode === "list" ? "bg-primary" : ""}`}
								>
									<Image 
										source={icons.chat} 
										className="size-5" 
										tintColor={viewMode === "list" ? "#fff" : "#666"} 
									/>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				}
			/>
		</SafeAreaView>
	);
};

export default Explore;
