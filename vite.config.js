import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Vercel serves at root
  build: {
    rollupOptions: {
      output: {
        // Bundle all app code into a single chunk to prevent
        // "Failed to fetch dynamically imported module" errors
        // when users have a cached version after redeployment
        manualChunks: undefined,
      },
    },
  },
})
