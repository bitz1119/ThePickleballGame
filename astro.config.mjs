import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import react from '@astrojs/react';
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig({
  site: "https://the-pickleball-game.vercel.app/",
  output: "server",
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
    react(),
    icon({
      include: {
        lucide: ["*"]
      }
    })
  ],
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
    environmentVariables: {
      MONGODB_URI: process.env.MONGODB_URI,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      TAVILY_API_KEY: process.env.TAVILY_API_KEY
    }
  })
});
