import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Check,
  Flame,
  LoaderCircle,
  Lock,
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
import {
  getNextStreakBadge,
  getStreakBadge,
  getStreakBadgeProgress,
  STREAK_BADGES,
} from '@/lib/streakBadges'
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
    desc: 'Reach a 7-day streak',
  },
  {
    id: 'month_streak',
    icon: '🏆',
    title: 'Iron Will',
    desc: 'Reach a 30-day streak',
  },
  {
    id: 'ten_hours',
    icon: '⚡',
    title: 'Power User',
    desc: 'Complete 600 focus minutes',
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
    : activeDateSet.has(
          yesterdayString,
        )
      ? subDays(today, 1)
      : null

  while (currentDate) {
    const dateString = format(
      currentDate,
      'yyyy-MM-dd',
    )

    if (
      !activeDateSet.has(dateString)
    ) {
      break
    }

    currentStreak += 1

    currentDate = subDays(
      currentDate,
      1,
    )
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
      format(
        previousDate,
        'yyyy-MM-dd',
      ) === expectedDate
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
      .map(
        (session) => session.date,
      )

    return buildStreak(activeDates)
  }, [sessions])

  const today = new Date()

  const months = [
    subMonths(today, 2),
    subMonths(today, 1),
    today,
  ]

  const currentBadge =
    getStreakBadge(
      streak.currentStreak,
    )

  const nextBadge =
    getNextStreakBadge(
      streak.currentStreak,
    )

  const badgeProgress =
    getStreakBadgeProgress(
      streak.currentStreak,
    )

  const progressPercentage =
    Math.round(
      badgeProgress * 100,
    )

  const daysUntilNextBadge =
    nextBadge
      ? nextBadge.minimumDays -
        streak.currentStreak
      : 0

  const streakLabel =
    streak.currentStreak === 1
      ? 'day'
      : 'days'

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

      <motion.section
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: 'easeOut',
        }}
        className="
          card
          relative
          mb-6
          overflow-hidden
          p-6
          sm:p-8
        "
      >
        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-0
            h-48
            w-48
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-white/[0.04]
            blur-3xl
          "
          aria-hidden="true"
        />

        <div
          className="
            relative
            flex
            flex-col
            items-center
            text-center
          "
        >
          <motion.div
            key={currentBadge.name}
            initial={{
              opacity: 0,
              scale: 0.78,
              rotate: -6,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              duration: 0.4,
              ease: 'easeOut',
            }}
            className="
              flex
              h-24
              w-24
              items-center
              justify-center
              rounded-[2rem]
              border
              border-white/[0.08]
              bg-white/[0.045]
              text-6xl
              shadow-[0_20px_60px_rgba(0,0,0,0.28)]
            "
            aria-hidden="true"
          >
            {currentBadge.icon}
          </motion.div>

          <p
            className="
              mt-6
              text-xs
              font-semibold
              uppercase
              tracking-[0.2em]
              text-white/30
            "
          >
            Current badge
          </p>

          <h2
            className="
              mt-2
              text-2xl
              font-bold
              tracking-[-0.03em]
              text-accent-white
              sm:text-3xl
            "
          >
            {currentBadge.name}
          </h2>

          <p
            className="
              mt-2
              max-w-md
              text-sm
              leading-6
              text-accent-subtle
            "
          >
            {currentBadge.description}
          </p>

          <div className="mt-6 flex items-end gap-2">
            <span
              className="
                text-5xl
                font-bold
                tracking-[-0.05em]
                text-accent-white
              "
            >
              {streak.currentStreak}
            </span>

            <span
              className="
                pb-1
                text-sm
                font-medium
                text-accent-subtle
              "
            >
              {streakLabel} streak
            </span>
          </div>

          {nextBadge ? (
            <div
              className="
                mt-8
                w-full
                max-w-xl
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                p-4
                text-left
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div
                  className="
                    flex
                    min-w-0
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-white/[0.05]
                      text-2xl
                    "
                    aria-hidden="true"
                  >
                    {nextBadge.icon}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/35">
                      Next badge
                    </p>

                    <p
                      className="
                        truncate
                        text-sm
                        font-semibold
                        text-accent-white
                      "
                    >
                      {nextBadge.name}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-accent-white">
                    {daysUntilNextBadge}
                  </p>

                  <p className="text-xs text-accent-subtle">
                    {daysUntilNextBadge === 1
                      ? 'day left'
                      : 'days left'}
                  </p>
                </div>
              </div>

              <div
                className="
                  mt-4
                  h-2
                  overflow-hidden
                  rounded-full
                  bg-white/[0.06]
                "
              >
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${progressPercentage}%`,
                  }}
                  transition={{
                    duration: 0.7,
                    delay: 0.2,
                    ease: 'easeOut',
                  }}
                  className="
                    h-full
                    rounded-full
                    bg-accent-green
                  "
                />
              </div>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                  text-[11px]
                  text-white/30
                "
              >
                <span>
                  {currentBadge.minimumDays}{' '}
                  days
                </span>

                <span>
                  {progressPercentage}%
                </span>

                <span>
                  {nextBadge.minimumDays}{' '}
                  days
                </span>
              </div>
            </div>
          ) : (
            <div
              className="
                mt-8
                rounded-2xl
                border
                border-accent-green/20
                bg-accent-green/10
                px-5
                py-4
                text-sm
                font-medium
                text-accent-green
              "
            >
              You reached the highest streak level.
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.08,
          duration: 0.4,
          ease: 'easeOut',
        }}
        className="card mb-6 p-6"
      >
        <div className="mb-6">
          <h3 className="font-semibold text-accent-white">
            Badge Journey
          </h3>

          <p className="mt-1 text-sm text-accent-subtle">
            Build your streak and unlock every
            level.
          </p>
        </div>

        <div className="space-y-3">
          {STREAK_BADGES.map(
            (badge, index) => {
              const unlocked =
                streak.currentStreak >=
                badge.minimumDays

              const isCurrent =
                badge.minimumDays ===
                currentBadge.minimumDays

              const daysRemaining =
                Math.max(
                  badge.minimumDays -
                    streak.currentStreak,
                  0,
                )

              return (
                <motion.div
                  key={badge.minimumDays}
                  initial={{
                    opacity: 0,
                    x: 8,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay:
                      0.12 +
                      index * 0.025,
                    duration: 0.3,
                    ease: 'easeOut',
                  }}
                  className={cn(
                    `
                      relative
                      flex
                      items-center
                      gap-4
                      rounded-2xl
                      border
                      p-4
                      transition
                    `,
                    isCurrent
                      ? `
                          border-accent-green/35
                          bg-accent-green/[0.08]
                        `
                      : unlocked
                        ? `
                            border-white/[0.07]
                            bg-white/[0.025]
                          `
                        : `
                            border-white/[0.05]
                            bg-white/[0.015]
                          `,
                  )}
                >
                  <div
                    className={cn(
                      `
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        text-2xl
                      `,
                      unlocked
                        ? `
                            border-white/[0.08]
                            bg-white/[0.05]
                          `
                        : `
                            border-white/[0.05]
                            bg-white/[0.02]
                            grayscale
                            opacity-40
                          `,
                    )}
                    aria-hidden="true"
                  >
                    {badge.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-2
                      "
                    >
                      <p
                        className={cn(
                          `
                            truncate
                            text-sm
                            font-semibold
                          `,
                          unlocked
                            ? 'text-accent-white'
                            : 'text-white/45',
                        )}
                      >
                        {badge.name}
                      </p>

                      {isCurrent && (
                        <span
                          className="
                            rounded-full
                            border
                            border-accent-green/20
                            bg-accent-green/10
                            px-2
                            py-0.5
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.12em]
                            text-accent-green
                          "
                        >
                          Current
                        </span>
                      )}
                    </div>

                    <p
                      className={cn(
                        `
                          mt-1
                          text-xs
                          leading-5
                        `,
                        unlocked
                          ? 'text-accent-subtle'
                          : 'text-white/25',
                      )}
                    >
                      {badge.description}
                    </p>
                  </div>

                  <div
                    className="
                      flex
                      shrink-0
                      flex-col
                      items-end
                      gap-1
                      text-right
                    "
                  >
                    <div
                      className={cn(
                        `
                          flex
                          h-7
                          w-7
                          items-center
                          justify-center
                          rounded-full
                        `,
                        unlocked
                          ? `
                              bg-accent-green/10
                              text-accent-green
                            `
                          : `
                              bg-white/[0.04]
                              text-white/25
                            `,
                      )}
                    >
                      {unlocked ? (
                        <Check size={14} />
                      ) : (
                        <Lock size={13} />
                      )}
                    </div>

                    <p
                      className={cn(
                        `
                          text-[11px]
                          font-medium
                        `,
                        unlocked
                          ? 'text-white/35'
                          : 'text-white/25',
                      )}
                    >
                      {unlocked
                        ? `${badge.minimumDays} days`
                        : `${daysRemaining} ${
                            daysRemaining === 1
                              ? 'day'
                              : 'days'
                          } left`}
                    </p>
                  </div>
                </motion.div>
              )
            },
          )}
        </div>
      </motion.section>

      <motion.section
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
      </motion.section>

      <section className="card p-6">
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
      </section>
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
  const start =
    startOfMonth(month)

  const end =
    endOfMonth(month)

  const days =
    eachDayOfInterval({
      start,
      end,
    })

  const startDay =
    start.getDay()

  return (
    <div>
      <p className="mb-2 text-xs text-accent-subtle">
        {format(
          month,
          'MMMM yyyy',
        )}
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
          const dateString =
            format(
              day,
              'yyyy-MM-dd',
            )

          const minutes =
            dailyStats[dateString]
              ?.focusMinutes ?? 0

          const intensity =
            Math.min(
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