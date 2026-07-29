import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Flame,
  LoaderCircle,
  Trophy,
  Zap,
} from 'lucide-react'
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  subDays,
  subMonths,
} from 'date-fns'

import { useAnalytics } from '@/hooks/analytics/useAnalytics'
import { usePomodoroSessions } from '@/hooks/pomodoro/usePomodoroSessions'
import { StatCard } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn, formatDuration } from '@/utils'

import type {
  DailyStats,
  PomodoroSession,
  StreakData,
} from '@/types'

const ACHIEVEMENTS = [
  {
    id: 'first_session',
    icon: '🎯',
    title: 'First Focus',
    desc: 'Complete your first session',
  },
  {
    id: 'week_streak',
    icon: '🔥',
    title: 'On Fire',
    desc: '7-day streak',
  },
  {
    id: 'month_streak',
    icon: '🏆',
    title: 'Iron Will',
    desc: '30-day streak',
  },
  {
    id: 'ten_hours',
    icon: '⚡',
    title: 'Power User',
    desc: '600+ focus minutes',
  },
]

function buildDailyStats(
  sessions: PomodoroSession[],
): Record<string, DailyStats> {
  return sessions.reduce<
    Record<string, DailyStats>
  >((stats, session) => {
    if (session.type !== 'work') {
      return stats
    }

    const existing = stats[session.date] ?? {
      date: session.date,
      focusMinutes: 0,
      sessionsCompleted: 0,
      tasksCompleted: 0,
    }

    stats[session.date] = {
      ...existing,
      focusMinutes:
        existing.focusMinutes +
        session.durationMinutes,
      sessionsCompleted:
        existing.sessionsCompleted + 1,
    }

    return stats
  }, {})
}

function buildStreak(
  activeDates: string[],
): StreakData {
  const uniqueDates = [
    ...new Set(activeDates),
  ].sort()

  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: '',
      activeDates: [],
    }
  }

  const activeDateSet = new Set(
    uniqueDates,
  )

  const today = new Date()
  const todayString = format(
    today,
    'yyyy-MM-dd',
  )

  const yesterdayString = format(
    subDays(today, 1),
    'yyyy-MM-dd',
  )

  let currentStreak = 0

  let currentDate = activeDateSet.has(
    todayString,
  )
    ? today
    : activeDateSet.has(yesterdayString)
      ? subDays(today, 1)
      : null

  while (currentDate) {
    const dateString = format(
      currentDate,
      'yyyy-MM-dd',
    )

    if (!activeDateSet.has(dateString)) {
      break
    }

    currentStreak += 1
    currentDate = subDays(currentDate, 1)
  }

  let longestStreak = 1
  let runningStreak = 1

  for (
    let index = 1;
    index < uniqueDates.length;
    index += 1
  ) {
    const previousDate = new Date(
      `${uniqueDates[index - 1]}T00:00:00`,
    )

    const expectedDate = format(
      subDays(
        new Date(
          `${uniqueDates[index]}T00:00:00`,
        ),
        1,
      ),
      'yyyy-MM-dd',
    )

    if (
      format(previousDate, 'yyyy-MM-dd') ===
      expectedDate
    ) {
      runningStreak += 1
      longestStreak = Math.max(
        longestStreak,
        runningStreak,
      )
    } else {
      runningStreak = 1
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastActiveDate:
      uniqueDates[
        uniqueDates.length - 1
      ],
    activeDates: uniqueDates,
  }
}

export function StreaksPage() {
  const {
    totalFocusMinutes,
    isLoading: isAnalyticsLoading,
    isError: isAnalyticsError,
    error: analyticsError,
  } = useAnalytics()

  const sessionsQuery =
    usePomodoroSessions()

  const sessions =
    sessionsQuery.data ?? []

  const dailyStats = useMemo(
    () => buildDailyStats(sessions),
    [sessions],
  )

  const streak = useMemo(() => {
    const activeDates = sessions
      .filter(
        (session) =>
          session.type === 'work',
      )
      .map((session) => session.date)

    return buildStreak(activeDates)
  }, [sessions])

  const today = new Date()

  const months = [
    subMonths(today, 2),
    subMonths(today, 1),
    today,
  ]

  const isLoading =
    isAnalyticsLoading ||
    sessionsQuery.isLoading

  const isError =
    isAnalyticsError ||
    sessionsQuery.isError

  const error =
    analyticsError ??
    sessionsQuery.error

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6 lg:p-10">
        <PageHeader
          title="Streaks"
          subtitle="Loading your activity"
        />

        <div className="flex items-center justify-center py-24">
          <LoaderCircle
            size={30}
            className="animate-spin text-white/40"
          />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl p-6 lg:p-10">
        <PageHeader
          title="Streaks"
          subtitle="Unable to load your activity"
        />

        <div className="card p-6">
          <p className="text-sm text-red-400">
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred while loading streak data.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-10">
      <PageHeader
        title="Streaks"
        subtitle="Keep your momentum going"
      />

      {/* Top cards */}

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Current"
          value={streak.currentStreak}
          sub="days"
          icon={<Flame size={16} />}
          accent={
            streak.currentStreak >= 3
          }
        />

        <StatCard
          label="Longest"
          value={streak.longestStreak}
          sub="best"
          icon={<Trophy size={16} />}
        />

        <StatCard
          label="Active Days"
          value={streak.activeDates.length}
          sub="total"
          icon={<Calendar size={16} />}
        />

        <StatCard
          label="Focus Time"
          value={formatDuration(
            totalFocusMinutes,
          )}
          sub="all time"
          icon={<Zap size={16} />}
        />
      </div>

      {/* Main streak */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="card mb-6 flex flex-col items-center p-6"
      >
        <div className="mb-4 text-6xl">
          {streak.currentStreak >= 30
            ? '🏆'
            : streak.currentStreak >= 7
              ? '🔥'
              : streak.currentStreak >= 3
                ? '✨'
                : '💧'}
        </div>

        <h2 className="text-5xl font-bold text-accent-white">
          {streak.currentStreak}
        </h2>

        <p className="mt-2 text-accent-subtle">
          day streak
        </p>
      </motion.div>

      {/* Heatmap */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="card mb-6 p-6"
      >
        <h3 className="mb-5 font-semibold text-accent-white">
          Activity Heatmap
        </h3>

        <div className="space-y-6 overflow-auto">
          {months.map((month) => (
            <MonthGrid
              key={month.toISOString()}
              month={month}
              dailyStats={dailyStats}
            />
          ))}
        </div>
      </motion.div>

      {/* Achievements */}

      <div className="card p-6">
        <h3 className="mb-4 font-semibold text-accent-white">
          Achievements
        </h3>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ACHIEVEMENTS.map(
            (achievement) => {
              const unlocked =
                achievement.id ===
                'first_session'
                  ? streak.activeDates
                      .length > 0
                  : achievement.id ===
                      'week_streak'
                    ? streak.longestStreak >=
                      7
                    : achievement.id ===
                        'month_streak'
                      ? streak.longestStreak >=
                        30
                      : totalFocusMinutes >=
                        600

              return (
                <div
                  key={achievement.id}
                  className={cn(
                    'rounded-2xl border p-4',
                    unlocked
                      ? 'border-accent-green/30 bg-accent-green/10'
                      : 'border-border-subtle bg-bg-secondary opacity-50',
                  )}
                >
                  <div className="mb-2 text-2xl">
                    {achievement.icon}
                  </div>

                  <div className="text-sm font-medium text-accent-white">
                    {achievement.title}
                  </div>

                  <div className="text-xs text-accent-subtle">
                    {achievement.desc}
                  </div>
                </div>
              )
            },
          )}
        </div>
      </div>
    </div>
  )
}

function MonthGrid({
  month,
  dailyStats,
}: {
  month: Date
  dailyStats: Record<
    string,
    DailyStats
  >
}) {
  const start = startOfMonth(month)
  const end = endOfMonth(month)

  const days = eachDayOfInterval({
    start,
    end,
  })

  const startDay = start.getDay()

  return (
    <div>
      <p className="mb-2 text-xs text-accent-subtle">
        {format(month, 'MMMM yyyy')}
      </p>

      <div className="grid grid-cols-7 gap-1">
        {[
          'S',
          'M',
          'T',
          'W',
          'T',
          'F',
          'S',
        ].map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="text-center text-xs text-accent-subtle"
          >
            {day}
          </div>
        ))}

        {Array.from({
          length: startDay,
        }).map((_, index) => (
          <div
            key={`empty-${index}`}
          />
        ))}

        {days.map((day) => {
          const dateString = format(
            day,
            'yyyy-MM-dd',
          )

          const minutes =
            dailyStats[dateString]
              ?.focusMinutes ?? 0

          const intensity = Math.min(
            minutes / 120,
            1,
          )

          return (
            <div
              key={dateString}
              className="aspect-square rounded-md"
              title={`${minutes} minutes`}
              style={{
                backgroundColor:
                  minutes > 0
                    ? `rgba(126, 224, 129, ${
                        0.2 +
                        intensity * 0.8
                      })`
                    : '#1E1E1E',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}