import React, { createContext, useEffect, useState, ReactNode } from "react";
import { client } from "../../_config/api/client";
import { ICategory } from "@/_core/model/ICategory";

type DataEventType = {
	currentPage: number;
	itemsTotal: number;
	categories: (Partial<ICategory> & { id: number })[];
	isLoading: boolean;
	errors: any[];
	fetchCategories: (page?: number) => Promise<void>;
};


type ResponseFetchCategories = {
	currentPage : number;
	items: (Partial<ICategory> & { id: number })[];
	itemsTotal: number;
	nombreParPage: number;
};

// Define context type
export const CategoryContext: React.Context<DataEventType> = createContext<DataEventType>({
	categories: [],
	isLoading: true,
	errors: [],
	currentPage: 1,
	itemsTotal: 0,
	fetchCategories: async () => {},
});

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
	const [dataCatagory, setDataCategory] = useState<DataEventType>({
		categories: [],
		isLoading: true,
		errors: [],
		currentPage: 1,
		itemsTotal: 0,
		fetchCategories: async () => {},
	});

	const fetchCategories = async (page: number = 1) => {
		setDataCategory((prev) => ({ ...prev, isLoading: true }));
		
		try {
			const params = new URLSearchParams({
				page: page.toString(),
			});
			
			const response = await client.get<ResponseFetchCategories>(`/api/categories?${params.toString()}`);
			const data = response.data;
			setDataCategory({
				categories: data.items,
				isLoading: false,
				errors: [],
				itemsTotal: data.itemsTotal,
				currentPage: data.currentPage,
				fetchCategories,
			});
		} catch (err) {
			setDataCategory((prev) => ({
				...prev,
				categories: [],
				isLoading: false,
				errors: [err],
				itemsTotal: 0,
				currentPage: 1,
			}));
			console.error(err);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	return <CategoryContext.Provider value={{ ...dataCatagory, fetchCategories }}>{children}</CategoryContext.Provider>;
};
