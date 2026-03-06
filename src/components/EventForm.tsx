import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../hooks/useAuth";

export function EventForm() {
    const { user, isAdmin, isLoading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        image: "",
        type: "conference",
        is_global: false,
    });

    useEffect(() => {
        if (!authLoading && !user) {
            window.location.href = "/login";
        }
    }, [authLoading, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsLoading(true);

        try {
            const { error } = await supabase.from("events").insert({
                title: formData.title,
                description: formData.description,
                date: formData.date,
                time: formData.time,
                location: formData.location,
                image: formData.image,
                type: formData.type,
                is_global: formData.is_global,
                user_id: user.id,
            });

            if (error) throw error;
            window.location.href = "/events";
        } catch (err) {
            console.error("Failed to create event", err);
            alert("Failed to create event. See console for details.");
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl mx-auto flex flex-col gap-8"
        >
            <div className="flex items-center gap-4">
                <a
                    href="/events"
                    className="p-2 border border-border rounded-xl glass hover:bg-surface-hover text-text-secondary hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </a>
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Create New Event
                    </h1>
                    <p className="text-text-secondary mt-1">
                        Add a new event to your schedule or publish globally.
                    </p>
                </div>
            </div>

            <div className="p-6 md:p-8 rounded-3xl border border-border glass flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-primary pl-1">
                        Event Title
                    </label>
                    <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g. Future Tech Summit 2026"
                        className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary-500/50 transition-colors"
                    />
                </div>

                {isAdmin && (
                    <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_global}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        is_global: e.target.checked,
                                    })
                                }
                                className="w-5 h-5 rounded border-border text-primary-500 focus:ring-primary-500/50 bg-surface"
                            />
                            <span className="text-sm font-medium text-text-primary">
                                Make this a Global Event
                            </span>
                        </label>
                        <span className="text-xs text-text-secondary">
                            (Visible to everyone, otherwise only visible to you)
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-primary pl-1">
                            Date
                        </label>
                        <input
                            required
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    date: e.target.value,
                                })
                            }
                            className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary-500/50 transition-colors"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-primary pl-1">
                            Time
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.time}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    time: e.target.value,
                                })
                            }
                            placeholder="e.g. 09:00 AM - 05:00 PM"
                            className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary-500/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-primary pl-1">
                        Location
                    </label>
                    <input
                        required
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                location: e.target.value,
                            })
                        }
                        placeholder="e.g. Moscone Center, San Francisco or Virtual"
                        className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary-500/50 transition-colors"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-primary pl-1">
                            Event Type
                        </label>
                        <select
                            required
                            value={formData.type}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    type: e.target.value,
                                })
                            }
                            className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500/50 transition-colors appearance-none"
                        >
                            <option value="conference">Conference</option>
                            <option value="meetup">Meetup</option>
                            <option value="workshop">Workshop</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-primary pl-1">
                            Cover Image URL
                        </label>
                        <input
                            type="url"
                            value={formData.image}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    image: e.target.value,
                                })
                            }
                            placeholder="https://images.unsplash.com/..."
                            className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary-500/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-primary pl-1">
                        Description
                    </label>
                    <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            })
                        }
                        placeholder="Provide details about the event..."
                        className="bg-surface/50 border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:border-primary-500/50 transition-colors resize-none"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    disabled={isLoading}
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-70 flex items-center gap-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Plus className="w-5 h-5" />
                    )}
                    {isLoading ? "Creating..." : "Create Event"}
                </button>
            </div>
        </form>
    );
}
