import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// InnSider — build config
//
// three.js and react-three-fiber are deliberately NOT listed as manual chunks.
// A manual chunk is treated as part of the entry's graph, so Vite writes a
// <link rel="modulepreload"> for it and the browser fetches it before the
// first paint — which defeats the lazy boundaries in AtmosphereGate and
// Gallery. Left alone, Rollup splits them off behind the dynamic imports and
// they are fetched only once the atmosphere is actually asked for.
//
// framer-motion and gsap stay chunked: they really are on the critical path
// (navigation, chapter reveals), so separate files just help caching.
export default defineConfig({
  // Served at root on Vercel/Netlify; under /innsider/ on GitHub project Pages.
  // The Pages workflow sets BASE_PATH=/innsider/.
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ['framer-motion'],
          gsap: ['gsap'],
        },
      },
    },
  },
})
