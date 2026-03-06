import React from "react";
import type { EventData } from "../data/mockEvents";
import { QrCode, Ticket } from "lucide-react";
import { cn } from "../lib/utils";

export function TicketWidget({
    ticket,
    eventTitle,
    className,
}: {
    ticket: NonNullable<EventData["ticket"]>;
    eventTitle: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "relative rounded-2xl glass border border-primary-500/30 overflow-hidden flex flex-col",
                className,
            )}
        >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600" />

            <div className="p-5 flex items-start justify-between border-b border-border/50 border-dashed">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-primary-400 font-medium text-sm">
                        <Ticket className="w-4 h-4" />
                        {ticket.type}
                    </div>
                    <h4 className="text-lg font-bold text-text-primary leading-tight mt-1">
                        {eventTitle}
                    </h4>
                </div>
            </div>

            <div className="p-5 bg-surface-hover/30 flex justify-between items-center">
                <div className="flex flex-col gap-4">
                    <div>
                        <span className="text-xs text-text-secondary block mb-0.5">
                            Price
                        </span>
                        <span className="text-sm font-semibold">
                            {ticket.price}
                        </span>
                    </div>
                    {ticket.seat && (
                        <div>
                            <span className="text-xs text-text-secondary block mb-0.5">
                                Seat
                            </span>
                            <span className="text-sm font-semibold text-primary-300">
                                {ticket.seat}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl">
                    <QrCode className="w-16 h-16 text-black" />
                    <span className="mt-2 text-[10px] text-black/60 font-mono font-bold tracking-widest">
                        {ticket.qrCodeMock}
                    </span>
                </div>
            </div>

            <div className="absolute -left-3 top-[50%] w-6 h-6 rounded-full bg-background border border-border" />
            <div className="absolute -right-3 top-[50%] w-6 h-6 rounded-full bg-background border border-border" />
        </div>
    );
}
