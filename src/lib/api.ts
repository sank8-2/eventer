import { supabase } from "./supabase";
import type { EventData } from "../data/mockEvents";

export async function fetchUpcomingEvents(
    limit: number = 2,
): Promise<EventData[]> {
    const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true })
        .limit(limit);

    if (error || !events) return [];

    return events.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        location: e.location,
        image: e.image || "",
        type: e.type as EventData["type"],
        description: e.description || "",
        agenda: [],
    }));
}

export async function fetchAllEvents(): Promise<EventData[]> {
    const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

    if (error || !events) return [];

    return events.map((e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time,
        location: e.location,
        image: e.image || "",
        type: e.type as EventData["type"],
        description: e.description || "",
        agenda: [],
    }));
}

export async function fetchEventById(id: string): Promise<EventData | null> {
    const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

    if (eventError || !event) return null;

    const { data: ticket } = await supabase
        .from("tickets")
        .select("*")
        .eq("event_id", id)
        .single();
    const { data: travel } = await supabase
        .from("travel_plans")
        .select("*")
        .eq("event_id", id)
        .single();
    const { data: agendaDays } = await supabase
        .from("agenda_days")
        .select("*")
        .eq("event_id", id)
        .order("sort_order");

    let agenda = [];
    if (agendaDays && agendaDays.length > 0) {
        for (const day of agendaDays) {
            const { data: slots } = await supabase
                .from("agenda_slots")
                .select("*")
                .eq("agenda_day_id", day.id)
                .order("sort_order");
            agenda.push({
                day: day.day_label,
                slots: (slots || []).map((s) => ({
                    time: s.time,
                    title: s.title,
                    speaker: s.speaker || undefined,
                    description: s.description || undefined,
                })),
            });
        }
    }

    return {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        image: event.image || "",
        type: event.type as EventData["type"],
        description: event.description || "",
        ticket: ticket
            ? {
                  type: ticket.type,
                  price: ticket.price,
                  seat: ticket.seat || undefined,
                  qrCodeMock: ticket.qr_code_mock,
              }
            : undefined,
        travel: travel
            ? {
                  flight: travel.flight || undefined,
                  departureTime: travel.departure_time || undefined,
                  arrivalTime: travel.arrival_time || undefined,
                  hotel: travel.hotel || undefined,
                  hotelCheckIn: travel.hotel_check_in || undefined,
              }
            : undefined,
        agenda,
    };
}

export async function fetchUpcomingTravelPlans() {
    const { data: travelPlans, error } = await supabase
        .from("travel_plans")
        .select(
            `
            *,
            events ( id, title, date )
        `,
        )
        .order("departure_time", { ascending: true })
        .limit(2);

    if (error || !travelPlans) return [];

    return travelPlans.map((tp) => ({
        id: tp.events?.id || tp.event_id,
        title: tp.events?.title || "Unknown Event",
        travel: {
            flight: tp.flight,
            departureTime: tp.departure_time,
            arrivalTime: tp.arrival_time,
            hotel: tp.hotel,
            hotelCheckIn: tp.hotel_check_in,
        },
    }));
}
