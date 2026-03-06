import React from "react";
import type { EventData } from "../data/mockEvents";
import { Calendar, MapPin, Clock } from "lucide-react";
import { cn } from "../lib/utils";
// Note: We use an <img> tag purely for React component portability in this specific file,
// but in Astro components (.astro files), we can use Astro's <Image />.
// For pure React, using standard HTML img with a container is robust here.

export function EventCard({
    event,
    className,
}: {
    event: EventData;
    className?: string;
}) {
    return (
        <a
            href={`/events/${event.id}`}
            className={cn(
                "group block rounded-2xl border border-border glass overflow-hidden hover-scale transition-all duration-300",
                className,
            )}
        >
            <div className="relative h-48 w-full overflow-hidden">
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white capitalize border border-white/10">
                        {event.type}
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col gap-3">
                <h3 className="text-xl font-semibold text-text-primary group-hover:text-primary-400 transition-colors line-clamp-1">
                    {event.title}
                </h3>

                <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Calendar className="w-4 h-4 text-primary-400" />
                        <span>
                            {new Date(event.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Clock className="w-4 h-4 text-primary-400" />
                        <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                        <MapPin className="w-4 h-4 text-primary-400 shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                    </div>
                </div>
            </div>
        </a>
    );
}
