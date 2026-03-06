import React, { useEffect, useState } from "react";
import { fetchUpcomingEvents, fetchUpcomingTravelPlans } from "../lib/api";
import { EventCard } from "./EventCard";
import { ChevronRight, Plane, Loader2 } from "lucide-react";
import type { EventData } from "../data/mockEvents";

export function DashboardContent() {
    const [upcomingEvents, setUpcomingEvents] = useState<EventData[]>([]);
    const [travelPlans, setTravelPlans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [events, travel] = await Promise.all([
                    fetchUpcomingEvents(2),
                    fetchUpcomingTravelPlans(),
                ]);
                setUpcomingEvents(events);
                setTravelPlans(travel);
            } catch (err) {
                console.error("Error loading dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        }
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                    Upcoming Events
                    <span className="px-2.5 py-0.5 rounded-full bg-primary-500/10 text-primary-400 text-sm">
                        {upcomingEvents.length}
                    </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {upcomingEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                    {upcomingEvents.length === 0 && (
                        <div className="p-8 md:col-span-2 text-center border border-border rounded-xl glass text-text-secondary">
                            No upcoming events found. Create one or join a
                            global event!
                        </div>
                    )}
                </div>
                <div className="md:hidden mt-2">
                    <a
                        href="/events"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border glass text-primary-400 hover:bg-surface-hover font-medium transition-colors"
                    >
                        View all events <ChevronRight className="w-4 h-4" />
                    </a>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                    Next Travel
                </h2>
                {travelPlans.length > 0 ? (
                    travelPlans.map((plan) => (
                        <div
                            key={plan.id}
                            className="p-6 rounded-2xl glass border border-border flex flex-col gap-4 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-bl-full translate-x-8 -translate-y-8 transition-transform group-hover:scale-110" />
                            <div className="flex items-center gap-3 text-primary-400 mb-2">
                                <Plane className="w-6 h-6" />
                                <span className="font-semibold">
                                    {plan.title} Trip
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 z-10">
                                <span className="text-sm text-text-secondary">
                                    Flight
                                </span>
                                <span className="font-medium text-lg">
                                    {plan.travel?.flight}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 z-10">
                                <span className="text-sm text-text-secondary">
                                    Departure
                                </span>
                                <span className="font-medium">
                                    {plan.travel?.departureTime}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1 mt-2 p-3 bg-surface-hover/50 rounded-xl z-10">
                                <span className="text-xs text-text-secondary">
                                    Hotel Check-in
                                </span>
                                <span className="font-medium text-sm">
                                    {plan.travel?.hotel}
                                </span>
                                <span className="text-xs text-primary-300 mt-1">
                                    {plan.travel?.hotelCheckIn}
                                </span>
                            </div>
                            <a
                                href={`/events/${plan.id}`}
                                className="mt-2 w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors text-center text-sm z-10"
                            >
                                View Full Details
                            </a>
                        </div>
                    ))
                ) : (
                    <div className="p-8 rounded-2xl glass border border-border border-dashed flex flex-col items-center justify-center text-center text-text-secondary">
                        <Plane className="w-10 h-10 mb-4 opacity-50" />
                        <p>No upcoming travel plans.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
