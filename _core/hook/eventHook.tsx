import { useContext } from "react";
import { EventContext } from "../context/EventContext";

export function useEvent() {
	const context = useContext(EventContext);
	if (!context) throw new Error("useTheme doit être utilisé dans ThemeProvider");
	return context;
}
