import { useContext } from "react";
import { CategoryContext } from "../context/CategoryContext";

export function useEventCategory() {
    const context = useContext(CategoryContext);
    if (!context) throw new Error("useTheme doit être utilisé dans ThemeProvider");
    return context;
}
