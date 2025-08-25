import { environment } from "@/environment/environement.local";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./../../store";
import { IEvent } from "@/_core/model/IEvent";
import { client } from "@/_config/api/client";

interface EventState {
	list: Partial<IEvent>[];
	details?: IEvent;
	isLoading: boolean;
	errors: any[];
}

const initialState: EventState = {
	list: [],
	details: undefined,
	isLoading: true,
	errors: [],
};

// Thunks
export const fetchEvents = createAsyncThunk<IEvent[]>("events/fetchAll", async () => {
	const res = await client.get<Partial<IEvent>[]>("/api/events");
	return res.data as IEvent[];
});

export const fetchEventById = createAsyncThunk<IEvent, number>("events/fetchById", async (id) => {
	const res = await fetch(`${environment.apiUrl}/api/events/${id}`);
	if (!res.ok) throw new Error("Erreur de chargement");
	return (await res.json()) as IEvent;
});

// Slice
const eventSlice = createSlice({
	name: "events",
	initialState,
	reducers: {
		clearDetails(state) {
			state.details = undefined;
		},
	},
	extraReducers: (builder) => {
		// fetchEvents
		builder
			.addCase(fetchEvents.pending, (state) => {
				state.isLoading = true;
				state.errors = [];
			})
			.addCase(fetchEvents.fulfilled, (state, action: PayloadAction<IEvent[]>) => {
				state.isLoading = false;
				state.list = [...state.list, ...action.payload];
			})
			.addCase(fetchEvents.rejected, (state, action) => {
				state.isLoading = false;
				state.errors = [...state.errors, action.error.message || "Failed to fetch events"];
			});

		// fetchEventById
		builder
			.addCase(fetchEventById.pending, (state) => {
				state.isLoading = true;
				state.errors = [];
			})
			.addCase(fetchEventById.fulfilled, (state, action: PayloadAction<IEvent>) => {
				state.isLoading = false;
				state.details = action.payload;
			})
			.addCase(fetchEventById.rejected, (state, action) => {
				state.isLoading = false;
				state.errors = [...state.errors, action.error.message || "Failed to fetch event details"];
			});
	},
});

export const { clearDetails } = eventSlice.actions;

// Selectors
export const selectEvents = (state: RootState) => state.events.list;
export const selectEventDetails = (state: RootState) => state.events.details;
export const selectEventLoading = (state: RootState) => state.events.isLoading;

export default eventSlice.reducer;
