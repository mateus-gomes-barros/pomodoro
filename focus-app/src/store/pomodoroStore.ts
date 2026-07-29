import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  SessionType,
  TimerStatus,
  TimerSettings,
  PomodoroSession
} from '../types'

import {
  generateId,
  getTodayString
} from '../utils'

interface PomodoroState {
  // Timer
  status: TimerStatus
  sessionType: SessionType
  secondsLeft: number
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
  switchSession: (type: SessionType) => void
  completeSession: () => void
  setActiveProject: (id: string | null) => void
  setActiveTask: (id: string | null) => void
  updateSettings: (settings: Partial<TimerSettings>) => void
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

function getDuration(type: SessionType, settings: TimerSettings): number {
  switch (type) {
    case 'work': return settings.workDuration * 60
    case 'short_break': return settings.shortBreakDuration * 60
    case 'long_break': return settings.longBreakDuration * 60
  }
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      status: 'idle',
      sessionType: 'work',
      secondsLeft: DEFAULT_SETTINGS.workDuration * 60,
      currentSessionCount: 0,
      activeProjectId: null,
      activeTaskId: null,
      settings: DEFAULT_SETTINGS,
      sessions: [],

      start: () => set({ status: 'running' }),

      pause: () => set({ status: 'paused' }),

      reset: () => {
        const { sessionType, settings } = get()
        set({
          status: 'idle',
          secondsLeft: getDuration(sessionType, settings),
        })
      },

      tick: () => {
        const { secondsLeft } = get()
        if (secondsLeft <= 0) {
          get().completeSession()
        } else {
          set({ secondsLeft: secondsLeft - 1 })
        }
      },

      switchSession: (type: SessionType) => {
        const { settings } = get()
        set({
          sessionType: type,
          secondsLeft: getDuration(type, settings),
          status: 'idle',
        })
      },

      completeSession: () => {
        const { sessionType, currentSessionCount, settings, activeProjectId, activeTaskId } = get()

        const session: PomodoroSession = {
          id: generateId(),
          type: sessionType,
          projectId: activeProjectId ?? undefined,
          taskId: activeTaskId ?? undefined,
          durationMinutes:
            sessionType === 'work'
              ? settings.workDuration
              : sessionType === 'short_break'
              ? settings.shortBreakDuration
              : settings.longBreakDuration,
          completedAt: new Date().toISOString(),
          date: getTodayString(),
        }

        const newCount = sessionType === 'work' ? currentSessionCount + 1 : currentSessionCount
        const isLongBreak = newCount % settings.sessionsUntilLongBreak === 0 && newCount > 0

        let nextType: SessionType
        if (sessionType === 'work') {
          nextType = isLongBreak ? 'long_break' : 'short_break'
        } else {
          nextType = 'work'
        }

        set(state => ({
          sessions: [...state.sessions, session],
          status: 'completed',
          currentSessionCount: newCount,
          sessionType: nextType,
          secondsLeft: getDuration(nextType, settings),
        }))
      },

      setActiveProject: (id) => set({ activeProjectId: id }),
      setActiveTask: (id) => set({ activeTaskId: id }),

      updateSettings: (newSettings) => {
        set(state => {
          const merged = { ...state.settings, ...newSettings }
          return {
            settings: merged,
            secondsLeft: getDuration(state.sessionType, merged),
            status: 'idle',
          }
        })
      },

      getTodaySessions: () => {
        const today = getTodayString()
        return get().sessions.filter(s => s.date === today)
      },

      getTodayFocusMinutes: () => {
        const today = getTodayString()
        return get()
          .sessions.filter(s => s.date === today && s.type === 'work')
          .reduce((acc, s) => acc + s.durationMinutes, 0)
      },
    }),
    {
      name: 'focus_pomodoro',
      partialize: (state) => ({
        sessions: state.sessions,
        settings: state.settings,
        currentSessionCount: state.currentSessionCount,
      }),
    }
  )
)