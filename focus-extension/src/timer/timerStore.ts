import { createTimerDeadline, getRemainingSeconds } from '@focus/shared/timer'

import {
  DEFAULT_TIMER_STATE,
  TIMER_ALARM_NAME,
  type ExtensionTimerState,
  readTimerState,
  writeTimerState,
} from './timerStorage'

function getCompletedTimerState(
  state: ExtensionTimerState,
): ExtensionTimerState {
  return {
    ...state,
    status: 'idle',
    secondsLeft: DEFAULT_TIMER_STATE.secondsLeft,
    endsAt: null,
  }
}

export async function getTimerState(
  now = Date.now(),
): Promise<ExtensionTimerState> {
  const state = await readTimerState()

  if (
    state.status !== 'running' ||
    state.endsAt === null
  ) {
    return state
  }

  const secondsLeft = getRemainingSeconds(state.endsAt, now)

  if (secondsLeft > 0) {
    return {
      ...state,
      secondsLeft,
    }
  }

  const completedState = getCompletedTimerState(state)

  await writeTimerState(completedState)
  return completedState
}

export async function startTimer(
  now = Date.now(),
): Promise<ExtensionTimerState> {
  const state = await getTimerState(now)

  if (state.status === 'running' || state.secondsLeft <= 0) {
    return state
  }

  const endsAt = createTimerDeadline(state.secondsLeft, now)
  const nextState: ExtensionTimerState = {
    ...state,
    status: 'running',
    endsAt,
  }

  await writeTimerState(nextState)
  await chrome.alarms.create(TIMER_ALARM_NAME, { when: endsAt })

  return nextState
}

export async function pauseTimer(
  now = Date.now(),
): Promise<ExtensionTimerState> {
  const state = await readTimerState()

  if (state.status !== 'running' || state.endsAt === null) {
    return state
  }

  const nextState: ExtensionTimerState = {
    ...state,
    status: 'paused',
    secondsLeft: getRemainingSeconds(state.endsAt, now),
    endsAt: null,
  }

  await chrome.alarms.clear(TIMER_ALARM_NAME)
  await writeTimerState(nextState)

  return nextState
}

export async function setActiveTimerTask(
  taskId: string | null,
  projectId: string | null,
): Promise<ExtensionTimerState> {
  const state = await getTimerState()
  const nextState: ExtensionTimerState = {
    ...state,
    activeTaskId: taskId,
    activeProjectId: projectId,
  }

  await writeTimerState(nextState)
  return nextState
}

export async function resetTimer(): Promise<ExtensionTimerState> {
  await chrome.alarms.clear(TIMER_ALARM_NAME)
  await writeTimerState(DEFAULT_TIMER_STATE)
  return DEFAULT_TIMER_STATE
}

export function completeTimerState(
  state: ExtensionTimerState,
): ExtensionTimerState {
  return getCompletedTimerState(state)
}
