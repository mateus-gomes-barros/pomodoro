import { registerPlugin, Capacitor } from '@capacitor/core'

interface PomodoroServicePlugin {
  startService(options: {
    title: string
    body: string
    endTime: number
    badgeIcon?: string
  }): Promise<void>

  stopService(): Promise<void>

  addListener(
    eventName: 'onNotificationAction',
    listenerFunc: (data: { action: string }) => void,
  ): Promise<import('@capacitor/core').PluginListenerHandle>
}

const PomodoroService =
  registerPlugin<PomodoroServicePlugin>('PomodoroService')

export function addNotificationActionListener(
  callback: (action: string) => void,
) {
  if (!Capacitor.isNativePlatform()) {
    return { remove: () => {} }
  }

  return PomodoroService.addListener(
    'onNotificationAction',
    (data) => {
      callback(data.action)
    },
  )
}

export async function showTimerNotification(
  title: string,
  body: string,
  endTime: number,
  badgeIcon?: string,
) {
  if (!Capacitor.isNativePlatform()) return

  try {
    await PomodoroService.startService({
      title,
      body,
      endTime,
      badgeIcon,
    })
  } catch (error) {
    console.error(
      '🔥 [PomodoroService] ERRO ao iniciar serviço:',
      error,
    )
  }
}

export async function clearTimerNotification() {
  if (!Capacitor.isNativePlatform()) return

  try {
    await PomodoroService.stopService()
  } catch (error) {
    console.error(
      '🔥 [PomodoroService] ERRO ao parar serviço:',
      error,
    )
  }
}
