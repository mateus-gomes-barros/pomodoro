import {
  LocalNotifications,
} from '@capacitor/local-notifications'

import { registerPlugin, Capacitor } from '@capacitor/core'

interface PomodoroServicePlugin {
  startService(options: {
    title: string
    body: string
    endTime: number
    badgeLevel?: number
  }): Promise<void>

  stopService(): Promise<void>

  checkNotificationSetup(): Promise<{
    notificationsEnabled: boolean
    liveNotificationsSupported: boolean
    liveNotificationsEnabled: boolean
  }>

  openNotificationSettings():
    Promise<void>

  openLiveNotificationSettings():
    Promise<void>

  addListener(
    eventName: 'onNotificationAction',
    listenerFunc: (data: { action: string }) => void,
  ): Promise<import('@capacitor/core').PluginListenerHandle>
}

const PomodoroService =
  registerPlugin<PomodoroServicePlugin>('PomodoroService')

export interface TimerNotificationSetup {
  notificationsEnabled: boolean
  liveNotificationsSupported: boolean
  liveNotificationsEnabled: boolean
}

export async function getTimerNotificationSetup():
  Promise<TimerNotificationSetup> {
  if (
    !Capacitor.isNativePlatform() ||
    Capacitor.getPlatform() !== 'android'
  ) {
    return {
      notificationsEnabled: true,
      liveNotificationsSupported: false,
      liveNotificationsEnabled: false,
    }
  }

  return PomodoroService
    .checkNotificationSetup()
}

export async function openTimerNotificationSettings() {
  if (
    !Capacitor.isNativePlatform() ||
    Capacitor.getPlatform() !== 'android'
  ) {
    return
  }

  await PomodoroService
    .openNotificationSettings()
}

export async function openTimerLiveNotificationSettings() {
  if (
    !Capacitor.isNativePlatform() ||
    Capacitor.getPlatform() !== 'android'
  ) {
    return
  }

  await PomodoroService
    .openLiveNotificationSettings()
}

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

export async function requestTimerNotificationPermission():
  Promise<boolean> {
  if (
    !Capacitor.isNativePlatform() ||
    Capacitor.getPlatform() !== 'android'
  ) {
    return true
  }

  try {
    const permission =
      await LocalNotifications
        .checkPermissions()

    if (
      permission.display !==
      'granted'
    ) {
      const requested =
        await LocalNotifications
          .requestPermissions()

      return (
        requested.display ===
        'granted'
      )
    }

    return true
  } catch (error) {
    console.error(
      'Unable to request notification permission:',
      error,
    )

    return false
  }
}

export async function showTimerNotification(
  title: string,
  body: string,
  endTime: number,
  badgeLevel?: number,
) {
  if (!Capacitor.isNativePlatform()) return

  try {
    await PomodoroService.startService({
      title,
      body,
      endTime,
      badgeLevel,
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
