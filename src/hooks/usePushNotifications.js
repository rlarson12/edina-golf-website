import { useEffect, useState } from 'react'
import OneSignal from 'react-onesignal'

const APP_ID = '8a79bbca-609d-47cd-a3d5-c7a7127889bf'

let initialized = false

export function usePushNotifications() {
  const [permission, setPermission] = useState('default') // 'default' | 'granted' | 'denied'
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function init() {
      if (initialized) return
      initialized = true

      try {
        await OneSignal.init({
          appId: APP_ID,
          allowLocalhostAsSecureOrigin: false,
          notifyButton: { enable: false }, // we use our own UI
          promptOptions: {
            slidedown: { prompts: [] } // no auto prompts
          }
        })
        setIsReady(true)

        const state = await OneSignal.Notifications.permission
        setPermission(state ? 'granted' : 'default')

        OneSignal.Notifications.addEventListener('permissionChange', (granted) => {
          setPermission(granted ? 'granted' : 'denied')
        })
      } catch (e) {
        console.warn('OneSignal init failed:', e)
      }
    }

    init()
  }, [])

  async function requestPermission() {
    if (!isReady) return
    await OneSignal.Notifications.requestPermission()
  }

  return { permission, isReady, requestPermission }
}
