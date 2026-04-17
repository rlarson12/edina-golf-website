import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// VitePWA removed — service worker caused stale cache on mobile requiring full app restart.
// No offline benefit for a schedule/scores site. Standard browser caching handles performance.

export default defineConfig({
  plugins: [
    react(),
  ],
})
