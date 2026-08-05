import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
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

const BADGES_PER_PAGE = 4

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

    if (!activeDateSet.has(dateString)) {
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

function chunkBadges() {
  return Array.from(
    {
      length: Math.ceil(
        STREAK_BADGES.length /
          BADGES_PER_PAGE,
      ),
    },
    (_, pageIndex) =>
      STREAK_BADGES.slice(
        pageIndex *
          BADGES_PER_PAGE,
        pageIndex *
          BADGES_PER_PAGE +
          BADGES_PER_PAGE,
      ),
  )
}

export function StreaksPage() {
  const carouselRef =
    useRef<HTMLDivElement>(null)

  const [
    activeBadgePage,
    setActiveBadgePage,
  ] = useState(0)

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

  const badgePages = useMemo(
    () => chunkBadges(),
    [],
  )

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

  const currentBadgeIndex =
    STREAK_BADGES.findIndex(
      (badge) =>
        badge.minimumDays ===
        currentBadge.minimumDays,
    )

  const currentBadgePage =
    Math.floor(
      Math.max(
        currentBadgeIndex,
        0,
      ) / BADGES_PER_PAGE,
    )

  const isLoading =
    isAnalyticsLoading ||
    sessionsQuery.isLoading

  const isError =
    isAnalyticsError ||
    sessionsQuery.isError

  const error =
    analyticsError ??
    sessionsQuery.error

  useEffect(() => {
    const carousel =
      carouselRef.current

    if (!carousel || isLoading) {
      return
    }

    setActiveBadgePage(
      currentBadgePage,
    )

    carousel.scrollTo({
      left:
        currentBadgePage *
        carousel.clientWidth,
      behavior: 'auto',
    })
  }, [
    currentBadgePage,
    isLoading,
  ])

  function goToBadgePage(
    pageIndex: number,
  ) {
    const carousel =
      carouselRef.current

    if (!carousel) {
      return
    }

    const safePageIndex = Math.max(
      0,
      Math.min(
        pageIndex,
        badgePages.length - 1,
      ),
    )

    carousel.scrollTo({
      left:
        safePageIndex *
        carousel.clientWidth,
      behavior: 'smooth',
    })

    setActiveBadgePage(
      safePageIndex,
    )
  }

  function handleCarouselScroll() {
    const carousel =
      carouselRef.current

    if (
      !carousel ||
      carousel.clientWidth === 0
    ) {
      return
    }

    const nextPage = Math.round(
      carousel.scrollLeft /
        carousel.clientWidth,
    )

    setActiveBadgePage(
      Math.max(
        0,
        Math.min(
          nextPage,
          badgePages.length - 1,
        ),
      ),
    )
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 pb-6 lg:px-10 lg:pb-10">
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
      <div className="mx-auto max-w-4xl px-6 pb-6 lg:px-10 lg:pb-10">
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
    <div className="mx-auto max-w-4xl px-6 pb-6 lg:px-10 lg:pb-10">
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
        className="card relative mb-6 overflow-hidden p-6 sm:p-8"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.04] blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col items-center text-center">
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
            className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/[0.08] bg-white/[0.045] text-6xl shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
            aria-hidden="true"
          >
            {currentBadge.icon}
          </motion.div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
            Current badge
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-accent-white sm:text-3xl">
            {currentBadge.name}
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-accent-subtle">
            {currentBadge.description}
          </p>

          <div className="mt-6 flex items-end gap-2">
            <span className="text-5xl font-bold tracking-[-0.05em] text-accent-white">
              {streak.currentStreak}
            </span>

            <span className="pb-1 text-sm font-medium text-accent-subtle">
              {streakLabel} streak
            </span>
          </div>

          {nextBadge ? (
            <div className="mt-8 w-full max-w-xl rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.05] text-2xl"
                    aria-hidden="true"
                  >
                    {nextBadge.icon}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/35">
                      Next badge
                    </p>

                    <p className="truncate text-sm font-semibold text-accent-white">
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

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
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
                  className="h-full rounded-full bg-accent-green"
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-[11px] text-white/30">
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
            <div className="mt-8 rounded-2xl border border-accent-green/20 bg-accent-green/10 px-5 py-4 text-sm font-medium text-accent-green">
              You reached the highest streak level.
            </div>
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

      <section className="card mb-6 p-6">
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
          delay: 0.15,
          duration: 0.4,
          ease: 'easeOut',
        }}
        className="card overflow-hidden p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-accent-white">
              Badge Journey
            </h3>

            <p className="mt-1 text-sm text-accent-subtle">
              Swipe to explore every streak level.
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() =>
                goToBadgePage(
                  activeBadgePage - 1,
                )
              }
              disabled={
                activeBadgePage === 0
              }
              aria-label="Previous badge page"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/50 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() =>
                goToBadgePage(
                  activeBadgePage + 1,
                )
              }
              disabled={
                activeBadgePage ===
                badgePages.length - 1
              }
              aria-label="Next badge page"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/50 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {badgePages.map(
            (badgePage, pageIndex) => (
              <div
                key={`badge-page-${pageIndex}`}
                className="grid min-w-full snap-center grid-cols-2 gap-3 sm:grid-cols-4"
              >
                {badgePage.map(
                  (badge) => {
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
                      <div
                        key={
                          badge.minimumDays
                        }
                        className={cn(
                          'relative flex min-h-48 flex-col items-center justify-between rounded-2xl border p-4 text-center transition',
                          isCurrent
                            ? 'border-accent-green/40 bg-accent-green/[0.08]'
                            : unlocked
                              ? 'border-white/[0.08] bg-white/[0.025]'
                              : 'border-white/[0.05] bg-white/[0.015]',
                        )}
                      >
                        {isCurrent && (
                          <span className="absolute right-2.5 top-2.5 rounded-full border border-accent-green/20 bg-accent-green/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-accent-green">
                            Current
                          </span>
                        )}

                        <div
                          className={cn(
                            'mt-3 flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl',
                            unlocked
                              ? 'border-white/[0.08] bg-white/[0.05]'
                              : 'border-white/[0.05] bg-white/[0.02] grayscale opacity-40',
                          )}
                          aria-hidden="true"
                        >
                          {badge.icon}
                        </div>

                        <div className="mt-4 min-w-0">
                          <p
                            className={cn(
                              'truncate text-sm font-semibold',
                              unlocked
                                ? 'text-accent-white'
                                : 'text-white/45',
                            )}
                          >
                            {badge.name}
                          </p>

                          <p
                            className={cn(
                              'mt-1 line-clamp-2 text-[11px] leading-4',
                              unlocked
                                ? 'text-accent-subtle'
                                : 'text-white/25',
                            )}
                          >
                            {badge.description}
                          </p>
                        </div>

                        <div className="mt-4 flex flex-col items-center gap-2">
                          <div
                            className={cn(
                              'flex h-7 w-7 items-center justify-center rounded-full',
                              unlocked
                                ? 'bg-accent-green/10 text-accent-green'
                                : 'bg-white/[0.04] text-white/25',
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
                              'text-[11px] font-medium',
                              unlocked
                                ? 'text-white/35'
                                : 'text-white/25',
                            )}
                          >
                            {unlocked
                              ? `${badge.minimumDays} days`
                              : `${daysRemaining} ${
                                  daysRemaining ===
                                  1
                                    ? 'day'
                                    : 'days'
                                } left`}
                          </p>
                        </div>
                      </div>
                    )
                  },
                )}
              </div>
            ),
          )}
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() =>
              goToBadgePage(
                activeBadgePage - 1,
              )
            }
            disabled={
              activeBadgePage === 0
            }
            aria-label="Previous badge page"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/50 transition disabled:cursor-not-allowed disabled:opacity-25 sm:hidden"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="flex flex-1 items-center justify-center gap-2">
            {badgePages.map(
              (_, pageIndex) => (
                <button
                  key={`badge-dot-${pageIndex}`}
                  type="button"
                  onClick={() =>
                    goToBadgePage(
                      pageIndex,
                    )
                  }
                  aria-label={`Go to badge page ${
                    pageIndex + 1
                  }`}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    activeBadgePage ===
                      pageIndex
                      ? 'w-6 bg-accent-green'
                      : 'w-1.5 bg-white/15 hover:bg-white/30',
                  )}
                />
              ),
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              goToBadgePage(
                activeBadgePage + 1,
              )
            }
            disabled={
              activeBadgePage ===
              badgePages.length - 1
            }
            aria-label="Next badge page"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/50 transition disabled:cursor-not-allowed disabled:opacity-25 sm:hidden"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] font-medium text-white/25">
          Page {activeBadgePage + 1} of{' '}
          {badgePages.length}
        </p>
      </motion.section>
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