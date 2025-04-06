import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from '@astrojs/react';
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

export default defineConfig({
  output: "server",
  server: {
    port: 3000,
    host: true, // Allow external access
    https: {
      cert: fs.readFileSync(path.resolve('.cert/cert.pem')),
      key: fs.readFileSync(path.resolve('.cert/key.pem'))
    }
  },
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
  vite: {
    server: {
      https: {
        cert: fs.readFileSync(path.resolve('.cert/cert.pem')),
        key: fs.readFileSync(path.resolve('.cert/key.pem'))
      }
    }
  }
});