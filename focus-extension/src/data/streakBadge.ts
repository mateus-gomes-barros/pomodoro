import { supabase } from '../lib/supabase'

const BADGE_LEVELS = [0,3,7,14,30,50,75,100,150,200,300,365,500,600,750,1000,1500,2000]

function toLocalDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function subtractDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() - days)
  return next
}

export function calculateCurrentStreak(activeDates: string[]): number {
  const uniqueDates = new Set(activeDates)
  const today = new Date()
  const todayString = toLocalDateString(today)
  const yesterday = subtractDays(today, 1)
  const yesterdayString = toLocalDateString(yesterday)

  let currentDate: Date | null =
    uniqueDates.has(todayString)
      ? today
      : uniqueDates.has(yesterdayString)
        ? yesterday
        : null

  let streak = 0

  while (currentDate) {
    const key = toLocalDateString(currentDate)
    if (!uniqueDates.has(key)) break
    streak += 1
    currentDate = subtractDays(currentDate, 1)
  }

  return streak
}

export function getBadgeMinimumDays(streakDays: number): number {
  return [...BADGE_LEVELS].reverse().find((days) => streakDays >= days) ?? 0
}

export async function getExtensionCurrentBadgeMinimumDays(): Promise<number> {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('session_date')
    .eq('type', 'work')
    .order('session_date', { ascending: false })

  if (error) throw error

  const dates = (data ?? [])
    .map((row) => row.session_date)
    .filter((value): value is string => typeof value === 'string')

  return getBadgeMinimumDays(calculateCurrentStreak(dates))
}
