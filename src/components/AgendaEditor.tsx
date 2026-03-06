import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Loader2, Plus, Trash2, Mic, Save } from "lucide-react";
import type { AgendaDayData, AgendaSlotData } from "../data/mockEvents";

export function AgendaEditor({ eventId }: { eventId: string }) {
    const [days, setDays] = useState<AgendaDayData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form stuff
    const [newDayDate, setNewDayDate] = useState("");
    const [activeDayId, setActiveDayId] = useState<string | null>(null);
    const [newSlot, setNewSlot] = useState({
        time: "",
        title: "",
        description: "",
        speaker: "",
        aboutSpeaker: "",
        type: "talk",
    });

    useEffect(() => {
        loadAgenda();
    }, [eventId]);

    const loadAgenda = async () => {
        setIsLoading(true);
        try {
            const { data: daysData, error: daysError } = await supabase
                .from("agenda_days")
                .select("id, date, title")
                .eq("event_id", eventId)
                .order("date");

            if (daysError) throw daysError;

            // Load slots for all days
            const daysWithSlots = await Promise.all(
                daysData.map(async (day) => {
                    const { data: slots, error: slotsError } = await supabase
                        .from("agenda_slots")
                        .select(
                            "id, time, title, description, speaker, about_speaker, type",
                        )
                        .eq("agenda_day_id", day.id)
                        .order("time"); // Simple string order for now
                    if (slotsError) throw slotsError;

                    return {
                        id: day.id,
                        date: day.date,
                        slots: slots.map((s) => ({
                            id: s.id,
                            time: s.time,
                            title: s.title,
                            description: s.description,
                            speaker: s.speaker,
                            aboutSpeaker: s.about_speaker,
                            type: s.type,
                        })),
                    };
                }),
            );

            setDays(daysWithSlots as any);
            if (daysWithSlots.length > 0 && !activeDayId) {
                setActiveDayId(daysWithSlots[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddDay = async () => {
        if (!newDayDate) return;
        try {
            const { error, data } = await supabase
                .from("agenda_days")
                .insert({
                    event_id: eventId,
                    date: newDayDate,
                    title: `Day ${days.length + 1}`,
                })
                .select()
                .single();
            if (error) throw error;

            setNewDayDate("");
            await loadAgenda(); // Reload list to get fresh slots array attached
            setActiveDayId(data.id);
        } catch (err) {
            alert("Failed to add day");
        }
    };

    const handleDeleteDay = async (dayId: string) => {
        if (!confirm("Are you sure? This deletes all talks on this day."))
            return;
        try {
            await supabase.from("agenda_days").delete().eq("id", dayId);
            await loadAgenda();
        } catch (err) {
            alert("Failed to delete day");
        }
    };

    const handleAddSlot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeDayId) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from("agenda_slots").insert({
                agenda_day_id: activeDayId,
                time: newSlot.time,
                title: newSlot.title,
                description: newSlot.description,
                speaker: newSlot.speaker,
                about_speaker: newSlot.aboutSpeaker,
                type: newSlot.type,
            });
            if (error) throw error;

            setNewSlot({
                time: "",
                title: "",
                description: "",
                speaker: "",
                aboutSpeaker: "",
                type: "talk",
            });
            await loadAgenda();
        } catch (err) {
            alert("Failed to add slot");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSlot = async (slotId: string) => {
        try {
            await supabase.from("agenda_slots").delete().eq("id", slotId);
            await loadAgenda();
        } catch (err) {
            alert("Failed to delete slot");
        }
    };

    if (isLoading)
        return (
            <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin text-primary-500" />
            </div>
        );

    const activeDay = days.find((d) => d.id === activeDayId);

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <div className="p-6 rounded-3xl border border-border glass flex flex-col gap-6">
                <h3 className="text-xl font-bold">Manage Agenda Days</h3>

                <div className="flex flex-wrap gap-3">
                    {days.map((day) => (
                        <div key={day.id} className="flex relative group">
                            <button
                                onClick={() => setActiveDayId(day.id)}
                                className={`px-4 py-2 rounded-xl border transition-colors ${activeDayId === day.id ? "bg-primary-600 border-primary-500 text-white" : "border-border glass hover:bg-surface-hover hover:border-primary-500/30 text-text-secondary"}`}
                            >
                                {new Date(day.date).toLocaleDateString(
                                    undefined,
                                    { month: "short", day: "numeric" },
                                )}
                            </button>
                            <button
                                onClick={() => handleDeleteDay(day.id)}
                                className="absolute -top-2 -right-2 bg-red-500/20 text-red-500 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    <div className="flex items-center gap-2 ml-auto">
                        <input
                            type="date"
                            value={newDayDate}
                            onChange={(e) => setNewDayDate(e.target.value)}
                            className="bg-surface/50 border border-border rounded-xl px-3 py-2 text-sm text-white"
                        />
                        <button
                            onClick={handleAddDay}
                            className="px-3 py-2 bg-surface border border-border rounded-xl hover:bg-primary-500 hover:border-primary-500 text-white transition-colors text-sm font-medium flex items-center gap-1"
                        >
                            <Plus className="w-4 h-4" /> Add Day
                        </button>
                    </div>
                </div>
            </div>

            {activeDay && (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Add Slot Form */}
                    <div className="flex-1 lg:max-w-md p-6 rounded-3xl border border-border glass flex flex-col gap-6 h-max sticky top-8">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                            <Plus className="w-5 h-5 text-primary-400" /> Add
                            Talk to{" "}
                            {new Date(activeDay.date).toLocaleDateString(
                                undefined,
                                { month: "short", day: "numeric" },
                            )}
                        </h4>
                        <form
                            onSubmit={handleAddSlot}
                            className="flex flex-col gap-4"
                        >
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-text-secondary pl-1 uppercase tracking-wider">
                                    Time
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={newSlot.time}
                                    onChange={(e) =>
                                        setNewSlot({
                                            ...newSlot,
                                            time: e.target.value,
                                        })
                                    }
                                    placeholder="09:00 AM - 10:00 AM"
                                    className="bg-surface/50 border border-border rounded-xl px-4 py-2 text-white focus:border-primary-500/50"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-text-secondary pl-1 uppercase tracking-wider">
                                    Title
                                </label>
                                <input
                                    required
                                    type="text"
                                    value={newSlot.title}
                                    onChange={(e) =>
                                        setNewSlot({
                                            ...newSlot,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="Keynote: The Future..."
                                    className="bg-surface/50 border border-border rounded-xl px-4 py-2 text-white focus:border-primary-500/50"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-text-secondary pl-1 uppercase tracking-wider">
                                    Talk Description
                                </label>
                                <textarea
                                    required
                                    rows={2}
                                    value={newSlot.description}
                                    onChange={(e) =>
                                        setNewSlot({
                                            ...newSlot,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="A deep dive into..."
                                    className="bg-surface/50 border border-border rounded-xl px-4 py-2 text-white focus:border-primary-500/50 resize-none"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-text-secondary pl-1 uppercase tracking-wider">
                                    Speaker Name
                                </label>
                                <div className="relative">
                                    <Mic className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                                    <input
                                        type="text"
                                        value={newSlot.speaker}
                                        onChange={(e) =>
                                            setNewSlot({
                                                ...newSlot,
                                                speaker: e.target.value,
                                            })
                                        }
                                        placeholder="John Doe"
                                        className="w-full pl-10 bg-surface/50 border border-border rounded-xl px-4 py-2 text-white focus:border-primary-500/50"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-text-secondary pl-1 uppercase tracking-wider">
                                    About Speaker
                                </label>
                                <textarea
                                    rows={2}
                                    value={newSlot.aboutSpeaker}
                                    onChange={(e) =>
                                        setNewSlot({
                                            ...newSlot,
                                            aboutSpeaker: e.target.value,
                                        })
                                    }
                                    placeholder="John is a principal engineer at..."
                                    className="bg-surface/50 border border-border rounded-xl px-4 py-2 text-white focus:border-primary-500/50 resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="mt-2 w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}{" "}
                                Save Slot
                            </button>
                        </form>
                    </div>

                    {/* Slot List */}
                    <div className="flex-2 flex flex-col gap-4 flex-1">
                        <h4 className="text-lg font-bold px-2">
                            Scheduled Talks
                        </h4>
                        {activeDay.slots?.length === 0 && (
                            <div className="p-8 text-center text-text-secondary border border-border/50 rounded-2xl border-dashed">
                                No talks scheduled for this day yet.
                            </div>
                        )}
                        {activeDay.slots?.map((slot: AgendaSlotData) => (
                            <div
                                key={slot.id}
                                className="p-5 rounded-2xl glass border border-border/50 flex flex-col gap-3 group relative hover:border-primary-500/30 transition-colors"
                            >
                                <button
                                    onClick={() => handleDeleteSlot(slot.id!)}
                                    className="absolute top-4 right-4 text-text-secondary hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-md bg-primary-500/10 text-primary-400 text-xs font-bold font-mono border border-primary-500/20">
                                        {slot.time}
                                    </span>
                                    {slot.type && (
                                        <span className="px-2.5 py-1 rounded-md bg-surface border border-border text-text-secondary text-xs uppercase tracking-wider">
                                            {slot.type}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h5 className="text-lg font-bold text-white">
                                        {slot.title}
                                    </h5>
                                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                                        {slot.description}
                                    </p>
                                </div>
                                {slot.speaker && (
                                    <div className="mt-2 p-3 rounded-xl bg-surface-hover/30 border border-border/50">
                                        <div className="flex items-center gap-2 font-medium text-primary-300">
                                            <Mic className="w-4 h-4" />{" "}
                                            {slot.speaker}
                                        </div>
                                        {slot.aboutSpeaker && (
                                            <p className="text-sm text-text-secondary mt-1">
                                                {slot.aboutSpeaker}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
