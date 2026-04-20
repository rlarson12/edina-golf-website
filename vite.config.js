import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// VitePWA removed — service worker caused stale cache on mobile requiring full app restart.
// No offline benefit for a schedule/scores site. Standard browser caching handles performance.
// Version check: generate-version.js (prebuild) writes public/version.json with buildTime.
// App polls this via useVersionCheck hook (src/hooks/useVersionCheck.js) every 60s.

export default defineConfig({
  plugins: [
    react(),
  ],
})
