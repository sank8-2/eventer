import { useState, useEffect } from "react";
import { authStore, initAuth } from "../lib/authStore";

export function useAuth() {
    const [state, setState] = useState(authStore.getState());

    useEffect(() => {
        // Safe to call multiple times because of the isInitialized check inside
        initAuth();
        const unsub = authStore.subscribe(setState);
        return () => {
            unsub();
        };
    }, []);

    return state;
}
