export interface DesktopNotification {
  title: string
  body: string
}

export function isTauriDesktop() {
  return (
    typeof window !== 'undefined' &&
    '__TAURI_INTERNALS__' in window
  )
}

export function desktopNotificationsEnabled() {
  return (
    isTauriDesktop() &&
    globalThis.localStorage?.getItem(
      'focus-horizon-notifications-enabled',
    ) !== 'false'
  )
}

export async function sendDesktopNotification({
  title,
  body,
}: DesktopNotification) {
  if (!desktopNotificationsEnabled()) {
    return false
  }

  const {
    isPermissionGranted,
    requestPermission,
    sendNotification,
  } = await import(
    '@tauri-apps/plugin-notification'
  )

  let granted =
    await isPermissionGranted()

  if (!granted) {
    granted =
      (await requestPermission()) ===
      'granted'
  }

  if (!granted) {
    return false
  }

  sendNotification({
    title,
    body,
  })

  return true
}
