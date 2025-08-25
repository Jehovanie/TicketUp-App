// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import eventReducer from "./features/events/event.slice";
import categoriesReducer from "./features/categories/categorie.slice";
import authReducer from "./features/auth/auth.slice";
import { TypedUseSelectorHook, useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export const store = configureStore({
	reducer: {
		events: eventReducer, 
		auth: authReducer, 
		categories: categoriesReducer
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
