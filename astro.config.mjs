// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: netlify(),
    // base: "/events", // WARNING: Only uncomment this if you are actually proxying a subpath like domain.com/events. If accessing directly, this breaks CSS.
    integrations: [react()],

    vite: {
        plugins: [tailwindcss()],
    },
});
