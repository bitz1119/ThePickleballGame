import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: 'server',
  integrations: [tailwind()],
  experimental: {
    env: {
      schema : {
        OPENAI_API_KEY: envField.string({
          type: 'string',
          context: 'server',
          required: true,
          access: 'secret',
        }),
      }
    },
  },
  adapter: vercel({
    webAnalytics: {
      enabled: true
    }
  }),
});
