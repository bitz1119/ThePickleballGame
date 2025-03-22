/// <reference path="../.astro/types.d.ts" />

// Add to src/env.d.ts
interface ImportMetaEnv {
    readonly OPENAI_API_KEY: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }