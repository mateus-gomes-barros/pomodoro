import {
    Capacitor,
    registerPlugin,
  } from '@capacitor/core'
  
  import type {
    PomodoroSession,
  } from '@/types'
  
  interface MonthlyActivityWidgetPlugin {
    saveSnapshot(
      options: {
        payload: string
      },
    ): Promise<{
      saved: boolean
    }>
  }
  
  interface MonthlyActivityDaySnapshot {
    date: string
    focusMinutes: number
  }
  
  interface MonthlyActivityWidgetSnapshot {
    year: number
    month: number
    monthTitle: string
    longestStreak: number
    days: MonthlyActivityDaySnapshot[]
    updatedAt: string
  }
  
  const monthlyActivityWidgetPlugin =
    registerPlugin<MonthlyActivityWidgetPlugin>(
      'MonthlyActivityWidgetBridge',
    )
  
  function isAvailable(): boolean {
    return (
      Capacitor.isNativePlatform() &&
      Capacitor.getPlatform() === 'ios'
    )
  }
  
  function padNumber(
    value: number,
  ): string {
    return String(value).padStart(
      2,
      '0',
    )
  }
  
  function calculateLongestStreak(
    days: MonthlyActivityDaySnapshot[],
  ): number {
    let currentStreak = 0
    let longestStreak = 0
  
    days.forEach((day) => {
      if (day.focusMinutes > 0) {
        currentStreak += 1
  
        longestStreak = Math.max(
          longestStreak,
          currentStreak,
        )
  
        return
      }
  
      currentStreak = 0
    })
  
    return longestStreak
  }
  
  export async function saveMonthlyActivityWidgetSnapshot(
    sessions: PomodoroSession[],
  ): Promise<void> {
    if (!isAvailable()) {
      return
    }
  
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
  
    const monthPrefix = [
      year,
      padNumber(month),
    ].join('-')
  
    const focusMinutesByDate =
      new Map<string, number>()
  
    sessions.forEach((session) => {
      if (
        session.type !== 'work' ||
        !session.date.startsWith(
          monthPrefix,
        )
      ) {
        return
      }
  
      const currentMinutes =
        focusMinutesByDate.get(
          session.date,
        ) ?? 0
  
      focusMinutesByDate.set(
        session.date,
        currentMinutes +
          session.durationMinutes,
      )
    })
  
    const numberOfDays =
      new Date(
        year,
        month,
        0,
      ).getDate()
  
    const days =
      Array.from(
        {
          length: numberOfDays,
        },
        (_, index) => {
          const dayNumber =
            index + 1
  
          const date = [
            year,
            padNumber(month),
            padNumber(dayNumber),
          ].join('-')
  
          return {
            date,
            focusMinutes:
              focusMinutesByDate.get(
                date,
              ) ?? 0,
          }
        },
      )
  
    const snapshot:
      MonthlyActivityWidgetSnapshot = {
        year,
        month,
        monthTitle:
          new Intl.DateTimeFormat(
            'en-US',
            {
              month: 'long',
              year: 'numeric',
            },
          ).format(
            new Date(
              year,
              month - 1,
              1,
            ),
          ),
        longestStreak:
          calculateLongestStreak(days),
        days,
        updatedAt:
          new Date().toISOString(),
      }
  
    try {
      await monthlyActivityWidgetPlugin
        .saveSnapshot({
          payload: JSON.stringify(
            snapshot,
          ),
        })
    } catch (error) {
      console.error(
        'Failed to update the monthly activity widget:',
        error,
      )
    }
  }