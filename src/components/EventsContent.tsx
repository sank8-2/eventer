import React, { useEffect, useState } from "react";
import { fetchAllEvents } from "../lib/api";
import { EventCard } from "./EventCard";
import type { EventData } from "../data/mockEvents";
import { Filter, Search, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function EventsContent() {
    const { user, isLoading: authLoading } = useAuth();
    const [events, setEvents] = useState<EventData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        async function loadEvents() {
            try {
                const data = await fetchAllEvents();
                setEvents(data);
            } catch (err) {
                console.error("Failed to load events", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadEvents();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <>
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">
                        All Events
                    </h1>
                    <p className="text-text-secondary mt-2">
                        Discover and manage your upcoming schedule.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            className="w-full bg-surface-hover/50 border border-border rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-colors"
                        />
                    </div>
                    <button className="p-2 border border-border rounded-xl hover:bg-surface-hover transition-colors text-text-secondary hover:text-white">
                        <Filter className="w-5 h-5" />
                    </button>
                    {user && (
                        <a
                            href="/events/new"
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors shrink-0"
                        >
                            Create Event
                        </a>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
                {events.length === 0 && (
                    <div className="md:col-span-full p-12 text-center text-text-secondary border border-border border-dashed rounded-2xl glass">
                        No events found matching your criteria.
                    </div>
                )}
            </div>
        </>
    );
}
