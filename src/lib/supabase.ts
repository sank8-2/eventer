import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    if (import.meta.env.PROD) {
        throw new Error("Missing Supabase Environment Variables");
    }
    console.warn(
        "Missing Supabase Environment Variables. Client will fail to connect.",
    );
}

// We type cast default to string to avoid TS errors when the env is missing in dev
export const supabase = createClient(supabaseUrl || "", supabaseKey || "");

// --- Database Types (Matching the SQL schema) ---
export type DbEvent = {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    image: string | null;
    type: string;
    description: string | null;
    created_at: string;
};

export type DbTicket = {
    id: string;
    event_id: string;
    type: string;
    price: string;
    seat: string | null;
    qr_code_mock: string;
};

export type DbAgendaDay = {
    id: string;
    event_id: string;
    day_label: string;
    sort_order: number;
};

export type DbAgendaSlot = {
    id: string;
    agenda_day_id: string;
    time: string;
    title: string;
    speaker: string | null;
    description: string | null;
    sort_order: number;
};

export type DbTravelPlan = {
    id: string;
    event_id: string;
    flight: string | null;
    departure_time: string | null;
    arrival_time: string | null;
    hotel: string | null;
    hotel_check_in: string | null;
};
