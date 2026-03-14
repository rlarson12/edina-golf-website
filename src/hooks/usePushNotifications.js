import { useEffect, useState } from 'react'

const APP_ID = '8a79bbca-609d-47cd-a3d5-c7a7127889bf'

let initialized = false
let initPromise = null

function loadOneSignalSDK() {
  return new Promise((resolve, reject) => {
    if (document.getElementById('onesignal-sdk')) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.id = 'onesignal-sdk'
    script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
    script.defer = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function initOneSignal() {
  if (initPromise) return initPromise
  initPromise = new Promise((resolve, reject) => {
    window.OneSignalDeferred = window.OneSignalDeferred || []
    window.OneSignalDeferred.push(async (os) => {
      try {
        await os.init({
          appId: APP_ID,
          notifyButton: { enable: false },
          promptOptions: { slidedown: { prompts: [] } },
          serviceWorkerPath: '/OneSignalSDKWorker.js',
          allowLocalhostAsSecureOrigin: false,
        })
        resolve(os)
      } catch (e) {
        reject(e)
      }
    })
    // Load the SDK script which drains OneSignalDeferred
    loadOneSignalSDK().catch(reject)
  })
  return initPromise
}

export function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (initialized) return
    initialized = true

    initOneSignal()
      .then((os) => {
        setIsReady(true)
        const perm = Notification.permission
        setPermission(perm)
        os.Notifications.addEventListener('permissionChange', (granted) => {
          setPermission(granted ? 'granted' : 'denied')
        })
      })
      .catch((e) => {
        console.warn('OneSignal init failed:', e?.message || e)
        // SDK may still be usable despite throwing — check and enable banner anyway
        if (typeof window.OneSignal?.Notifications !== 'undefined') {
          setIsReady(true)
          setPermission(Notification.permission)
          window.OneSignal.Notifications.addEventListener('permissionChange', (granted) => {
            setPermission(granted ? 'granted' : 'denied')
          })
        }
      })
  }, [])

  async function requestPermission() {
    if (!isReady) return
    const os = await initOneSignal()
    await os.Notifications.requestPermission()
  }

  return { permission, isReady, requestPermission }
}
