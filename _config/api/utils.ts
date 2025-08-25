import { baseApi } from "./baseApi";

type IdLike = string | number;

export const providesList =
	<T extends { id: IdLike }>(type: string) =>
	(result?: T[]) =>
		result
			? [...result.map(({ id }) => ({ type, id } as const)), { type, id: "LIST" as const }]
			: [{ type, id: "LIST" as const }];

export const invalidatesList = (type: string) => [{ type, id: "LIST" as const }];

// Fabrique CRUD minimale (vous pouvez l’étendre)
export function createCrudEndpoints<T extends { id: IdLike }>(opts: {
	resource: string; // ex: 'events'
	tag: string; // ex: 'Event'
}) {
	const { resource, tag } = opts;
	return (builder: (typeof baseApi)["endpoints"] extends (b: infer B) => any ? B : never) => ({
		list: builder.query<T[], void>({
			query: () => `/${resource}`,
			providesTags: providesList<T>(tag),
		}),
		byId: builder.query<T, IdLike>({
			query: (id : IdLike) => `/${resource}/${id}`,
			providesTags: (_r :any , _e :any , id: IdLike) => [{ type: tag, id }],
		}),
	});
}
