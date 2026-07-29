import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  PomodoroSession,
  SessionType,
  TimerSettings,
  TimerStatus,
} from '../types'

import {
  generateId,
  getTodayString,
} from '../utils'

interface PomodoroState {
  // Timer
  status: TimerStatus
  sessionType: SessionType
  secondsLeft: number
  endsAt: number | null
  currentSessionCount: number
  activeProjectId: string | null
  activeTaskId: string | null

  // Settings
  settings: TimerSettings

  // History
  sessions: PomodoroSession[]

  // Actions
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  switchSession: (
    type: SessionType,
  ) => void
  completeSession: () => void
  setActiveProject: (
    id: string | null,
  ) => void
  setActiveTask: (
    id: string | null,
  ) => void
  updateSettings: (
    settings: Partial<TimerSettings>,
  ) => void
  getTodaySessions: () => PomodoroSession[]
  getTodayFocusMinutes: () => number
}

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundEnabled: true,
  autoStartBreaks: false,
  autoStartWork: false,
}

function getDuration(
  type: SessionType,
  settings: TimerSettings,
): number {
  switch (type) {
    case 'work':
      return settings.workDuration * 60

    case 'short_break':
      return (
        settings.shortBreakDuration * 60
      )

    case 'long_break':
      return (
        settings.longBreakDuration * 60
      )
  }
}

function getRemainingSeconds(
  endsAt: number,
): number {
  return Math.max(
    0,
    Math.ceil(
      (endsAt - Date.now()) / 1000,
    ),
  )
}

export const usePomodoroStore =
  create<PomodoroState>()(
    persist(
      (set, get) => ({
        status: 'idle',
        sessionType: 'work',
        secondsLeft:
          DEFAULT_SETTINGS.workDuration *
          60,
        endsAt: null,
        currentSessionCount: 0,
        activeProjectId: null,
        activeTaskId: null,
        settings: DEFAULT_SETTINGS,
        sessions: [],

        start: () => {
          const {
            secondsLeft,
            status,
          } = get()

          if (
            status === 'running' ||
            secondsLeft <= 0
          ) {
            return
          }

          set({
            status: 'running',
            endsAt:
              Date.now() +
              secondsLeft * 1000,
          })
        },

        pause: () => {
          const {
            status,
            endsAt,
          } = get()

          if (
            status !== 'running' ||
            endsAt === null
          ) {
            return
          }

          set({
            status: 'paused',
            secondsLeft:
              getRemainingSeconds(endsAt),
            endsAt: null,
          })
        },

        reset: () => {
          const {
            sessionType,
            settings,
          } = get()

          set({
            status: 'idle',
            secondsLeft: getDuration(
              sessionType,
              settings,
            ),
            endsAt: null,
          })
        },

        tick: () => {
          const {
            status,
            endsAt,
          } = get()

          if (
            status !== 'running' ||
            endsAt === null
          ) {
            return
          }

          const remainingSeconds =
            getRemainingSeconds(endsAt)

          if (remainingSeconds <= 0) {
            get().completeSession()
            return
          }

          set({
            secondsLeft:
              remainingSeconds,
          })
        },

        switchSession: (
          type: SessionType,
        ) => {
          const { settings } = get()

          set({
            sessionType: type,
            secondsLeft: getDuration(
              type,
              settings,
            ),
            status: 'idle',
            endsAt: null,
          })
        },

        completeSession: () => {
          const {
            sessionType,
            currentSessionCount,
            settings,
            activeProjectId,
            activeTaskId,
          } = get()

          const session: PomodoroSession =
            {
              id: generateId(),
              type: sessionType,
              projectId:
                activeProjectId ??
                undefined,
              taskId:
                activeTaskId ??
                undefined,
              durationMinutes:
                sessionType === 'work'
                  ? settings.workDuration
                  : sessionType ===
                      'short_break'
                    ? settings.shortBreakDuration
                    : settings.longBreakDuration,
              completedAt:
                new Date().toISOString(),
              date: getTodayString(),
            }

          const newCount =
            sessionType === 'work'
              ? currentSessionCount + 1
              : currentSessionCount

          const isLongBreak =
            newCount > 0 &&
            newCount %
              settings.sessionsUntilLongBreak ===
              0

          let nextType: SessionType

          if (sessionType === 'work') {
            nextType = isLongBreak
              ? 'long_break'
              : 'short_break'
          } else {
            nextType = 'work'
          }

          set((state) => ({
            sessions: [
              ...state.sessions,
              session,
            ],
            status: 'completed',
            endsAt: null,
            currentSessionCount:
              newCount,
            sessionType: nextType,
            secondsLeft: getDuration(
              nextType,
              settings,
            ),
          }))
        },

        setActiveProject: (id) => {
          set({
            activeProjectId: id,
          })
        },

        setActiveTask: (id) => {
          set({
            activeTaskId: id,
          })
        },

        updateSettings: (
          newSettings,
        ) => {
          set((state) => {
            const merged = {
              ...state.settings,
              ...newSettings,
            }

            return {
              settings: merged,
              secondsLeft: getDuration(
                state.sessionType,
                merged,
              ),
              status: 'idle',
              endsAt: null,
            }
          })
        },

        getTodaySessions: () => {
          const today =
            getTodayString()

          return get().sessions.filter(
            (session) =>
              session.date === today,
          )
        },

        getTodayFocusMinutes: () => {
          const today =
            getTodayString()

          return get()
            .sessions.filter(
              (session) =>
                session.date ===
                  today &&
                session.type === 'work',
            )
            .reduce(
              (total, session) =>
                total +
                session.durationMinutes,
              0,
            )
        },
      }),
      {
        name: 'focus_pomodoro',

        partialize: (state) => ({
          status: state.status,
          sessionType:
            state.sessionType,
          secondsLeft:
            state.secondsLeft,
          endsAt: state.endsAt,
          activeProjectId:
            state.activeProjectId,
          activeTaskId:
            state.activeTaskId,
          sessions: state.sessions,
          settings: state.settings,
          currentSessionCount:
            state.currentSessionCount,
        }),
      },
    ),
  )