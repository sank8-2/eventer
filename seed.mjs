import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// We define mockEvents here manually instead of importing to avoid tsx/typescript module resolution issues
// with the existing Astro project setup during a simple node script execution.
const mockEvents = [
    {
        id: "ev-001",
        title: "Future Tech Summit 2026",
        date: "2026-04-12",
        time: "09:00 AM - 05:00 PM",
        location: "Moscone Center, San Francisco, CA",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80",
        type: "conference",
        description:
            "Join industry leaders for a deep dive into the next generation of web technologies, AI advancements, and spatial computing.",
        ticket: {
            type: "VIP Admission",
            price: "$450",
            seat: "A-12",
            qrCodeMock: "TN-940291",
        },
        agenda: [
            {
                day: "Day 1: April 12",
                slots: [
                    { time: "09:00 AM", title: "Registration & Breakfast" },
                    {
                        time: "10:00 AM",
                        title: "Keynote: The Edge of Tomorrow",
                        speaker: "Jane Doe, CEO TechForward",
                        description:
                            "Exploring the boundary between AI and human creativity.",
                    },
                    { time: "12:30 PM", title: "Networking Lunch" },
                    {
                        time: "02:00 PM",
                        title: "Workshop: Spatial Computing Apps",
                        speaker: "John Smith, Lead Dev",
                        description: "Hands-on with the latest VR/AR SDKs.",
                    },
                ],
            },
            {
                day: "Day 2: April 13",
                slots: [
                    {
                        time: "09:30 AM",
                        title: "Panel: Future of Developer Tools",
                    },
                    {
                        time: "11:00 AM",
                        title: "Deep Dive: Rust in the Browser",
                    },
                    { time: "04:00 PM", title: "Closing Ceremony & Awards" },
                ],
            },
        ],
        travel: {
            flight: "UA 1204 - SFO to JFK",
            departureTime: "2026-04-11 14:00",
            arrivalTime: "2026-04-11 22:30",
            hotel: "The Grand Hyatt SF",
            hotelCheckIn: "2026-04-11 23:00",
        },
    },
    {
        id: "ev-002",
        title: "React Global Remote Meetup",
        date: "2026-05-04",
        time: "11:00 AM - 02:00 PM",
        location: "Virtual Event",
        image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&q=80",
        type: "meetup",
        description:
            "A global gathering of React developers. Learn about React 19 features, Server Components, and optimized rendering strategies.",
        agenda: [
            {
                day: "May 4",
                slots: [
                    {
                        time: "11:00 AM",
                        title: "Welcome & Next.js vs Astro showdown",
                    },
                    {
                        time: "12:00 PM",
                        title: "Building truly accessible components",
                    },
                    { time: "01:00 PM", title: "Lightning Talks" },
                ],
            },
        ],
    },
    {
        id: "ev-003",
        title: "Design Systems Workshop",
        date: "2026-06-15",
        time: "10:00 AM - 04:00 PM",
        location: "Studio 42, New York, NY",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80",
        type: "workshop",
        description:
            "Learn how to build scalable and robust design systems using Tailwind CSS and modern web components.",
        ticket: {
            type: "General Admission",
            price: "$120",
            qrCodeMock: "DW-402931",
        },
        agenda: [
            {
                day: "June 15",
                slots: [
                    {
                        time: "10:00 AM",
                        title: "Introduction to Design Tokens",
                    },
                    { time: "11:30 AM", title: "Building Reusable Primitives" },
                    { time: "01:00 PM", title: "Lunch Break" },
                    {
                        time: "02:00 PM",
                        title: "Designing for the Dark Mode Era",
                    },
                ],
            },
        ],
        travel: {
            flight: "DL 904 - LAX to JFK",
            departureTime: "2026-06-14 09:00",
            arrivalTime: "2026-06-14 17:30",
            hotel: "The Standard High Line",
            hotelCheckIn: "2026-06-14 18:30",
        },
    },
];

async function seed() {
    console.log("Seeding Database...");
    for (const event of mockEvents) {
        // 1. Insert Event
        const { data: eventData, error: eventErr } = await supabase
            .from("events")
            .insert({
                title: event.title,
                date: event.date,
                time: event.time,
                location: event.location,
                image: event.image,
                type: event.type,
                description: event.description,
            })
            .select("id")
            .single();

        if (eventErr || !eventData) {
            console.error(`Error inserting event ${event.title}:`, eventErr);
            continue;
        }
        const eventId = eventData.id;
        console.log(`Inserted Event: ${event.title}`);

        // 2. Insert Ticket
        if (event.ticket) {
            const { error: ticketErr } = await supabase.from("tickets").insert({
                event_id: eventId,
                type: event.ticket.type,
                price: event.ticket.price,
                seat: event.ticket.seat,
                qr_code_mock: event.ticket.qrCodeMock,
            });
            if (ticketErr) console.error("Ticket err:", ticketErr);
        }

        // 3. Insert Travel
        if (event.travel) {
            const { error: travelErr } = await supabase
                .from("travel_plans")
                .insert({
                    event_id: eventId,
                    flight: event.travel.flight,
                    departure_time: event.travel.departureTime,
                    arrival_time: event.travel.arrivalTime,
                    hotel: event.travel.hotel,
                    hotel_check_in: event.travel.hotelCheckIn,
                });
            if (travelErr) console.error("Travel err:", travelErr);
        }

        // 4. Insert Agenda
        if (event.agenda) {
            let daySort = 0;
            for (const day of event.agenda) {
                const { data: dayData, error: dayErr } = await supabase
                    .from("agenda_days")
                    .insert({
                        event_id: eventId,
                        day_label: day.day,
                        sort_order: daySort++,
                    })
                    .select("id")
                    .single();

                if (dayErr || !dayData) {
                    console.error("Day err:", dayErr);
                    continue;
                }

                let slotSort = 0;
                const mappedSlots = day.slots.map((s) => ({
                    agenda_day_id: dayData.id,
                    time: s.time,
                    title: s.title,
                    speaker: s.speaker,
                    description: s.description,
                    sort_order: slotSort++,
                }));

                if (mappedSlots.length > 0) {
                    const { error: slotErr } = await supabase
                        .from("agenda_slots")
                        .insert(mappedSlots);
                    if (slotErr) console.error("Slot err:", slotErr);
                }
            }
        }
    }
    console.log("Seeding complete!");
}

seed();
