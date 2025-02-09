import { defineConfig, envField } from "astro/config";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://the-pickleball-game.vercel.app/",
  output: "server",
  integrations: [ mdx(), tailwind(), sitemap()],
  env: {
    schema: {
      OPENAI_API_KEY: envField.string({
        type: "string",
        context: "server",
        required: true,
        access: "secret",
      }),
    },
  },
  adapter: vercel({
    webAnalytics: {
      enabled: true,
    },
  }),
});
