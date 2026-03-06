// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
    output: "server",
    adapter: netlify(),
    base: "/events", // Replace "/events" with your exact subpath on your domain
    integrations: [react()],

    vite: {
        plugins: [tailwindcss()],
    },
});
