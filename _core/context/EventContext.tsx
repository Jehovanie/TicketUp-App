import React, { createContext, useCallback, useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { getEvents, EVENTS_MAX_ITEMS_PER_PAGE } from "@/_config/api/events";
import { IEventListItem } from "@/_core/model/IEvent";

type EventContextType = {
	events: IEventListItem[];
	isLoading: boolean;
	/** Chargement d'une page suivante (la liste courante reste affichée). */
	isLoadingMore: boolean;
	errors: unknown[];
	/** Nombre total d'événements côté serveur, toutes pages confondues. */
	itemsTotal: number;
	currentPage: number;
	hasMore: boolean;
	loadMore: () => void;
	refresh: () => void;
};

export const EventContext: React.Context<EventContextType> = createContext<EventContextType>({
	events: [],
	isLoading: true,
	isLoadingMore: false,
	errors: [],
	itemsTotal: 0,
	currentPage: 0,
	hasMore: false,
	loadMore: () => {},
	refresh: () => {},
});

export const EventProvider = ({ children }: { children: ReactNode }) => {
	const [events, setEvents] = useState<IEventListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [errors, setErrors] = useState<unknown[]>([]);
	const [itemsTotal, setItemsTotal] = useState(0);
	const [currentPage, setCurrentPage] = useState(0);

	// `onEndReached` d'une FlatList se déclenche en rafale : on verrouille.
	const isFetching = useRef(false);

	const loadPage = useCallback(async (page: number) => {
		if (isFetching.current) return;
		isFetching.current = true;

		if (page === 1) setIsLoading(true);
		else setIsLoadingMore(true);

		try {
			const data = await getEvents({ page, itemsPerPage: EVENTS_MAX_ITEMS_PER_PAGE });

			setEvents((previous) => (page === 1 ? data.items : [...previous, ...data.items]));
			setItemsTotal(data.itemsTotal);
			setCurrentPage(data.currentPage);
			setErrors([]);
		} catch (err) {
			setErrors([err]);
			console.error("[EventContext] GET /api/events", err);
		} finally {
			isFetching.current = false;
			setIsLoading(false);
			setIsLoadingMore(false);
		}
	}, []);

	useEffect(() => {
		loadPage(1);
	}, [loadPage]);

	const hasMore = events.length < itemsTotal;

	const loadMore = useCallback(() => {
		if (hasMore) loadPage(currentPage + 1);
	}, [hasMore, currentPage, loadPage]);

	const refresh = useCallback(() => loadPage(1), [loadPage]);

	const value = useMemo<EventContextType>(
		() => ({
			events,
			isLoading,
			isLoadingMore,
			errors,
			itemsTotal,
			currentPage,
			hasMore,
			loadMore,
			refresh,
		}),
		[events, isLoading, isLoadingMore, errors, itemsTotal, currentPage, hasMore, loadMore, refresh]
	);

	return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};
