import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { fetchEventById } from "../lib/api";
import {
    Loader2,
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Calendar,
    Plane,
    LayoutList,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { cn } from "../lib/utils";
import { AgendaEditor } from "./AgendaEditor";

export function EventEditForm({ id }: { id: string }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"basic" | "agenda" | "travel">(
        "basic",
    );
    const [isAdmin, setIsAdmin] = useState(false);

    const [formBasic, setFormBasic] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        image: "",
        type: "conference",
        is_global: false,
    });

    const [formTravel, setFormTravel] = useState({
        id: "",
        flight: "",
        departureTime: "",
        hotel: "",
        hotelCheckIn: "",
    });

    // Instead of full complex nested state for agenda items initially, we'll implement simple additions later in this component
    // or as separate modules. For now, let's keep it simple mapping.

    useEffect(() => {
        async function load() {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                window.location.href = "/login";
                return;
            }
            setUser(session.user);

            try {
                // Check Admin
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", session.user.id)
                    .single();
                if (profile?.is_admin) setIsAdmin(true);

                const eventData = await fetchEventById(id);
                if (!eventData) throw new Error("Event not found");

                // Pre-fill basic details
                setFormBasic({
                    title: eventData.title,
                    description: eventData.description,
                    date: eventData.date,
                    time: eventData.time,
                    location: eventData.location,
                    image: eventData.image,
                    type: eventData.type,
                    is_global: (eventData as any).is_global || false,
                });

                // Pre-fill travel plan if it exists
                if (eventData.travel) {
                    setFormTravel({
                        id: (eventData.travel as any).id || "",
                        flight: eventData.travel.flight || "",
                        departureTime: eventData.travel.departureTime || "",
                        hotel: eventData.travel.hotel || "",
                        hotelCheckIn: eventData.travel.hotelCheckIn || "",
                    });
                }
            } catch (err) {
                console.error("Failed to load event for editing", err);
                alert(
                    "Could not load event data. You may not have permission to edit it.",
                );
                window.location.href = "/events";
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [id]);

    const handleSaveBasic = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("events")
                .update({
                    title: formBasic.title,
                    description: formBasic.description,
                    date: formBasic.date,
                    time: formBasic.time,
                    location: formBasic.location,
                    image: formBasic.image,
                    type: formBasic.type,
                    is_global: formBasic.is_global,
                })
                .eq("id", id);

            if (error) throw error;
            alert("Basic details saved!");
        } catch (err) {
            console.error(err);
            alert("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveTravel = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (formTravel.id) {
                // Update
                const { error } = await supabase
                    .from("travel_plans")
                    .update({
                        flight: formTravel.flight,
                        departure_time: formTravel.departureTime,
                        hotel: formTravel.hotel,
                        hotel_checkin: formTravel.hotelCheckIn,
                    })
                    .eq("id", formTravel.id);
                if (error) throw error;
            } else {
                // Insert
                const { data, error } = await supabase
                    .from("travel_plans")
                    .insert({
                        event_id: id,
                        flight: formTravel.flight,
                        departure_time: formTravel.departureTime,
                        hotel: formTravel.hotel,
                        hotel_checkin: formTravel.hotelCheckIn,
                    })
                    .select()
                    .single();
                if (error) throw error;
                if (data) setFormTravel({ ...formTravel, id: data.id });
            }
            alert("Travel details saved!");
        } catch (err) {
            console.error(err);
            alert("Failed to save travel plans.");
        } finally {
            setIsSaving(false);
        }
    };

    // Note: Agenda items require managing days and slots. For a premium prototype,
    // a simple message directing the user or a simplified flat list is best unless specifically breaking it down.
    // Given the constraints, we will leave the Agenda form for a dedicated UI update next.

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <a
                    href={`/events/${id}`}
                    className="p-2 border border-border rounded-xl glass hover:bg-surface-hover text-text-secondary hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </a>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Edit Event
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Manage details, travel, and agenda for this event.
                    </p>
                </div>
            </div>

            <div className="flex bg-surface-hover/50 p-1 rounded-xl border border-border mt-4 w-max glass">
                <button
                    onClick={() => setActiveTab("basic")}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                        activeTab === "basic"
                            ? "bg-primary-600 text-white shadow-lg"
                            : "text-text-secondary hover:text-white",
                    )}
                >
                    <Calendar className="w-4 h-4" /> Basic Info
                </button>
                <button
                    onClick={() => setActiveTab("travel")}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                        activeTab === "travel"
                            ? "bg-primary-600 text-white shadow-lg"
                            : "text-text-secondary hover:text-white",
                    )}
                >
                    <Plane className="w-4 h-4" /> Travel Plan
                </button>
                <button
                    onClick={() => setActiveTab("agenda")}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
                        activeTab === "agenda"
                            ? "bg-primary-600 text-white shadow-lg"
                            : "text-text-secondary hover:text-white",
                    )}
                >
                    <LayoutList className="w-4 h-4" /> Agenda Details
                </button>
            </div>

            {activeTab === "basic" && (
                <form
                    onSubmit={handleSaveBasic}
                    className="p-6 md:p-8 rounded-3xl border border-border glass flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-primary pl-1">
                            Event Title
                        </label>
                        <input
                            required
                            type="text"
                            value={formBasic.title}
                            onChange={(e) =>
                                setFormBasic({
                                    ...formBasic,
                                    title: e.target.value,
                                })
                            }
                            className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:border-primary-500/50"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary pl-1">
                                Date
                            </label>
                            <input
                                required
                                type="date"
                                value={formBasic.date}
                                onChange={(e) =>
                                    setFormBasic({
                                        ...formBasic,
                                        date: e.target.value,
                                    })
                                }
                                className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:border-primary-500/50"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary pl-1">
                                Time
                            </label>
                            <input
                                required
                                type="text"
                                value={formBasic.time}
                                onChange={(e) =>
                                    setFormBasic({
                                        ...formBasic,
                                        time: e.target.value,
                                    })
                                }
                                className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:border-primary-500/50"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary pl-1">
                                Location
                            </label>
                            <input
                                required
                                type="text"
                                value={formBasic.location}
                                onChange={(e) =>
                                    setFormBasic({
                                        ...formBasic,
                                        location: e.target.value,
                                    })
                                }
                                className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:border-primary-500/50"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary pl-1">
                                Event Type
                            </label>
                            <select
                                value={formBasic.type}
                                onChange={(e) =>
                                    setFormBasic({
                                        ...formBasic,
                                        type: e.target.value,
                                    })
                                }
                                className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white focus:border-primary-500/50"
                            >
                                <option value="conference">Conference</option>
                                <option value="meetup">Meetup</option>
                                <option value="workshop">Workshop</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-primary pl-1">
                            Image URL
                        </label>
                        <input
                            required
                            type="text"
                            value={formBasic.image}
                            onChange={(e) =>
                                setFormBasic({
                                    ...formBasic,
                                    image: e.target.value,
                                })
                            }
                            className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:border-primary-500/50"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-primary pl-1">
                            Description
                        </label>
                        <textarea
                            rows={4}
                            value={formBasic.description}
                            onChange={(e) =>
                                setFormBasic({
                                    ...formBasic,
                                    description: e.target.value,
                                })
                            }
                            className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:border-primary-500/50 resize-none"
                        />
                    </div>
                    {isAdmin && (
                        <div className="flex gap-4 items-center">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formBasic.is_global}
                                    onChange={(e) =>
                                        setFormBasic({
                                            ...formBasic,
                                            is_global: e.target.checked,
                                        })
                                    }
                                    className="w-5 h-5 rounded border-border text-primary-500 bg-surface"
                                />
                                <span className="text-sm font-medium text-text-primary">
                                    Global Event
                                </span>
                            </label>
                        </div>
                    )}
                    <div className="flex justify-end pt-4">
                        <button
                            disabled={isSaving}
                            type="submit"
                            className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium flex items-center gap-2"
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}{" "}
                            Save Basic Info
                        </button>
                    </div>
                </form>
            )}

            {activeTab === "travel" && (
                <form
                    onSubmit={handleSaveTravel}
                    className="p-6 md:p-8 rounded-3xl border border-border glass flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary pl-1">
                                Flight Details
                            </label>
                            <input
                                type="text"
                                value={formTravel.flight}
                                onChange={(e) =>
                                    setFormTravel({
                                        ...formTravel,
                                        flight: e.target.value,
                                    })
                                }
                                placeholder="e.g. DL 1234 (JFK -> SFO)"
                                className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary pl-1">
                                Departure Time
                            </label>
                            <input
                                type="text"
                                value={formTravel.departureTime}
                                onChange={(e) =>
                                    setFormTravel({
                                        ...formTravel,
                                        departureTime: e.target.value,
                                    })
                                }
                                placeholder="e.g. 10:30 AM EST"
                                className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary pl-1">
                                Hotel Name
                            </label>
                            <input
                                type="text"
                                value={formTravel.hotel}
                                onChange={(e) =>
                                    setFormTravel({
                                        ...formTravel,
                                        hotel: e.target.value,
                                    })
                                }
                                placeholder="e.g. The Grand View"
                                className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-primary pl-1">
                                Hotel Check-in Details
                            </label>
                            <input
                                type="text"
                                value={formTravel.hotelCheckIn}
                                onChange={(e) =>
                                    setFormTravel({
                                        ...formTravel,
                                        hotelCheckIn: e.target.value,
                                    })
                                }
                                placeholder="e.g. Oct 24, 3:00 PM"
                                className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            disabled={isSaving}
                            type="submit"
                            className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium flex items-center gap-2"
                        >
                            {isSaving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}{" "}
                            Save Travel Plans
                        </button>
                    </div>
                </form>
            )}

            {activeTab === "agenda" && (
                <div className="pt-4">
                    <AgendaEditor eventId={id} />
                </div>
            )}
        </div>
    );
}
