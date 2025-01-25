import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()],
  experimental: {
    env: {
      schema: {
        OPEN_AI_API_KEY: envField.string({ 
          required: true,
          context: 'client',
          access: 'public',
        }),
      }
    }
  }
});