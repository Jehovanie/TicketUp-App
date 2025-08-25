import { environment } from "@/environment/environement.local";

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

type AuthState = { token?: string; status: "idle" | "loading" | "error"; error?: string };
const initialState: AuthState = { status: "idle" };

export const login = createAsyncThunk(
    "auth/login", 
    async (payload: { email: string; password: string }) => {
        const res = await fetch(`${environment.apiUrl}/api/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

        if (!res.ok) throw new Error("Bad credentials");
        return (await res.json()) as { token: string };
    }
);

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		logout(state) {
			state.token = undefined;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(login.pending, (s) => {
				s.status = "loading";
				s.error = undefined;
			})
			.addCase(login.fulfilled, (s, a: PayloadAction<{ token: string }>) => {
				s.status = "idle";
				s.token = a.payload.token;
			})
			.addCase(login.rejected, (s, a) => {
				s.status = "error";
				s.error = a.error.message;
			});
	},
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
