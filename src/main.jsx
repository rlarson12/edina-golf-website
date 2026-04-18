import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './index.css'
// PWA/service worker removed — was causing stale cache on mobile (required full app restart to see updates)
// Self-unregister: silently remove any old service worker still cached in users' browsers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister())
  })
  // Also clear all caches left behind by the old SW
  if ('caches' in window) {
    caches.keys().then(keys => keys.forEach(key => caches.delete(key)))
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
