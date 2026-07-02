import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// InnSider — build config
// Chunk the heavy 3D / animation libraries so the initial paint stays light
// and the cinematic layers can stream in behind the loading sequence.
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
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          motion: ['framer-motion'],
          gsap: ['gsap'],
        },
      },
    },
  },
})
