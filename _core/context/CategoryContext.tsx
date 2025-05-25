import React, { createContext, useEffect, useState, ReactNode } from "react";
import { client } from "../../_config/api/client";
import { ICategory } from "@/_core/model/ICategory";

type DataEventType = {
	categories: Partial<ICategory>[];
	isLoading: boolean;
	errors: any[];
};
// Define context type
export const CategoryContext: React.Context<DataEventType> = createContext<DataEventType>({
	categories: [],
	isLoading: true,
	errors: [],
});

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
	const [dataCatagory, setDataCategory] = useState<DataEventType>({
		categories: [],
		isLoading: true,
		errors: [],
	});

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await client.get<Partial<ICategory>[]>("/api/categories");
				const categories = response.data;
				setDataCategory({
					categories: categories,
					isLoading: false,
					errors: [],
				});
			} catch (err) {
				setDataCategory({
					categories: [],
					isLoading: false,
					errors: [err],
				});
				console.error(err);
			}
		};

		fetchCategories();
	}, []);

	return <CategoryContext.Provider value={dataCatagory}>{children}</CategoryContext.Provider>;
};
