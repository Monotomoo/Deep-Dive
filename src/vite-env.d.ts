/// <reference types="vite/client" />

/** Build timestamp, baked in by vite.config define — the app's build stamp. */
declare const __BUILD_TS__: string;

declare module '*.module.css';
declare module '*.svg' {
  const src: string;
  export default src;
}
