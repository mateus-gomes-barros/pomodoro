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
    status: 'running' | 'paused'
    sessionType: 'focus' | 'short_break' | 'long_break'
    durationSeconds: number
    remainingSeconds: number
    taskId?: string
    taskName?: string
    projectId?: string
    projectName?: string
    focusHome?: string
    syncToWear: boolean
  }): Promise<void>

  stopService(): Promise<void>

  publishFocusPulseSnapshot(options: {
    snapshotJson: string
  }): Promise<void>

  getFocusPulseStatus(): Promise<FocusPulseStatus>
  retryFocusPulse(): Promise<{ retried: boolean }>

  consumeWearTimerState(): Promise<
    | ({ pending: false } & Partial<WearTimerState>)
    | ({ pending: true } & WearTimerState)
  >

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

  addListener(
    eventName: 'onWearAction',
    listenerFunc: (data: { actionJson: string }) => void,
  ): Promise<import('@capacitor/core').PluginListenerHandle>

  addListener(
    eventName: 'onWearTimerState',
    listenerFunc: (data: WearTimerState) => void,
  ): Promise<import('@capacitor/core').PluginListenerHandle>
}

export interface FocusPulseStatus {
  connected: boolean
  watchName?: string
  sentVersion: number
  acknowledgedVersion: number
  acknowledged: boolean
  acknowledgedStatus: string
}

export interface WearTimerState {
  status: 'idle' | 'running' | 'paused' | 'completed'
  sessionType: 'focus' | 'short_break' | 'long_break'
  remainingSeconds: number
  endsAt: number
  version: number
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

export function addWearActionListener(
  callback: (action: {
    id: string
    type:
      | 'create_task'
      | 'complete_task'
      | 'select_task'
      | 'select_project'
      | 'plan_task'
      | 'set_daily_priority'
    taskId?: string
    projectId?: string
    title?: string
    plannedForToday?: boolean
    priority?: 'low' | 'medium' | 'high'
    dailyPriority?: 1 | 2 | 3
    estimatedPomodoros?: number
  }) => void,
) {
  if (!isFocusPulseAvailable()) return { remove: () => {} }
  return PomodoroService.addListener('onWearAction', ({ actionJson }) => {
    try {
      callback(JSON.parse(actionJson))
    } catch (error) {
      console.error('Invalid Focus Pulse action:', error)
    }
  })
}

export function addWearTimerStateListener(
  callback: (state: WearTimerState) => void,
) {
  if (
    !Capacitor.isNativePlatform() ||
    Capacitor.getPlatform() !== 'android'
  ) {
    return { remove: () => {} }
  }

  return PomodoroService.addListener(
    'onWearTimerState',
    callback,
  )
}

export async function consumeWearTimerState() {
  if (
    !Capacitor.isNativePlatform() ||
    Capacitor.getPlatform() !== 'android'
  ) {
    return { pending: false } as const
  }

  return PomodoroService.consumeWearTimerState()
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

const FOCUS_PULSE_MODE_KEY = 'focus_pulse_timer_mode'

export function isFocusPulseAvailable() {
  return (
    Capacitor.isNativePlatform() &&
    Capacitor.getPlatform() === 'android'
  )
}

export function isFocusPulseModeEnabled() {
  return (
    isFocusPulseAvailable() &&
    globalThis.localStorage?.getItem(
      FOCUS_PULSE_MODE_KEY,
    ) === 'true'
  )
}

export function setFocusPulseModeEnabled(enabled: boolean) {
  if (!isFocusPulseAvailable()) return
  globalThis.localStorage?.setItem(
    FOCUS_PULSE_MODE_KEY,
    String(enabled),
  )
}

export async function getFocusPulseStatus():
  Promise<FocusPulseStatus> {
  if (!isFocusPulseAvailable()) {
    return {
      connected: false,
      sentVersion: 0,
      acknowledgedVersion: 0,
      acknowledged: false,
      acknowledgedStatus: '',
    }
  }

  return PomodoroService.getFocusPulseStatus()
}

export async function retryFocusPulse() {
  if (!isFocusPulseAvailable()) {
    return false
  }

  const result =
    await PomodoroService.retryFocusPulse()
  return result.retried
}

export async function showTimerNotification(
  title: string,
  body: string,
  endTime: number,
  badgeLevel: number | undefined,
  status: 'running' | 'paused',
  sessionType: 'focus' | 'short_break' | 'long_break',
  durationSeconds: number,
  remainingSeconds: number,
  taskId?: string,
  taskName?: string,
  projectId?: string,
  projectName?: string,
  focusHome?: string,
) {
  if (!Capacitor.isNativePlatform()) return

  try {
    await PomodoroService.startService({
      title,
      body,
      endTime,
      badgeLevel,
      status,
      sessionType,
      durationSeconds,
      remainingSeconds,
      taskId,
      taskName,
      projectId,
      projectName,
      focusHome,
      syncToWear: isFocusPulseModeEnabled(),
    })
  } catch (error) {
    console.error(
      '🔥 [PomodoroService] ERRO ao iniciar serviço:',
      error,
    )
  }
}

export async function publishFocusPulseSnapshot(
  snapshot: unknown,
) {
  if (!isFocusPulseAvailable()) return
  await PomodoroService.publishFocusPulseSnapshot({
    snapshotJson: JSON.stringify(snapshot),
  })
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
