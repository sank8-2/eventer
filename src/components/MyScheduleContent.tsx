import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
    Loader2,
    Calendar as CalendarIcon,
    MapPin,
    Mic,
    Trash2,
    CalendarPlus,
} from "lucide-react";
import { generateICSProperty, downloadICS } from "../lib/calendar";
import type { User } from "@supabase/supabase-js";

type WishlistTalk = {
    wishlist_id: string;
    slot: {
        id: string;
        time: string;
        title: string;
        description: string;
        speaker: string;
        about_speaker: string;
        type: string;
        agenda_day: {
            date: string;
            event: {
                id: string;
                title: string;
                location: string;
            };
        };
    };
};

export function MyScheduleContent() {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [talks, setTalks] = useState<WishlistTalk[]>([]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                window.location.href = "/login";
                return;
            }
            setUser(session.user);
            fetchSchedule(session.user.id);
        });
    }, []);

    const fetchSchedule = async (userId: string) => {
        setIsLoading(true);
        try {
            // Note: In Supabase we need to query from wishlist and join slots, days, and events
            // We can do a deep relation query:
            const { data, error } = await supabase
                .from("agenda_wishlist")
                .select(
                    `
                    id,
                    agenda_slots (
                        id, time, title, description, speaker, about_speaker, type,
                        agenda_days (
                            date,
                            events ( id, title, location )
                        )
                    )
                `,
                )
                .eq("user_id", userId);

            if (error) throw error;

            // Transform and sort
            const formatted = data
                .map((item: any) => ({
                    wishlist_id: item.id,
                    slot: {
                        id: item.agenda_slots.id,
                        time: item.agenda_slots.time,
                        title: item.agenda_slots.title,
                        description: item.agenda_slots.description,
                        speaker: item.agenda_slots.speaker,
                        about_speaker: item.agenda_slots.about_speaker,
                        type: item.agenda_slots.type,
                        agenda_day: {
                            date: item.agenda_slots.agenda_days.date,
                            event: item.agenda_slots.agenda_days.events,
                        },
                    },
                }))
                .sort((a, b) => {
                    const dateA = new Date(
                        `${a.slot.agenda_day.date} ${a.slot.time}`,
                    );
                    const dateB = new Date(
                        `${b.slot.agenda_day.date} ${b.slot.time}`,
                    );
                    return dateA.getTime() - dateB.getTime();
                });

            setTalks(formatted);
        } catch (err) {
            console.error("Failed to load schedule", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (wishlistId: string) => {
        try {
            await supabase
                .from("agenda_wishlist")
                .delete()
                .eq("id", wishlistId);
            setTalks(talks.filter((t) => t.wishlist_id !== wishlistId));
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    // Group talks by date
    const groupedTalks = talks.reduce(
        (acc, talk) => {
            const date = talk.slot.agenda_day.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(talk);
            return acc;
        },
        {} as Record<string, WishlistTalk[]>,
    );

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    My Schedule
                </h1>
                <p className="text-text-secondary mt-1">
                    Your saved talks and upcoming agenda plan.
                </p>
            </div>

            {Object.keys(groupedTalks).length === 0 ? (
                <div className="p-12 border border-border/50 border-dashed rounded-3xl flex flex-col items-center justify-center text-center gap-4 glass">
                    <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary">
                        <CalendarIcon className="w-8 h-8 opacity-50" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            Your schedule is empty
                        </h3>
                        <p className="text-text-secondary mt-2 max-w-sm">
                            Browse events and click the star icon on any talk to
                            save it directly to your personalized schedule.
                        </p>
                    </div>
                    <a
                        href="/events"
                        className="mt-4 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors shadow-lg shadow-primary-500/20"
                    >
                        Explore Events
                    </a>
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    {Object.keys(groupedTalks).map((date) => (
                        <div key={date} className="flex flex-col gap-4">
                            <h3 className="text-lg font-bold text-primary-400 border-b border-border/50 pb-2">
                                {new Date(date).toLocaleDateString(undefined, {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </h3>
                            <div className="flex flex-col gap-4">
                                {groupedTalks[date].map((item) => (
                                    <div
                                        key={item.wishlist_id}
                                        className="p-5 rounded-2xl glass border border-border/50 flex flex-col md:flex-row gap-6 relative group transition-colors hover:border-primary-500/30"
                                    >
                                        <div className="md:w-48 shrink-0 flex flex-col gap-2">
                                            <span className="text-primary-300 font-mono font-bold text-lg">
                                                {item.slot.time}
                                            </span>
                                            {item.slot.type && (
                                                <span className="inline-block px-2.5 py-1 rounded-md bg-surface border border-border/50 text-text-secondary text-xs uppercase tracking-wider w-max">
                                                    {item.slot.type}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <a
                                                href={`/events/${item.slot.agenda_day.event.id}`}
                                                className="text-xs font-semibold text-primary-500 hover:text-primary-400 uppercase tracking-wider mb-2 inline-block"
                                            >
                                                {
                                                    item.slot.agenda_day.event
                                                        .title
                                                }
                                            </a>
                                            <h4 className="text-xl font-bold text-white mb-2">
                                                {item.slot.title}
                                            </h4>

                                            {item.slot.speaker && (
                                                <div className="flex items-center gap-2 text-sm text-text-secondary mb-3">
                                                    <Mic className="w-4 h-4" />{" "}
                                                    {item.slot.speaker}
                                                </div>
                                            )}

                                            <p className="text-text-secondary leading-relaxed">
                                                {item.slot.description}
                                            </p>
                                        </div>

                                        <div className="flex sm:flex-col gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    const ics =
                                                        generateICSProperty(
                                                            {
                                                                id: item.slot
                                                                    .agenda_day
                                                                    .event.id,
                                                                title: item.slot
                                                                    .agenda_day
                                                                    .event
                                                                    .title,
                                                                date,
                                                                location:
                                                                    item.slot
                                                                        .agenda_day
                                                                        .event
                                                                        .location,
                                                                type: "event",
                                                                description: "",
                                                                time: item.slot
                                                                    .time,
                                                                image: "",
                                                            },
                                                            {
                                                                id: item.slot
                                                                    .id,
                                                                time: item.slot
                                                                    .time,
                                                                title: item.slot
                                                                    .title,
                                                                description:
                                                                    item.slot
                                                                        .description,
                                                                speaker:
                                                                    item.slot
                                                                        .speaker,
                                                                type: item.slot
                                                                    .type,
                                                            },
                                                        );
                                                    downloadICS(
                                                        ics,
                                                        `talk-${item.slot.id}`,
                                                    );
                                                }}
                                                className="p-2.5 rounded-xl bg-surface border border-border text-text-secondary hover:text-white hover:border-primary-500/30 transition-colors"
                                                title="Add to Calendar"
                                            >
                                                <CalendarPlus className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleRemove(
                                                        item.wishlist_id,
                                                    )
                                                }
                                                className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-colors"
                                                title="Remove from Schedule"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
