import { fetchEvents, selectEventLoading, selectEvents } from "@/_config/features/events/event.slice";
import { useAppDispatch, useAppSelector } from "@/_config/store";
import { useEffect } from "react";

export function useEvent() {
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(fetchEvents());
	}, [dispatch]);

	return {
		events: useAppSelector(selectEvents),
		isLoading: useAppSelector(selectEventLoading),
		errors: [],
	};
}