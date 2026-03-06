import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

type AuthState = {
    user: User | null;
    isAdmin: boolean;
    isLoading: boolean;
};

let state: AuthState = {
    user: null,
    isAdmin: false,
    isLoading: true,
};

type Listener = (state: AuthState) => void;
const listeners = new Set<Listener>();

function notify() {
    for (const listener of listeners) {
        listener(state);
    }
}

export const authStore = {
    subscribe(listener: Listener) {
        listeners.add(listener);
        listener(state);
        return () => listeners.delete(listener);
    },
    getState() {
        return state;
    },
};

let isInitialized = false;

export async function initAuth() {
    if (isInitialized) return;
    isInitialized = true;

    // First fetch the session
    const {
        data: { session },
    } = await supabase.auth.getSession();
    await handleSession(session);

    // Listen for future auth changes (login/logout)
    supabase.auth.onAuthStateChange((_event, session) => {
        handleSession(session);
    });
}

async function handleSession(session: any) {
    const currentUser = session?.user ?? null;
    if (!currentUser) {
        state = { user: null, isAdmin: false, isLoading: false };
        notify();
        return;
    }

    // Don't refetch if already loaded the same user
    if (state.user?.id === currentUser.id && state.isLoading === false) {
        return;
    }

    // Fetch profile data once
    const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", currentUser.id)
        .single();

    state = {
        user: currentUser,
        isAdmin: !!data?.is_admin,
        isLoading: false,
    };
    notify();
}
