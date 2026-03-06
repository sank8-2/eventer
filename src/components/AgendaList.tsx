import React, { useState, useEffect } from "react";
import { Mic, Star, CalendarPlus } from "lucide-react";
import { cn } from "../lib/utils";
import { supabase } from "../lib/supabase";
import type { AgendaDayData } from "../data/mockEvents";
import type { User } from "@supabase/supabase-js";
import { generateICSProperty, downloadICS } from "../lib/calendar";

interface AgendaListProps {
    agenda: AgendaDayData[];
    eventDetails?: {
        title: string;
        location: string;
        date: string;
        description: string;
    };
}

export function AgendaList({ agenda, eventDetails }: AgendaListProps) {
    const [activeDay, setActiveDay] = useState(0);
    const [user, setUser] = useState<User | null>(null);
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());
    const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                loadWishlist(currentUser.id);
            }
        });
    }, [agenda]);

    const loadWishlist = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("agenda_wishlist")
                .select("agenda_slot_id")
                .eq("user_id", userId);

            if (error) throw error;
            const savedIds = new Set(data.map((item) => item.agenda_slot_id));
            setWishlist(savedIds);
        } catch (err) {
            console.error("Failed to load wishlist", err);
        }
    };

    const toggleWishlist = async (slotId?: string) => {
        if (!user || !slotId) {
            alert("Please log in to save talks to your schedule.");
            return;
        }

        setIsLoadingWishlist(true);
        const isCurrentlyWishlisted = wishlist.has(slotId);

        try {
            if (isCurrentlyWishlisted) {
                await supabase
                    .from("agenda_wishlist")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("agenda_slot_id", slotId);
                const next = new Set(wishlist);
                next.delete(slotId);
                setWishlist(next);
            } else {
                await supabase
                    .from("agenda_wishlist")
                    .insert({ user_id: user.id, agenda_slot_id: slotId });
                const next = new Set(wishlist);
                next.add(slotId);
                setWishlist(next);
            }
        } catch (err) {
            console.error("Failed to toggle wishlist", err);
        } finally {
            setIsLoadingWishlist(false);
        }
    };

    if (!agenda || agenda.length === 0) return null;

    return (
        <div className="flex flex-col gap-6 w-full">
            <div className="flex border-b border-border/50 overflow-x-auto no-scrollbar">
                {agenda.map((day, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveDay(idx)}
                        className={cn(
                            "px-6 py-4 font-semibold text-sm tracking-wide whitespace-nowrap transition-all border-b-2",
                            activeDay === idx
                                ? "border-primary-500 text-primary-400 bg-primary-500/5 rounded-t-xl"
                                : "border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover/50 rounded-t-xl",
                        )}
                    >
                        {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                        })}
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-4 relative">
                <div className="absolute left-[45px] top-4 bottom-4 w-px bg-border/50 hidden sm:block" />

                {agenda[activeDay]?.slots.map((slot, idx) => {
                    const isWishlisted = slot.id
                        ? wishlist.has(slot.id)
                        : false;

                    return (
                        <div
                            key={idx}
                            className="flex flex-col sm:flex-row gap-4 sm:gap-8 group relative"
                        >
                            <div className="sm:w-32 shrink-0 pt-1 flex items-center gap-4 sm:block relative z-10">
                                <div className="sm:hidden w-3 h-3 rounded-full bg-primary-500 border-4 border-background ring-1 ring-border shadow-sm shadow-primary-500/50" />
                                <span className="text-primary-300 font-mono text-sm sm:font-semibold">
                                    {slot.time}
                                </span>
                            </div>

                            <div className="hidden sm:block absolute left-[45px] top-2.5 w-3 h-3 -translate-x-1.5 rounded-full bg-surface border-2 border-primary-500 ring-4 ring-background z-10 transition-transform group-hover:scale-125 duration-300" />

                            <div className="flex-1 p-5 rounded-2xl glass border border-border/50 group-hover:border-primary-500/30 transition-colors duration-300 shadow-sm shadow-black/5 relative">
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    <button
                                        onClick={() => toggleWishlist(slot.id)}
                                        disabled={isLoadingWishlist}
                                        className={cn(
                                            "p-2 rounded-xl transition-all",
                                            isWishlisted
                                                ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-md shadow-amber-500/10"
                                                : "bg-surface border border-border text-text-secondary hover:text-white hover:border-primary-500/30",
                                        )}
                                        title={
                                            isWishlisted
                                                ? "Remove from my schedule"
                                                : "Add to my schedule"
                                        }
                                    >
                                        <Star
                                            className="w-4 h-4"
                                            fill={
                                                isWishlisted
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                        />
                                    </button>
                                </div>

                                {slot.type && (
                                    <span className="inline-block px-2.5 py-1 mb-3 rounded-full bg-surface text-text-secondary text-xs uppercase tracking-wider font-semibold border border-border/50 shadow-sm">
                                        {slot.type}
                                    </span>
                                )}

                                <h4 className="text-xl font-bold text-white tracking-tight pr-12">
                                    {slot.title}
                                </h4>

                                {slot.description && (
                                    <p className="mt-3 text-text-secondary leading-relaxed">
                                        {slot.description}
                                    </p>
                                )}

                                {slot.speaker && (
                                    <div className="mt-6 p-4 rounded-xl bg-surface-hover border border-border/50 flex flex-col gap-2 transition-colors group-hover:bg-primary-500/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold tracking-widest border border-primary-500/30 shadow-inner">
                                                {slot.speaker
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-white">
                                                    {slot.speaker}
                                                </span>
                                                <span className="text-xs text-primary-400 font-medium tracking-wide items-center gap-1 flex">
                                                    <Mic className="w-3 h-3" />{" "}
                                                    Speaker
                                                </span>
                                            </div>
                                        </div>
                                        {slot.aboutSpeaker && (
                                            <p className="text-sm text-text-secondary ml-[52px]">
                                                {slot.aboutSpeaker}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
