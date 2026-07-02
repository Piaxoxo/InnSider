import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// InnSider — build config
// Chunk the heavy 3D / animation libraries so the initial paint stays light
// and the cinematic layers can stream in behind the loading sequence.
export default defineConfig({
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
