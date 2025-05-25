import React, { createContext, useEffect, useState, ReactNode } from "react";
import { client } from "../../_config/api/client";
import { IEvent } from "@/_core/model/IEvent";

type DataEventType = {
	events: Partial<IEvent>[];
	isLoading: boolean;
	errors: any[];
};
// Define context type
export const EventContext: React.Context<DataEventType> = createContext<DataEventType>({
	events: [],
	isLoading: true,
	errors: [],
});

export const EventProvider = ({ children }: { children: ReactNode }) => {
	const [dataEvents, setDataEvents] = useState<DataEventType>({
		events: [],
		isLoading: true,
		errors: [],
	});

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const response = await client.get<Partial<IEvent>[]>("/api/events");
				const tickets = response.data;
				setDataEvents({
					events: tickets,
					isLoading: false,
					errors: [],
				});
			} catch (err) {
				setDataEvents({
					events: [],
					isLoading: false,
					errors: [err],
				});
				console.error(err);
			}
		};

		fetchEvents();
	}, []);

	return <EventContext.Provider value={dataEvents}>{children}</EventContext.Provider>;
};
