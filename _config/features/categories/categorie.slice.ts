import { environment } from "@/environment/environement.local";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./../../store";
import { ICategory } from "@/_core/model/ICategory";
import { client } from "@/_config/api/client";

interface CategoryState {
	list: Partial<ICategory>[];
	details?: ICategory;
	isLoading: boolean;
	errors: any[];
}

const initialState: CategoryState = {
	list: [],
	details: undefined,
	isLoading: false,
	errors: [],
};

// Thunks
export const fetchCategories = createAsyncThunk<ICategory[]>("categories/fetchAll", async () => {
	const res = await client.get<Partial<ICategory>[]>("/api/categories");
	return res.data as ICategory[];
});

export const fetchCategoryById = createAsyncThunk<ICategory, number>("categories/fetchById", async (id) => {
	const res = await fetch(`${environment.apiUrl}/api/categories/${id}`);
	if (!res.ok) throw new Error("Erreur de chargement");
	return (await res.json()) as ICategory;
});

// Slice
const categorySlice = createSlice({
	name: "categories",
	initialState,
	reducers: {
		clearDetails(state) {
			state.details = undefined;
		},
	},
	extraReducers: (builder) => {
		// selectCategories
		builder
			.addCase(fetchCategories.pending, (state) => {
				state.isLoading = true;
				state.errors = [];
			})
			.addCase(fetchCategories.fulfilled, (state, action: PayloadAction<ICategory[]>) => {
				state.isLoading = false;
				state.list = action.payload;
			})
			.addCase(fetchCategories.rejected, (state, action) => {
				state.isLoading = false;
				state.errors = [...state.errors, action.error.message || "Failed to fetch categories"];
			});

		// fetchCategoryById
		builder
			.addCase(fetchCategoryById.pending, (state) => {
				state.isLoading = true;
				state.errors = [];
			})
			.addCase(fetchCategoryById.fulfilled, (state, action: PayloadAction<ICategory>) => {
				state.isLoading = false;
				state.details = action.payload;
			})
			.addCase(fetchCategoryById.rejected, (state, action) => {
				state.isLoading = false;
				state.errors = [...state.errors, action.error.message || "Failed to fetch category details"];
			});
	},
});

export const { clearDetails } = categorySlice.actions;

// Selectors
export const selectCategories = (state: RootState) => state.categories.list;
export const selectCategoriesDetails = (state: RootState) => state.categories.details;
export const selectCategoriesLoading = (state: RootState) => state.categories.isLoading;

export default categorySlice.reducer;
