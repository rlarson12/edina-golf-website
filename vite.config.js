import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Edina Boys Golf',
        short_name: 'EdinaGolf',
        description: 'Official website of Edina High School Boys Golf',
        theme_color: '#00A651',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Force new service worker to take over immediately — no waiting
        skipWaiting: true,
        clientsClaim: true,
        // Only precache app shell (JS, CSS, HTML, small assets)
        globPatterns: ['**/*.{js,css,html,ico,svg}'],
        // Network-first for navigation (always get fresh HTML)
        navigateFallback: null,
        runtimeCaching: [
          {
            // Cache images at runtime with network-first strategy
            urlPattern: /\.(?:png|jpg|jpeg|webp|svg)$/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'edina-images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ],
})
