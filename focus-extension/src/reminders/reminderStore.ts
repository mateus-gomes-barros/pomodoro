export const HYDRATION_STORAGE_KEY = 'focus-extension-hydration'
export const HYDRATION_ALARM_NAME = 'focus-hydration-reminder'

export type HydrationInterval = 30 | 45 | 60 | 90

export type HydrationReminderState = {
  enabled: boolean
  intervalMinutes: HydrationInterval
}

const DEFAULT_HYDRATION_REMINDER: HydrationReminderState = {
  enabled: false,
  intervalMinutes: 60,
}

export async function getHydrationReminder(): Promise<HydrationReminderState> {
  const result = await chrome.storage.local.get(HYDRATION_STORAGE_KEY)
  const stored = result[HYDRATION_STORAGE_KEY] as Partial<HydrationReminderState> | undefined

  return {
    ...DEFAULT_HYDRATION_REMINDER,
    ...stored,
  }
}

export async function setHydrationReminder(
  state: HydrationReminderState,
): Promise<HydrationReminderState> {
  await chrome.storage.local.set({
    [HYDRATION_STORAGE_KEY]: state,
  })

  if (!state.enabled) {
    await chrome.alarms.clear(HYDRATION_ALARM_NAME)
    return state
  }

  await chrome.alarms.create(HYDRATION_ALARM_NAME, {
    delayInMinutes: state.intervalMinutes,
    periodInMinutes: state.intervalMinutes,
  })

  return state
}
