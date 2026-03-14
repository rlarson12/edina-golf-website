import { useState, useEffect } from 'react'
import { usePushNotifications } from '../hooks/usePushNotifications'

const DISMISSED_KEY = 'push_prompt_dismissed'

export default function PushOptIn() {
  const { permission, isReady, requestPermission } = usePushNotifications()
  const [dismissed, setDismissed] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [showBell, setShowBell] = useState(false)

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISSED_KEY)
    if (wasDismissed) setDismissed(true)
  }, [])

  // Show bell icon if dismissed or denied but not yet granted
  useEffect(() => {
    if ((dismissed || permission === 'denied') && permission !== 'granted') {
      setShowBell(true)
    } else {
      setShowBell(false)
    }
  }, [dismissed, permission])

  function handleDismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  async function handleEnable() {
    setClicked(true)
    await requestPermission()
    setClicked(false)
  }

  function handleBellClick() {
    localStorage.removeItem(DISMISSED_KEY)
    setDismissed(false)
    setShowBell(false)
  }

  // Bell icon — persistent re-entry point after dismissal
  if (showBell && isReady && permission !== 'granted') {
    return (
      <button
        onClick={handleBellClick}
        title="Enable match notifications"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: '#00A651',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          zIndex: 1000,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
        }}
      >
        🔔
      </button>
    )
  }

  // Don't show banner if: already granted, dismissed, or not ready
  if (!isReady || permission === 'granted' || dismissed) {
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: 480,
      background: '#0F2230',
      border: '1px solid #1E4060',
      borderRadius: 14,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      zIndex: 1000,
      boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
    }}>
      <div style={{ fontSize: 22, flexShrink: 0 }}>🔔</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#F0E6D6', marginBottom: 2 }}>
          Get live match updates
        </div>
        <div style={{ fontSize: 12, color: '#7A9AA8', lineHeight: 1.4 }}>
          We'll notify you when scores are posted during matches.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#7A9AA8',
            fontSize: 13,
            cursor: 'pointer',
            padding: '6px 8px'
          }}
        >
          Not now
        </button>
        <button
          onClick={handleEnable}
          disabled={clicked}
          style={{
            background: '#00A651',
            border: 'none',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            padding: '7px 14px',
            borderRadius: 8
          }}
        >
          Enable
        </button>
      </div>
    </div>
  )
}
