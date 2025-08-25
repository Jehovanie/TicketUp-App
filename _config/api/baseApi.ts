import { environment } from "@/environment/environement.local";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: `${environment.apiUrl}/api`,
		prepareHeaders: (headers, { getState }: any) => {
			const token = getState()?.auth?.token as string | undefined;
			if (token) headers.set("authorization", `Bearer ${token}`);
			return headers;
		},
	}),
	tagTypes: ["Event", "Category", "User"], // ajoutez vos ressources ici
	endpoints: () => ({}),
});
