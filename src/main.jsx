import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Auto-update: when a new service worker activates (new deploy detected),
// reload the page so users always get fresh content — no manual refresh needed.
registerSW({
  immediate: true,
  onRegisteredSW(_swScriptUrl, registration) {
    // Check for updates every hour (catches users who leave tabs open a long time)
    if (registration) {
      setInterval(() => registration.update(), 60 * 60 * 1000)
    }
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
