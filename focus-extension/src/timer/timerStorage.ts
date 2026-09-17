export type TimerStatus = 'idle' | 'running' | 'paused'
export type SessionType = 'work' | 'short_break' | 'long_break'

export type ExtensionTimerState = {
  status: TimerStatus
  sessionType: SessionType
  secondsLeft: number
  endsAt: number | null
  activeTaskId: string | null
  activeProjectId: string | null
}

export const TIMER_STORAGE_KEY = 'focus-extension-timer'
export const TIMER_ALARM_NAME = 'focus-timer-complete'

export const DEFAULT_TIMER_STATE: ExtensionTimerState = {
  status: 'idle',
  sessionType: 'work',
  secondsLeft: 25 * 60,
  endsAt: null,
  activeTaskId: null,
  activeProjectId: null,
}

export async function readTimerState(): Promise<ExtensionTimerState> {
  const result = await chrome.storage.local.get(TIMER_STORAGE_KEY)
  const stored = result[TIMER_STORAGE_KEY] as Partial<ExtensionTimerState> | undefined

  return {
    ...DEFAULT_TIMER_STATE,
    ...stored,
  }
}

export async function writeTimerState(
  state: ExtensionTimerState,
): Promise<void> {
  await chrome.storage.local.set({
    [TIMER_STORAGE_KEY]: state,
  })
}
