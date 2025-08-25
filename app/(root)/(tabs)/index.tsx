import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import NoResults from "@/_shard/components/NoResult";
import { Card, FeaturedCard } from "@/_shard/components/Cards";
import icons from "@/_shard/constants/icons";
import images from "@/_shard/constants/images";
import Filters from "@/_shard/components/Filters";
import { useEffect, useState } from "react";
import { useEvent, useCategory } from "@/_core/hook";

const Index = () => {
	const [properties, setProperties] = useState<any>([]);
	const [latestProperties, setLatestProperties] = useState<any>([]);
	const [allCategories, setAllsProperties] = useState<any>([]);

	const { events, isLoading: isLoadingEvent, errors: errorsEventContext } = useEvent();
	const { categories, isLoading: isLoadingCategories, errors: errorsCategoriesContext } = useCategory();

	useEffect(() => {
		setLatestProperties(events);
		setProperties([...events].reverse());
	}, [isLoadingEvent]);

	useEffect(() => {
		setAllsProperties(categories);
	}, [isLoadingCategories]);

	return (
		<SafeAreaView className="bg-white flex-1">
			<FlatList
				data={properties}
				renderItem={({ item }) => <Card event={item} />}
				keyExtractor={(item) => item.uuid}
				numColumns={2}
				contentContainerClassName="pb-32"
				columnWrapperClassName="flex gap-5 px-5"
				showsVerticalScrollIndicator={false}
				ListEmptyComponent={
					isLoadingEvent ? (
						<ActivityIndicator size="large" className="text-primary-300 mt-5" />
					) : (
						<NoResults />
					)
				}
				ListHeaderComponent={
					<View>
						<View className="px-5 bg-primary-300 pb-10 rounded-bl-3xl rounded-br-3xl mb-5">
							<View className="flex flex-row items-center justify-between my-5">
								<View className="flex flex-row items-center">
									<Text className="text-3xl font-poppins-extrabold text-white">Home</Text>
								</View>
								<Image source={icons.search} tintColor={"#FFFFFF"} className="size-6" />
							</View>

							<View className="flex flex-row items-center justify-between w-full mb-5">
								<View className="relative h-[450px] w-full mx-auto bg-primary rounded-3xl">
									<Image source={images.imageiDragons} className="h-full w-full rounded-2xl" />

									<View className="absolute left-0 right-0 bottom-0 h-1/5 px-4 rounded-3xl z-10">
										<Text className="font-poppins-extrabold md:font-poppins-bold sm:font-poppins-semibold text-white text-4xl md:text-2xl sm:text-xl">
											Imagine Dragons
										</Text>
										<View className="flex flex-row sm:flex-col justify-between items-center mt-2">
											<Text className="font-poppins-medium text-white text-xl">
												Los Angeles, CA 90001, USA
											</Text>
											<Text className=" font-poppins-medium text-white text-xl">
												From: $145.0
											</Text>
										</View>
									</View>
								</View>
							</View>
						</View>

						<View className="px-5 mb-5">
							<View className="flex flex-row items-center justify-between">
								<Text className="text-xl font-poppins-semibold text-primary">This Week</Text>
								<TouchableOpacity>
									<Text className="text-base font-poppins-medium text-primary">See all</Text>
								</TouchableOpacity>
							</View>

							{isLoadingEvent ? (
								<ActivityIndicator size="large" className="text-primary-300 mt-5" />
							) : !latestProperties || latestProperties.length === 0 ? (
								<NoResults />
							) : (
								<FlatList
									data={latestProperties}
									renderItem={({ item }) => <FeaturedCard event={item} />}
									keyExtractor={(item) => item.id.toString()}
									horizontal
									bounces={false}
									showsHorizontalScrollIndicator={false}
									contentContainerClassName="gap-5 mt-5"
								/>
							)}
						</View>
						<View className="px-5">
							<View className="flex flex-row items-center justify-between mb-4">
								<Text className="text-xl font-poppins-semibold text-primary">Our Recomendation</Text>
								<TouchableOpacity>
									<Text className="text-base font-poppins-medium text-primary">See all</Text>
								</TouchableOpacity>
							</View>
							<Filters categories={[...allCategories].reverse()} />
						</View>
					</View>
				}
			/>
		</SafeAreaView>
	);
};

export default Index;
