import {
    Capacitor,
    registerPlugin,
  } from '@capacitor/core'
  import {
    addDays,
    format,
    startOfWeek,
    subDays,
  } from 'date-fns'
  
  import type {
    PomodoroSession,
  } from '@/types'
  
  interface WeeklyActivityWidgetPlugin {
    saveSnapshot(
      options: {
        payload: string
      },
    ): Promise<{
      saved: boolean
    }>
  }
  
  interface WeeklyActivityDaySnapshot {
    date: string
    label: string
    focusMinutes: number
    isToday: boolean
  }
  
  interface WeeklyActivityWidgetSnapshot {
    currentStreak: number
    totalFocusMinutes: number
    days: WeeklyActivityDaySnapshot[]
    updatedAt: string
  }
  
  const weeklyActivityWidgetPlugin =
    registerPlugin<WeeklyActivityWidgetPlugin>(
      'WeeklyActivityWidgetBridge',
    )
  
  const weekdayLabels = [
    'M',
    'T',
    'W',
    'T',
    'F',
    'S',
    'S',
  ]
  
  function isAvailable(): boolean {
    return (
      Capacitor.isNativePlatform() &&
      Capacitor.getPlatform() === 'ios'
    )
  }
  
  function calculateCurrentStreak(
    activeDates: string[],
  ): number {
    const uniqueDates =
      new Set(activeDates)
  
    const today = new Date()
  
    const todayString = format(
      today,
      'yyyy-MM-dd',
    )
  
    const yesterday = subDays(
      today,
      1,
    )
  
    const yesterdayString = format(
      yesterday,
      'yyyy-MM-dd',
    )
  
    let currentDate: Date | null =
      uniqueDates.has(todayString)
        ? today
        : uniqueDates.has(
              yesterdayString,
            )
          ? yesterday
          : null
  
    let currentStreak = 0
  
    while (currentDate) {
      const dateString = format(
        currentDate,
        'yyyy-MM-dd',
      )
  
      if (!uniqueDates.has(dateString)) {
        break
      }
  
      currentStreak += 1
  
      currentDate = subDays(
        currentDate,
        1,
      )
    }
  
    return currentStreak
  }
  
  export async function saveWeeklyActivityWidgetSnapshot(
    sessions: PomodoroSession[],
  ): Promise<void> {
    if (!isAvailable()) {
      return
    }
  
    const workSessions =
      sessions.filter(
        (session) =>
          session.type === 'work',
      )
  
    const focusMinutesByDate =
      new Map<string, number>()
  
    workSessions.forEach((session) => {
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
  
    const today = new Date()
  
    const weekStart = startOfWeek(
      today,
      {
        weekStartsOn: 1,
      },
    )
  
    const todayString = format(
      today,
      'yyyy-MM-dd',
    )
  
    const days =
      Array.from(
        {
          length: 7,
        },
        (_, index) => {
          const currentDate = addDays(
            weekStart,
            index,
          )
  
          const date = format(
            currentDate,
            'yyyy-MM-dd',
          )
  
          return {
            date,
            label:
              weekdayLabels[index] ??
              '',
            focusMinutes:
              focusMinutesByDate.get(
                date,
              ) ?? 0,
            isToday:
              date === todayString,
          }
        },
      )
  
    const totalFocusMinutes =
      days.reduce(
        (total, day) =>
          total +
          day.focusMinutes,
        0,
      )
  
    const snapshot:
      WeeklyActivityWidgetSnapshot = {
        currentStreak:
          calculateCurrentStreak(
            workSessions.map(
              (session) =>
                session.date,
            ),
          ),
        totalFocusMinutes,
        days,
        updatedAt:
          new Date().toISOString(),
      }
  
    try {
      await weeklyActivityWidgetPlugin
        .saveSnapshot({
          payload: JSON.stringify(
            snapshot,
          ),
        })
    } catch (error) {
      console.error(
        'Failed to update the weekly activity widget:',
        error,
      )
    }
  }