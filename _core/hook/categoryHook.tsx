import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/_config/store";
import {
	selectCategories,
	fetchCategories,
	selectCategoriesLoading,
} from "@/_config/features/categories/categorie.slice";

export function useCategory() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(fetchCategories());
	}, [dispatch]);

	return {
		categories: useAppSelector(selectCategories),
		isLoading: useAppSelector(selectCategoriesLoading),
		errors: [],
	};
}
