// api/categories.ts
import { baseApi } from "./baseApi";
import { createCrudEndpoints } from "./utils";

export type Category = { id: number; name: string };

export const categoriesApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		...createCrudEndpoints<Category>({ resource: "categories", tag: "Category" })(builder),
	}),
});

export const { useListQuery: useCategoriesListQuery, useByIdQuery: useCategoryByIdQuery } = categoriesApi;
