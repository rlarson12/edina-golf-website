import { useEffect } from 'react'

const CHECK_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes

export function useVersionCheck() {
  useEffect(() => {
    // Capture the build time that was baked in at page load
    let currentBuildTime = null

    async function checkVersion() {
      try {
        // Cache-bust the fetch so we always get the real current version
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) return
        const { buildTime } = await res.json()

        if (currentBuildTime === null) {
          // First check — record the version we loaded with
          currentBuildTime = buildTime
        } else if (buildTime !== currentBuildTime) {
          // New deploy detected — hard reload to pick up the new bundle
          window.location.reload(true)
        }
      } catch {
        // Network error — silently ignore, try again next interval
      }
    }

    // Check immediately on mount, then every 5 minutes
    checkVersion()
    const interval = setInterval(checkVersion, CHECK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])
}
