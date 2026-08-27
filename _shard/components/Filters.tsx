import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, ScrollView, TouchableOpacity } from "react-native";

import { ICategory } from "@/_core/model/ICategory";

/** Libellé de la puce « toutes catégories » (pas une catégorie de l'API). */
export const ALL_CATEGORIES = "Toutes";

interface Props {
	categories: Partial<ICategory>[];
	onPress?: () => void;
}

const Filters = ({ categories }: Props) => {
	const params = useLocalSearchParams<{ filter?: string }>();
	const [selectedCategory, setSelectedCategory] = useState(params.filter || ALL_CATEGORIES);

	const handleCategoryPress = (category: string) => {
		if (selectedCategory === category) {
			setSelectedCategory("");
			// router.setParams({ filter: "" });
			return;
		}

		setSelectedCategory(category);
		// router.setParams({ filter: category });
	};

	return (
		<ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 mb-2">
			{[{ id: 0, name: ALL_CATEGORIES, color: "green" }, ...categories].map((item, index) => (
				<TouchableOpacity
					onPress={() => handleCategoryPress(item.name ?? "")}
					key={index}
					className={`flex flex-col items-start mr-4 px-4 py-2 rounded-full ${
						selectedCategory === item.name ? "bg-primary" : "bg-primary-100 border border-primary-100"
					}`}>
					<Text
						className={`text-sm ${
							selectedCategory === item.name
								? "text-white font-poppins-bold mt-0.5"
								: "text-black font-poppins"
						}`}>
						{item.name}
					</Text>
				</TouchableOpacity>
			))}
		</ScrollView>
	);
};

export default Filters;
