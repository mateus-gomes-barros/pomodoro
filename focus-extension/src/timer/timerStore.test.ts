import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getTimerState,
  pauseTimer,
  resetTimer,
  startTimer,
} from './timerStore'
import {
  DEFAULT_TIMER_STATE,
  TIMER_ALARM_NAME,
  TIMER_STORAGE_KEY,
} from './timerStorage'

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

describe('extension timer engine', () => {
  it('starts from the persisted remaining duration and creates an alarm', async () => {
    storage[TIMER_STORAGE_KEY] = {
      ...DEFAULT_TIMER_STATE,
      secondsLeft: 30,
    }

    const state = await startTimer(1_000)

    expect(state.status).toBe('running')
    expect(state.endsAt).toBe(31_000)
    expect(chrome.alarms.create).toHaveBeenCalledWith(
      TIMER_ALARM_NAME,
      { when: 31_000 },
    )
  })

  it('pauses using the deadline rather than stale secondsLeft', async () => {
    storage[TIMER_STORAGE_KEY] = {
      ...DEFAULT_TIMER_STATE,
      status: 'running',
      secondsLeft: 30,
      endsAt: 31_000,
    }

    const state = await pauseTimer(11_500)

    expect(state.status).toBe('paused')
    expect(state.secondsLeft).toBe(20)
    expect(state.endsAt).toBeNull()
  })

  it('reconstructs an expired running timer as ready for a new session', async () => {
    storage[TIMER_STORAGE_KEY] = {
      ...DEFAULT_TIMER_STATE,
      status: 'running',
      endsAt: 2_000,
      activeTaskId: 'task-1',
    }

    const state = await getTimerState(3_000)

    expect(state.status).toBe('idle')
    expect(state.secondsLeft).toBe(DEFAULT_TIMER_STATE.secondsLeft)
    expect(state.endsAt).toBeNull()
    expect(state.activeTaskId).toBe('task-1')
  })

  it('resets to the default timer state', async () => {
    storage[TIMER_STORAGE_KEY] = {
      ...DEFAULT_TIMER_STATE,
      status: 'paused',
      secondsLeft: 42,
    }

    const state = await resetTimer()

    expect(state).toEqual(DEFAULT_TIMER_STATE)
  })
})
