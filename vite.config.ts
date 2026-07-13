import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    /* Honor the preview harness's assigned port (PORT env); else 5173 + auto-fallback. */
    port: Number(process.env.PORT) || 5173,
    strictPort: false,
    open: false
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    /* Manual chunk splitting — separates third-party libs from app code so the
       browser caches them independently and the initial parse is smaller. */
    rollupOptions: {
      output: {
        manualChunks: {
          /* React + ReactDOM stay with the main bundle to avoid hydration races. */
          recharts: ['recharts'],
          'dnd-kit': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
          fuse: ['fuse.js'],
          suncalc: ['suncalc'],
        },
      },
    },
    /* Lift the warning threshold modestly — main bundle is now under 600KB
       after splitting, third-party chunks are cached separately. */
    chunkSizeWarningLimit: 700,
  },
});
