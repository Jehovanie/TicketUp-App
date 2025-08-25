import { Card } from "@/_shard/components/Cards";
import Filters from "@/_shard/components/Filters";
import NoResults from "@/_shard/components/NoResult";
import Search from "@/_shard/components/Search";
import icons from "@/_shard/constants/icons";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventContext } from "@/_core/context/EventContext";
import { useContext, useEffect, useState } from "react";
import { useCategory, useEvent } from "@/_core/hook";

const Explore = () => {
	const context = useContext(EventContext);
	if (!context) throw new Error("Must be used inside EventProvider");

	const [latestProperties, setLatestProperties] = useState<any>([]);
	const [allCategories, setAllCategories] = useState<any>([]);

	const { events, isLoading: isLoadingEvent, errors: errorsEventContext } = useEvent();
	const { categories, isLoading: isLoadingCategories, errors: errorsCategoriesContext } = useCategory();
	

	useEffect(() => {
		setLatestProperties(events);
	}, [isLoadingEvent]);

	useEffect(() => {
		setAllCategories(categories);
	}, [isLoadingCategories]);

	return (
		<SafeAreaView className="bg-white flex-1">
			<FlatList
				data={latestProperties}
				renderItem={({ item }) => <Card event={item} />}
				keyExtractor={(item) => item.uuid}
				numColumns={2}
				contentContainerClassName="pb-32"
				columnWrapperClassName="flex flex-col"
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					isLoadingEvent ? (
						<ActivityIndicator size="large" className="text-primary-300 mt-5" />
					) : (
						<NoResults />
					)
				}
				ListHeaderComponent={
					<View className="bg-primary">
						<View className="px-5 pb-10">
							<View className="flex flex-row items-center justify-between my-5">
								<View className="flex flex-row items-center">
									<Text className="text-3xl font-poppins-extrabold text-white">Search</Text>
								</View>
								<Image source={icons.filter} tintColor={"#FFFFFF"} className="size-6" />
							</View>
							<Search />
						</View>
						<View className="bg-white px-5 py-2 rounded-tl-3xl rounded-tr-3xl">
							<Filters categories={allCategories} />
						</View>
					</View>
				}
			/>
		</SafeAreaView>
	);
};

export default Explore;
