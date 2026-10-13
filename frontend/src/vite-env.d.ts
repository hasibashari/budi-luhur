/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_1_URL?: string;
  readonly VITE_APP_2_URL?: string;
  readonly VITE_APP_3_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
