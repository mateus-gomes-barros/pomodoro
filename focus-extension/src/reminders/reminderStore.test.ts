import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  HYDRATION_ALARM_NAME,
  HYDRATION_STORAGE_KEY,
  getHydrationReminder,
  setHydrationReminder,
} from './reminderStore'

let storage: Record<string, unknown>

beforeEach(() => {
  storage = {}

  Object.assign(globalThis, {
    chrome: {
      storage: {
        local: {
          get: vi.fn(async (key: string) => ({
            [key]: storage[key],
          })),
          set: vi.fn(async (values: Record<string, unknown>) => {
            Object.assign(storage, values)
          }),
        },
      },
      alarms: {
        create: vi.fn(async () => undefined),
        clear: vi.fn(async () => true),
      },
    },
  })
})

describe('hydration reminders', () => {
  it('defaults to disabled with a 60 minute interval', async () => {
    await expect(getHydrationReminder()).resolves.toEqual({
      enabled: false,
      intervalMinutes: 60,
    })
  })

  it('persists and schedules an enabled hydration reminder', async () => {
    const state = await setHydrationReminder({
      enabled: true,
      intervalMinutes: 45,
    })

    expect(state).toEqual({ enabled: true, intervalMinutes: 45 })
    expect(storage[HYDRATION_STORAGE_KEY]).toEqual(state)
    expect(chrome.alarms.create).toHaveBeenCalledWith(
      HYDRATION_ALARM_NAME,
      { delayInMinutes: 45, periodInMinutes: 45 },
    )
  })

  it('clears the hydration alarm when disabled', async () => {
    await setHydrationReminder({
      enabled: false,
      intervalMinutes: 30,
    })

    expect(chrome.alarms.clear).toHaveBeenCalledWith(HYDRATION_ALARM_NAME)
  })
})
