import { createTimerDeadline, getRemainingSeconds } from '@focus/shared/timer'

import {
  TIMER_ALARM_NAME,
  getSessionDurationSeconds,
  type ExtensionTimerState,
  type SessionType,
  readTimerState,
  writeTimerState,
} from './timerStorage'

function getNextSessionState(
  state: ExtensionTimerState,
): ExtensionTimerState {
  const nextCount =
    state.sessionType === 'work'
      ? state.currentSessionCount + 1
      : state.currentSessionCount

  const shouldUseLongBreak =
    nextCount > 0 &&
    nextCount % state.settings.sessionsUntilLongBreak === 0

  const nextType: SessionType =
    state.sessionType === 'work'
      ? shouldUseLongBreak
        ? 'long_break'
        : 'short_break'
      : 'work'

  return {
    ...state,
    status: 'completed',
    sessionType: nextType,
    secondsLeft: getSessionDurationSeconds(nextType, state.settings),
    endsAt: null,
    currentSessionCount: nextCount,
  }
}

export async function getTimerState(
  now = Date.now(),
): Promise<ExtensionTimerState> {
  const state = await readTimerState()

  if (state.status !== 'running' || state.endsAt === null) {
    return state
  }

  const secondsLeft = getRemainingSeconds(state.endsAt, now)

  if (secondsLeft > 0) {
    return {
      ...state,
      secondsLeft,
    }
  }

  const completedState = getNextSessionState(state)
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

export async function resetTimer(): Promise<ExtensionTimerState> {
  const state = await readTimerState()

  const nextState: ExtensionTimerState = {
    ...state,
    status: 'idle',
    secondsLeft: getSessionDurationSeconds(state.sessionType, state.settings),
    endsAt: null,
  }

  await chrome.alarms.clear(TIMER_ALARM_NAME)
  await writeTimerState(nextState)
  return nextState
}

export async function switchTimerSession(
  sessionType: SessionType,
): Promise<ExtensionTimerState> {
  const state = await readTimerState()

  if (state.status === 'running') {
    return state
  }

  const nextState: ExtensionTimerState = {
    ...state,
    status: 'idle',
    sessionType,
    secondsLeft: getSessionDurationSeconds(sessionType, state.settings),
    endsAt: null,
  }

  await chrome.alarms.clear(TIMER_ALARM_NAME)
  await writeTimerState(nextState)
  return nextState
}

export async function toggleTimerSound(): Promise<ExtensionTimerState> {
  const state = await readTimerState()
  const nextState: ExtensionTimerState = {
    ...state,
    settings: {
      ...state.settings,
      soundEnabled: !state.settings.soundEnabled,
    },
  }

  await writeTimerState(nextState)
  return nextState
}

export async function setActiveTimerTask(
  taskId: string | null,
  projectId: string | null,
): Promise<ExtensionTimerState> {
  const state = await getTimerState()

  if (state.status === 'running') {
    return state
  }

  const nextState: ExtensionTimerState = {
    ...state,
    activeTaskId: taskId,
    activeProjectId: projectId,
  }

  await writeTimerState(nextState)
  return nextState
}

export function completeTimerState(
  state: ExtensionTimerState,
): ExtensionTimerState {
  return getNextSessionState(state)
}
