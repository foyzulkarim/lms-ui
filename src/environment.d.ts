/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_BYPASS_AUTH?: string; // Add environment variable to bypass authentication
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
