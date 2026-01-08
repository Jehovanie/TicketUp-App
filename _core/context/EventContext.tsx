import React, { createContext, useEffect, useState, ReactNode } from "react";
import { client } from "@/_config/api/client";
import { IEvent } from "@/_core/model/IEvent";

type DataEventType = {
	events: Partial<IEvent>[];
	eventsTotal: number;
	isLoading: boolean;
	errors: any[];
	currentPage: number;
	itemsPerPage: number;
	fetchEvents: (page?: number, itemsPerPage?: number) => Promise<void>;
};


type ResponseFetchEvents = {
	currentPage : number;
	items: Partial<IEvent>[];
	itemsTotal: number;
	nombreParPage: number;
};
// Define context type
export const EventContext: React.Context<DataEventType> = createContext<DataEventType>({
	events: [],
	eventsTotal: 0,
	isLoading: true,
	errors: [],
	currentPage: 1,
	itemsPerPage: 10,
	fetchEvents: async () => {},
});

export const EventProvider = ({ children }: { children: ReactNode }) => {
	const [dataEvents, setDataEvents] = useState<DataEventType>({
		events: [],
		isLoading: true,
		errors: [],
		eventsTotal: 0,
		currentPage: 1,
		itemsPerPage: 10,
		fetchEvents: async () => {},
	});

	const fetchEvents = async (page: number = 1, itemsPerPage: number = 10) => {
		setDataEvents((prev) => ({ ...prev, isLoading: true }));
		
		try {
			// Ajout des paramètres de pagination
			const params = new URLSearchParams({
				page: page.toString(),
				itemsPerPage: itemsPerPage.toString()
			});
			
			const response = await client.get<ResponseFetchEvents>(`/api/events?${params.toString()}`);
			const data = response.data;
			
			setDataEvents((prev)  => {
				// Filtrer les doublons en fonction de l'ID
				const existingIds = new Set(prev.events.map((event: Partial<IEvent>) => event.id));
				const newEvents = data.items.filter((event: Partial<IEvent>) => !existingIds.has(event.id));
				
				return {
					...prev,
					events: page === 1 ? data.items : [...prev.events, ...newEvents],
					isLoading: false,
					eventsTotal: data.itemsTotal,
					currentPage : data.currentPage,
					itemsPerPage: data.nombreParPage,
					fetchEvents,
				};
			});
		} catch (err) {
			setDataEvents((prev) => ({
				...prev,
				events: [],
				isLoading: false,
				errors: [err],
				eventsTotal: 0,
			}));
			console.error(err);
		}
	};

	useEffect(() => {
		fetchEvents();
	}, []);

	return <EventContext.Provider value={{ ...dataEvents, fetchEvents }}>{children}</EventContext.Provider>;
};
