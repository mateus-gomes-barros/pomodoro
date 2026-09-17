import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getTimerState,
  pauseTimer,
  resetTimer,
  setActiveTimerTask,
  startTimer,
  switchTimerSession,
  toggleTimerSound,
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

  it('persists the active task and project context', async () => {
    const state = await setActiveTimerTask('task-1', 'project-1')

    expect(state.activeTaskId).toBe('task-1')
    expect(state.activeProjectId).toBe('project-1')
    expect(storage[TIMER_STORAGE_KEY]).toEqual(state)
  })

  it('completes focus into the next break using the same session cycle as Focus', async () => {
    storage[TIMER_STORAGE_KEY] = {
      ...DEFAULT_TIMER_STATE,
      status: 'running',
      endsAt: 2_000,
      activeTaskId: 'task-1',
    }

    const state = await getTimerState(3_000)

    expect(state.status).toBe('completed')
    expect(state.sessionType).toBe('short_break')
    expect(state.secondsLeft).toBe(5 * 60)
    expect(state.currentSessionCount).toBe(1)
    expect(state.endsAt).toBeNull()
    expect(state.activeTaskId).toBe('task-1')
  })

  it('resets the current session without clearing task or project context', async () => {
    storage[TIMER_STORAGE_KEY] = {
      ...DEFAULT_TIMER_STATE,
      status: 'paused',
      secondsLeft: 42,
      activeTaskId: 'task-1',
      activeProjectId: 'project-1',
    }

    const state = await resetTimer()

    expect(state.status).toBe('idle')
    expect(state.secondsLeft).toBe(25 * 60)
    expect(state.activeTaskId).toBe('task-1')
    expect(state.activeProjectId).toBe('project-1')
  })

  it('switches between focus and break durations when not running', async () => {
    const state = await switchTimerSession('long_break')

    expect(state.sessionType).toBe('long_break')
    expect(state.secondsLeft).toBe(15 * 60)
    expect(state.status).toBe('idle')
  })

  it('toggles sound without changing the current timer', async () => {
    const state = await toggleTimerSound()

    expect(state.settings.soundEnabled).toBe(false)
    expect(state.secondsLeft).toBe(25 * 60)
  })
})
