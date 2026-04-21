import { useEffect, useRef } from 'react'

const CHECK_INTERVAL_MS = 30 * 1000 // 30 seconds — catches score updates promptly

export function useVersionCheck() {
  const currentBuildTime = useRef(null)

  useEffect(() => {
    async function checkVersion() {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) return
        const { buildTime } = await res.json()

        if (currentBuildTime.current === null) {
          // First check — store the version we loaded with
          currentBuildTime.current = buildTime
        } else if (buildTime !== currentBuildTime.current) {
          // New deploy detected — reload to pick up fresh scores/content
          window.location.reload(true)
        }
      } catch {
        // Network error — silently ignore, try again next interval
      }
    }

    // Check immediately on mount
    checkVersion()

    // Poll every 60 seconds
    const interval = setInterval(checkVersion, CHECK_INTERVAL_MS)

    // Also recheck when tab/app comes back into focus (critical for iOS home screen)
    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        checkVersion()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])
}
