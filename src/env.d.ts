/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Add to src/env.d.ts
interface ImportMetaEnv {
    readonly OPENAI_API_KEY: string;
    readonly TAVILY_API_KEY: string;
    readonly MONGODB_URI: string;
    readonly PUBLIC_SITE_URL: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }