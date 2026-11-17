import React, { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import { getAllCategories } from "@/_config/api/categories";
import { ICategory } from "@/_core/model/ICategory";

type CategoryContextType = {
	categories: ICategory[];
	isLoading: boolean;
	errors: unknown[];
	itemsTotal: number;
	refresh: () => void;
};

export const CategoryContext: React.Context<CategoryContextType> = createContext<CategoryContextType>({
	categories: [],
	isLoading: true,
	errors: [],
	itemsTotal: 0,
	refresh: () => {},
});

export const CategoryProvider = ({ children }: { children: ReactNode }) => {
	const [categories, setCategories] = useState<ICategory[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [errors, setErrors] = useState<unknown[]>([]);
	const [itemsTotal, setItemsTotal] = useState(0);

	const load = useCallback(async () => {
		setIsLoading(true);
		try {
			const { items, itemsTotal: total } = await getAllCategories();
			setCategories(items);
			setItemsTotal(total);
			setErrors([]);
		} catch (err) {
			setErrors([err]);
			console.error("[CategoryContext] GET /api/categories", err);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const value = useMemo<CategoryContextType>(
		() => ({ categories, isLoading, errors, itemsTotal, refresh: load }),
		[categories, isLoading, errors, itemsTotal, load]
	);

	return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};
