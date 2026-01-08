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
import { client } from "@/_config/api/client";
import { IEvent } from "@/_core/model/IEvent";

const Explore = () => {
	const router = useRouter();

	const eventContext = useContext(EventContext);
	const categoriesContext = useContext(CategoryContext);

	if (!eventContext) throw new Error("Must be used inside EventProvider");
	if (!categoriesContext) throw new Error("Must be used inside CategoryContext");

	const { events, isLoading, errors, eventsTotal, fetchEvents, currentPage : page, itemsPerPage } = eventContext;
	const { categories, isLoading: isLoadingCategories , itemsTotal } = categoriesContext;

	const [filteredEvents, setFilteredEvents] = useState<any>([]);
	const [search, setSearch] = useState("");
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [isSearching, setIsSearching] = useState(false);
	const [isSearchMode, setIsSearchMode] = useState(false);
	const [searchResults, setSearchResults] = useState<Partial<IEvent>[]>([]);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	// Calculer le nombre total de pages
	const totalPages = Math.ceil(eventsTotal / itemsPerPage);
	const hasMorePages = page < totalPages;

	const handleCardPress = (eventId: number) => {
		router.push(`/(root)/event/${eventId}`);
	};

	const handleSearch = async () => {
		if (!search.trim() && selectedCategory === "All") {
			setIsSearchMode(false);
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		setIsSearchMode(true);

		try {
			const params = new URLSearchParams();
			if (search.trim()) {
				params.append("title", search.trim());
			}
			if (selectedCategory !== "All") {
				const category = categories.find((cat: any) => cat.name === selectedCategory);
				if (category) {
					params.append("category", category?.id.toString());
				}
			}

			const response = await client.get<Partial<IEvent>[]>(`/api/events/search?${params.toString()}`);
			setSearchResults(response.data);
		} catch (error) {
			console.error("Erreur lors de la recherche:", error);
			setSearchResults([]);
		} finally {
			setIsSearching(false);
		}
	};

	useEffect(() => {
		// Si on est en mode recherche/filtre, utiliser les résultats de l'API
		if (isSearchMode) {
			setFilteredEvents(searchResults);
		} else {
			// Mode normal: afficher tous les événements
			setFilteredEvents(events);
		}
	}, [events, isSearchMode, searchResults]);

	// Recherche automatique avec debounce
	useEffect(() => {
		if (search.trim() || selectedCategory !== "All") {
			const timeoutId = setTimeout(() => {
				handleSearch();
			}, 500); // Délai de 500ms après la dernière frappe

			return () => clearTimeout(timeoutId);
		} else {
			setIsSearchMode(false);
			setSearchResults([]);
		}
	}, [search, selectedCategory]);

	const handleCategoryPress = (categoryName: string) => {
		setSelectedCategory(categoryName);
		// Si on sélectionne "All", revenir au mode normal
		if (categoryName === "All" && !search.trim()) {
			setIsSearchMode(false);
			setSearchResults([]);
		}
	};

	const clearSearch = () => {
		setSearch("");
		setSelectedCategory("All");
		setIsSearchMode(false);
		setSearchResults([]);
	};

	const handleLoadMore = async () => {
		// Ne pas charger si déjà en cours, en mode recherche, ou si on a atteint la dernière page
		if (isLoadingMore || isSearchMode || isLoading || !hasMorePages) return;

		setIsLoadingMore(true);
		try {
			await fetchEvents(page + 1);
		} catch (error) {
			console.error("Erreur lors du chargement de plus d'événements:", error);
		} finally {
			setIsLoadingMore(false);
		}
	};

	return (
		<SafeAreaView className="bg-gray-50 flex-1">
			{/* Sticky Header Section */}
			<View className="bg-gray-50">
				{/* Header with Gradient */}
				<LinearGradient
					colors={["#5C27C0", "#7C3AED"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					className="pb-4 rounded-b-[40px] shadow-xl"
				>
					<View className="px-5 pt-2">
						{/* Title */}
						<View className="flex-row items-center justify-between mb-4">
							<View>
								<Text className="text-2xl font-poppins-bold text-white">Explore</Text>
								<Text className="text-sm font-poppins text-white/70">
									Find your next experience
								</Text>
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
								onSubmitEditing={handleSearch}
								returnKeyType="search"
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
								<Text className="text-2xl font-poppins-bold text-gray-800">
									{eventsTotal}
								</Text>
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
								<Text className="text-2xl font-poppins-bold text-gray-800">
									{itemsTotal}
								</Text>
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
				<View className="px-5 flex-row items-center justify-between mb-4">
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

			{/* Scrollable Events List */}
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
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
				ListEmptyComponent={
					isLoading || isSearching ? (
						<View className="flex-1 items-center justify-center py-20">
							<ActivityIndicator size="large" color="#5C27C0" />
							<Text className="text-gray-500 font-poppins mt-3">
								{isSearching ? "Searching..." : "Loading events..."}
							</Text>
						</View>
					) : (
						<NoResults />
					)
				}
				ListFooterComponent={
					!isSearchMode ? (
						isLoadingMore ? (
							<View className="py-6">
								<ActivityIndicator size="small" color="#5C27C0" />
								<Text className="text-center text-gray-500 font-poppins mt-2 text-sm">
									Loading more events...
								</Text>
							</View>
						) : !hasMorePages && filteredEvents.length > 0 ? (
							<View className="py-6">
								<View className="mx-5 p-4 bg-purple-50 rounded-2xl border border-purple-200">
									<Text className="text-center text-gray-700 font-poppins-semibold text-sm mb-1">
										🎉 You've reached the end!
									</Text>
									<Text className="text-center text-gray-500 font-poppins text-xs">
										Page {page} of {totalPages} • {eventsTotal} total events
									</Text>
								</View>
							</View>
						) : null
					) : null
				}
			/>
		</SafeAreaView>
	);
};

export default Explore;
