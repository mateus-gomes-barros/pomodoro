export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'
export type SessionType = 'work' | 'short_break' | 'long_break'

export type ExtensionTimerSettings = {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  soundEnabled: boolean
}

export type ExtensionTimerState = {
  status: TimerStatus
  sessionType: SessionType
  secondsLeft: number
  endsAt: number | null
  currentSessionCount: number
  activeTaskId: string | null
  activeProjectId: string | null
  settings: ExtensionTimerSettings
}

export const TIMER_STORAGE_KEY = 'focus-extension-timer'
export const TIMER_ALARM_NAME = 'focus-timer-complete'

export const DEFAULT_TIMER_SETTINGS: ExtensionTimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
}

export const DEFAULT_TIMER_STATE: ExtensionTimerState = {
  status: 'idle',
  sessionType: 'work',
  secondsLeft: DEFAULT_TIMER_SETTINGS.workDuration * 60,
  endsAt: null,
  currentSessionCount: 0,
  activeTaskId: null,
  activeProjectId: null,
  settings: DEFAULT_TIMER_SETTINGS,
}

export function getSessionDurationSeconds(
  type: SessionType,
  settings: ExtensionTimerSettings,
): number {
  if (type === 'work') return settings.workDuration * 60
  if (type === 'short_break') return settings.shortBreakDuration * 60
  return settings.longBreakDuration * 60
}

export async function readTimerState(): Promise<ExtensionTimerState> {
  const result = await chrome.storage.local.get(TIMER_STORAGE_KEY)
  const stored = result[TIMER_STORAGE_KEY] as Partial<ExtensionTimerState> | undefined

  return {
    ...DEFAULT_TIMER_STATE,
    ...stored,
    settings: {
      ...DEFAULT_TIMER_SETTINGS,
      ...(stored?.settings ?? {}),
    },
  }
}

export async function writeTimerState(
  state: ExtensionTimerState,
): Promise<void> {
  await chrome.storage.local.set({
    [TIMER_STORAGE_KEY]: state,
  })
}
