import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Auto-update: new service worker takes over immediately (skipWaiting + clientsClaim)
// and we reload the page so parents always see fresh content without manual refresh.
registerSW({
  immediate: true,
  onRegisteredSW(_swScriptUrl, registration) {
    // Poll for updates every 2 minutes
    if (registration) {
      setInterval(() => registration.update(), 2 * 60 * 1000)
    }
  },
  onNeedRefresh() {
    // New content available — reload automatically
    window.location.reload()
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
