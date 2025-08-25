// api/events.ts
import { baseApi } from "./baseApi";
import { createCrudEndpoints } from "./utils";

export type Event = { id: number; title: string; date: string };

export const eventsApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		...createCrudEndpoints<Event>({ resource: "events", tag: "Event" })(builder),

		// Endpoints spécifiques au domaine
		search: builder.query<Event[], { q: string }>({
			query: ({ q }) => ({ url: "/events", params: { q } }),
			providesTags: (r) => (r ? r.map((e) => ({ type: "Event" as const, id: e.id })) : []),
			// selon besoin: serializeQueryArgs/merge/forceRefetch
		}),
	}),
	overrideExisting: false,
});

export const {
	useListQuery: useEventsListQuery,
	useByIdQuery: useEventByIdQuery,
	useSearchQuery: useEventsSearchQuery,
} = eventsApi;
