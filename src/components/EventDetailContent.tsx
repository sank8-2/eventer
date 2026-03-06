import React, { useEffect, useState } from "react";
import { fetchEventById } from "../lib/api";
import type { EventData } from "../data/mockEvents";
import { TicketWidget } from "./TicketWidget";
import { AgendaList } from "./AgendaList";
import {
    Calendar,
    MapPin,
    Clock,
    ArrowLeft,
    ExternalLink,
    Ticket,
    LayoutList,
    Plane,
    Loader2,
    Edit,
    CalendarPlus,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { generateICSProperty, downloadICS } from "../lib/calendar";

export function EventDetailContent({ id }: { id: string }) {
    const { user } = useAuth();
    const [event, setEvent] = useState<EventData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadEvent() {
            try {
                const data = await fetchEventById(id);
                setEvent(data);
            } catch (err) {
                console.error("Error loading event detail", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadEvent();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] text-center gap-4">
                <h2 className="text-2xl font-bold text-white">
                    Event Not Found
                </h2>
                <p className="text-text-secondary">
                    This event might be private or it doesn't exist.
                </p>
                <a
                    href="/events"
                    className="mt-4 px-6 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors"
                >
                    Back to Events
                </a>
            </div>
        );
    }

    return (
        <>
            {/* Hero Banner Header */}
            <div className="h-64 md:h-80 w-full relative">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-6 left-6 z-20 flex items-center gap-4">
                    <a
                        href="/events"
                        className="flex items-center gap-2 text-white/80 hover:text-white bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl transition-all border border-white/10 hover:border-white/30"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to events
                    </a>
                    {user && event.user_id === user.id && (
                        <a
                            href={`/events/${event.id}/edit`}
                            className="flex items-center gap-2 text-white/80 hover:text-white bg-primary-600/80 backdrop-blur-md px-4 py-2 rounded-xl transition-all border border-primary-500/30 hover:bg-primary-500/80 hover:border-primary-500/50 shadow-lg shadow-primary-500/20"
                        >
                            <Edit className="w-4 h-4" /> Edit Event
                        </a>
                    )}
                </div>
            </div>

            <div className="px-8 md:px-12 -mt-20 relative z-20 max-w-6xl mx-auto pb-20">
                <div className="flex flex-col lg:flex-row gap-10">
                    <div className="flex-1 flex flex-col gap-8">
                        <div className="flex flex-col gap-4">
                            <span className="inline-flex max-w-max px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-300 capitalize border border-primary-500/30">
                                {event.type}
                            </span>
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                {event.title}
                            </h1>
                            <p className="text-lg text-text-secondary">
                                {event.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl border border-border glass flex items-center gap-4 group hover:border-primary-500/30 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="block text-sm text-text-secondary">
                                        Date
                                    </span>
                                    <span className="font-medium">
                                        {new Date(
                                            event.date,
                                        ).toLocaleDateString("en-US", {
                                            month: "long",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl border border-border glass flex items-center gap-4 group hover:border-primary-500/30 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <span className="block text-sm text-text-secondary">
                                        Time
                                    </span>
                                    <span className="font-medium">
                                        {event.time}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl border border-border glass flex items-center gap-4 group hover:border-primary-500/30 transition-colors md:col-span-2">
                                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <span className="block text-sm text-text-secondary">
                                        Location
                                    </span>
                                    <span className="font-medium">
                                        {event.location}
                                    </span>
                                </div>
                                <button className="p-2 text-text-secondary hover:text-white transition-colors">
                                    <ExternalLink className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <LayoutList className="w-6 h-6 text-primary-400" />
                                Agenda
                            </h2>
                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    onClick={() =>
                                        downloadICS(
                                            generateICSProperty(event as any),
                                            `${event.id}-calendar`,
                                        )
                                    }
                                    className="px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <CalendarPlus className="w-5 h-5" /> Add to
                                    Calendar
                                </button>
                            </div>
                            {event.agenda && event.agenda.length > 0 ? (
                                <div className="p-6 md:p-8 rounded-3xl border border-border glass">
                                    <AgendaList
                                        agenda={event.agenda as any}
                                        eventDetails={{
                                            title: event.title,
                                            location: event.location,
                                            date: event.date,
                                            description: event.description,
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="p-8 text-center text-text-secondary border border-border rounded-3xl border-dashed">
                                    No agenda details provided yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
                        {event.ticket && (
                            <div className="flex flex-col gap-4">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-primary-400" />{" "}
                                    Your Ticket
                                </h3>
                                <TicketWidget
                                    ticket={event.ticket}
                                    eventTitle={event.title}
                                />
                            </div>
                        )}

                        {event.travel && (
                            <div className="flex flex-col gap-4 mt-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Plane className="w-5 h-5 text-primary-400" />{" "}
                                    Travel Details
                                </h3>
                                <div className="p-5 rounded-2xl border border-border glass flex flex-col gap-4 relative overflow-hidden group">
                                    <div className="flex flex-col gap-1 z-10">
                                        <span className="text-sm text-text-secondary">
                                            Flight
                                        </span>
                                        <span className="font-medium text-lg">
                                            {event.travel.flight}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 z-10">
                                        <span className="text-sm text-text-secondary">
                                            Departure
                                        </span>
                                        <span className="font-medium">
                                            {event.travel.departureTime}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 mt-2 p-3 bg-surface-hover/50 rounded-xl z-10">
                                        <span className="text-xs text-text-secondary">
                                            Hotel Check-in
                                        </span>
                                        <span className="font-medium text-sm">
                                            {event.travel.hotel}
                                        </span>
                                        <span className="text-xs text-primary-300 mt-1">
                                            {event.travel.hotelCheckIn}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
