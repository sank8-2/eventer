import type { EventData, AgendaSlotData } from "../data/mockEvents";

function formatDateForICS(dateString: string, timeString?: string): string {
    try {
        // Very basic parsing for demo. In a real app, use date-fns or dayjs.
        // Assuming dateString is YYYY-MM-DD
        const date = new Date(dateString);

        let hours = 9;
        let mins = 0;

        if (timeString) {
            // Rough parse of "09:00 AM" or "09:00 AM - 10:00 AM"
            const match = timeString.match(/(\d+):(\d+)\s*(AM|PM|am|pm)/);
            if (match) {
                hours = parseInt(match[1]);
                mins = parseInt(match[2]);
                if (match[3].toLowerCase() === "pm" && hours < 12) hours += 12;
                if (match[3].toLowerCase() === "am" && hours === 12) hours = 0;
            }
        }

        date.setHours(hours, mins, 0);

        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    } catch (e) {
        // Fallback
        return (
            new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
        );
    }
}

export function generateICSProperty(
    event: EventData,
    slot?: AgendaSlotData,
): string {
    const title = slot ? `${slot.title} - ${event.title}` : event.title;
    const description = slot
        ? `${slot.description || ""}\n\nSpeaker: ${slot.speaker || "TBD"}`
        : event.description;

    // For slots we use the event date but track time based on slot.time
    // (Assuming slots are on event.date for simplicity, or we should pass the agenda_day_id date)
    // For this prototype, we'll just use the event.date as a base.
    const startTimeStr = slot
        ? formatDateForICS(event.date, slot.time)
        : formatDateForICS(event.date, event.time);

    // Add 1 hour for end time roughly
    const endDate = new Date(
        new Date(
            startTimeStr.replace(
                /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/,
                "$1-$2-$3T$4:$5:$6Z",
            ),
        ).getTime() +
            60 * 60 * 1000,
    );
    const endTimeStr =
        endDate.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Eventer App//EN",
        "BEGIN:VEVENT",
        `UID:${event.id}-${slot ? slot.id : "main"}-${Date.now()}@eventer.app`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"}`,
        `DTSTART:${startTimeStr}`,
        `DTEND:${endTimeStr}`,
        `SUMMARY:${title}`,
        `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
        `LOCATION:${event.location}`,
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n");

    return icsContent;
}

export function downloadICS(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
