import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  StreakData,
  DailyStats
} from '../types'

import {
  getTodayString,
  getLast30Days
} from '../utils'

import {
  differenceInDays,
  parseISO,
  subDays,
  format
} from 'date-fns'

interface StatsState {
  dailyStats: Record<string, DailyStats>
  streak: StreakData
  recordFocusSession: (minutes: number) => void
  recordTaskCompletion: () => void
  updateStreak: () => void
  getWeeklyData: () => DailyStats[]
  getMonthlyData: () => DailyStats[]
  getTotalFocusMinutes: () => number
  getTotalSessions: () => number
}

function buildSeedStats(): Record<string, DailyStats> {
  const stats: Record<string, DailyStats> = {}
  const today = new Date()

  const data = [
    120, 95, 0, 140, 180, 75, 160,
    0, 90, 110, 85, 0, 130, 200,
    145, 0, 70, 95, 160, 120, 0,
    85, 140, 110, 95, 0, 175, 90,
    60, 130,
  ]

  data.forEach((mins, i) => {
    const d = subDays(today, 29 - i)
    const dateStr = format(d, 'yyyy-MM-dd')

    if (mins > 0) {
      stats[dateStr] = {
        date: dateStr,
        focusMinutes: mins,
        sessionsCompleted: Math.floor(mins / 25),
        tasksCompleted: Math.floor(Math.random() * 4) + 1,
      }
    }
  })

  return stats
}

function buildSeedStreak(): StreakData {
  const today = new Date()
  const activeDates: string[] = []

  for (let i = 1; i <= 6; i++) {
    activeDates.push(
      format(subDays(today, i), 'yyyy-MM-dd')
    )
  }

  return {
    currentStreak: 6,
    longestStreak: 12,
    lastActiveDate: format(
      subDays(today, 1),
      'yyyy-MM-dd'
    ),
    activeDates,
  }
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      dailyStats: buildSeedStats(),
      streak: buildSeedStreak(),

      recordFocusSession: (minutes) => {
        const today = getTodayString()

        set((state) => {
          const existing =
            state.dailyStats[today] ?? {
              date: today,
              focusMinutes: 0,
              sessionsCompleted: 0,
              tasksCompleted: 0,
            }

          return {
            dailyStats: {
              ...state.dailyStats,
              [today]: {
                ...existing,
                focusMinutes:
                  existing.focusMinutes + minutes,
                sessionsCompleted:
                  existing.sessionsCompleted + 1,
              },
            },
          }
        })

        get().updateStreak()
      },

      recordTaskCompletion: () => {
        const today = getTodayString()

        set((state) => {
          const existing =
            state.dailyStats[today] ?? {
              date: today,
              focusMinutes: 0,
              sessionsCompleted: 0,
              tasksCompleted: 0,
            }

          return {
            dailyStats: {
              ...state.dailyStats,
              [today]: {
                ...existing,
                tasksCompleted:
                  existing.tasksCompleted + 1,
              },
            },
          }
        })
      },

      updateStreak: () => {
        const today = getTodayString()

        set((state) => {
          const { streak } = state
          const lastActive =
            streak.lastActiveDate

          if (lastActive === today)
            return state

          let newStreak =
            streak.currentStreak

          if (lastActive) {
            const daysDiff =
              differenceInDays(
                parseISO(today),
                parseISO(lastActive)
              )

            newStreak =
              daysDiff === 1
                ? streak.currentStreak + 1
                : 1
          } else {
            newStreak = 1
          }

          const activeDates = [
            ...new Set([
              ...streak.activeDates,
              today,
            ]),
          ]

          return {
            streak: {
              currentStreak: newStreak,
              longestStreak: Math.max(
                streak.longestStreak,
                newStreak
              ),
              lastActiveDate: today,
              activeDates,
            },
          }
        })
      },

      getWeeklyData: () => {
        const { dailyStats } = get()

        return getLast30Days()
          .slice(-7)
          .map((date) => ({
            date,
            focusMinutes:
              dailyStats[date]
                ?.focusMinutes ?? 0,
            sessionsCompleted:
              dailyStats[date]
                ?.sessionsCompleted ?? 0,
            tasksCompleted:
              dailyStats[date]
                ?.tasksCompleted ?? 0,
          }))
      },

      getMonthlyData: () => {
        const { dailyStats } = get()

        return getLast30Days()
          .map((date) => ({
            date,
            focusMinutes:
              dailyStats[date]
                ?.focusMinutes ?? 0,
            sessionsCompleted:
              dailyStats[date]
                ?.sessionsCompleted ?? 0,
            tasksCompleted:
              dailyStats[date]
                ?.tasksCompleted ?? 0,
          }))
      },

      getTotalFocusMinutes: () =>
        Object.values(
          get().dailyStats
        ).reduce(
          (acc, stat) =>
            acc + stat.focusMinutes,
          0
        ),

      getTotalSessions: () =>
        Object.values(
          get().dailyStats
        ).reduce(
          (acc, stat) =>
            acc + stat.sessionsCompleted,
          0
        ),
    }),
    {
      name: 'focus_stats',
    }
  )
)