import { motion } from 'framer-motion'
import {
  BarChart3,
  CalendarDays,
  CheckSquare2,
  Clock3,
  FolderOpen,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'

import {
  useFocusMeMonthlyReport,
} from '@/hooks/focusme/useFocusMeMonthlyReport'
import {
  evaluateFocusHomeEligibility,
} from '@/services/focusMeEligibility'

function formatMinutes(
  minutes: number,
): string {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours =
    Math.floor(minutes / 60)

  const remainder =
    minutes % 60

  return remainder > 0
    ? `${hours}h ${remainder}min`
    : `${hours}h`
}

interface ComparisonProps {
  value: number | null
}

function Comparison({
  value,
}: ComparisonProps) {
  const { t } = useTranslation()

  if (value === null) {
    return (
      <span className="text-[10px] text-accent-subtle">
        {t(
          'focusMePage.monthlyReport.noComparison',
        )}
      </span>
    )
  }

  const positive = value >= 0
  const Icon = positive
    ? TrendingUp
    : TrendingDown

  return (
    <span
      className={
        positive
          ? 'inline-flex items-center gap-1 text-[10px] text-accent-green'
          : 'inline-flex items-center gap-1 text-[10px] text-orange-300'
      }
    >
      <Icon size={12} />
      {value > 0 ? '+' : ''}
      {value}%
    </span>
  )
}

export function FocusMeMonthlyPanel() {
  const {
    t,
    i18n,
  } = useTranslation()

  const reportQuery =
    useFocusMeMonthlyReport()

  const report =
    reportQuery.data

  const locale =
    i18n.resolvedLanguage === 'pt-BR'
      ? 'pt-BR'
      : 'en-US'

  if (reportQuery.isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="card h-32 animate-pulse bg-white/[0.025]"
            />
          ),
        )}
      </div>
    )
  }

  if (
    reportQuery.isError ||
    !report
  ) {
    return (
      <div className="card p-5 text-sm text-red-300">
        {t(
          'focusMePage.monthlyReport.error',
        )}
      </div>
    )
  }

  const monthName =
    new Intl.DateTimeFormat(
      locale,
      {
        month: 'long',
        year: 'numeric',
      },
    ).format(
      new Date(
        `${report.period.start}T12:00:00`,
      ),
    )

  const current =
    report.current

  const eligibility =
    evaluateFocusHomeEligibility(
      current,
    )

  const maxWeekMinutes =
    Math.max(
      ...current.weeks.map(
        (week) =>
          week.focusMinutes,
      ),
      1,
    )

  const maxTimeBlock =
    Math.max(
      ...Object.values(
        current.timeBlocks,
      ),
      1,
    )

  const metrics = [
    {
      key: 'focus',
      label: t(
        'focusMePage.monthlyReport.focusTime',
      ),
      value: formatMinutes(
        current.focusMinutes,
      ),
      comparison:
        report.comparison
          .focusMinutesPercent,
      icon: Timer,
    },
    {
      key: 'sessions',
      label: t(
        'focusMePage.monthlyReport.sessions',
      ),
      value:
        current.completedSessions,
      comparison:
        report.comparison
          .sessionsPercent,
      icon: Clock3,
    },
    {
      key: 'days',
      label: t(
        'focusMePage.monthlyReport.activeDays',
      ),
      value: current.activeDays,
      comparison:
        report.comparison
          .activeDaysPercent,
      icon: CalendarDays,
    },
    {
      key: 'tasks',
      label: t(
        'focusMePage.monthlyReport.tasksCompleted',
      ),
      value:
        current.tasks.completed,
      comparison:
        report.comparison
          .tasksCompletedPercent,
      icon: CheckSquare2,
    },
  ]

  const timeBlocks = [
    'morning',
    'afternoon',
    'evening',
    'late_night',
  ] as const

  return (
    <div className="space-y-4">
      <motion.section
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="card relative overflow-hidden p-5 sm:p-7"
      >
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-accent-green/[0.08] blur-3xl" />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-green">
            {t(
              'focusMePage.monthlyReport.eyebrow',
            )}
          </p>

          <h2 className="mt-2 text-2xl font-semibold capitalize text-accent-white sm:text-3xl">
            {monthName}
          </h2>

          <p className="mt-2 text-sm text-accent-subtle">
            {t(
              'focusMePage.monthlyReport.description',
            )}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {metrics.map(
              ({
                key,
                label,
                value,
                comparison,
                icon: Icon,
              }) => (
                <div
                  key={key}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                >
                  <Icon
                    size={17}
                    className="text-accent-green"
                  />

                  <p className="mt-4 text-xl font-semibold text-accent-white">
                    {value}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center justify-between gap-1">
                    <p className="text-xs text-accent-subtle">
                      {label}
                    </p>

                    <Comparison
                      value={comparison}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="card p-5"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg
              viewBox="0 0 80 80"
              className="h-20 w-20 -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                className="text-white/[0.05]"
              />

              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={
                  100 -
                  eligibility.progress
                }
                className="text-accent-green transition-all duration-500"
              />
            </svg>

            <span className="absolute text-sm font-semibold text-accent-white">
              {eligibility.progress}%
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-green">
              FocushoMe
            </p>

            <h3 className="mt-2 text-base font-semibold text-accent-white">
              {t(
                `focusMePage.monthlyReport.eligibility.${eligibility.state}.title`,
              )}
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-accent-subtle">
              {t(
                `focusMePage.monthlyReport.eligibility.${eligibility.state}.description`,
              )}
            </p>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-accent-green transition-all duration-500"
                style={{
                  width:
                    `${eligibility.progress}%`,
                }}
              />
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-4 lg:grid-cols-2">
        <motion.section
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="card p-5"
        >
          <div className="flex items-center gap-3">
            <BarChart3
              size={18}
              className="text-accent-green"
            />

            <h3 className="text-sm font-semibold text-accent-white">
              {t(
                'focusMePage.monthlyReport.weeklyEvolution',
              )}
            </h3>
          </div>

          {current.weeks.length > 0 ? (
            <div className="mt-6 grid h-36 grid-cols-5 items-end gap-3">
              {[1, 2, 3, 4, 5].map(
                (weekNumber) => {
                  const week =
                    current.weeks.find(
                      (item) =>
                        item.week ===
                        weekNumber,
                    )

                  const minutes =
                    week?.focusMinutes ?? 0

                  const height =
                    minutes > 0
                      ? Math.max(
                          8,
                          (
                            minutes /
                            maxWeekMinutes
                          ) * 100,
                        )
                      : 3

                  return (
                    <div
                      key={weekNumber}
                      className="flex h-full flex-col items-center justify-end gap-2"
                    >
                      <span className="hidden text-[10px] text-accent-subtle sm:block">
                        {minutes > 0
                          ? formatMinutes(
                              minutes,
                            )
                          : ''}
                      </span>

                      <div className="flex h-24 w-full items-end justify-center">
                        <div
                          className="w-full max-w-9 rounded-t-lg bg-gradient-to-t from-emerald-500/55 to-emerald-300"
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      </div>

                      <span className="text-[10px] text-accent-subtle">
                        {t(
                          'focusMePage.monthlyReport.week',
                          {
                            number:
                              weekNumber,
                          },
                        )}
                      </span>
                    </div>
                  )
                },
              )}
            </div>
          ) : (
            <p className="mt-5 text-sm text-accent-subtle">
              {t(
                'focusMePage.monthlyReport.noFocus',
              )}
            </p>
          )}
        </motion.section>

        <motion.section
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="card p-5"
        >
          <div className="flex items-center gap-3">
            <Clock3
              size={18}
              className="text-accent-green"
            />

            <h3 className="text-sm font-semibold text-accent-white">
              {t(
                'focusMePage.monthlyReport.timeDistribution',
              )}
            </h3>
          </div>

          <div className="mt-6 space-y-4">
            {timeBlocks.map(
              (block) => {
                const minutes =
                  current.timeBlocks[
                    block
                  ]

                const width =
                  (
                    minutes /
                    maxTimeBlock
                  ) * 100

                return (
                  <div key={block}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-accent-subtle">
                        {t(
                          `focusMePage.monthlyReport.timeBlocks.${block}`,
                        )}
                      </span>

                      <span className="text-xs font-medium text-accent-white">
                        {formatMinutes(
                          minutes,
                        )}
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-accent-green"
                        style={{
                          width: `${width}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              },
            )}
          </div>
        </motion.section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="card p-5">
          <CheckSquare2
            size={18}
            className="text-accent-green"
          />

          <h3 className="mt-4 text-sm font-semibold text-accent-white">
            {t(
              'focusMePage.monthlyReport.tasks',
            )}
          </h3>

          <p className="mt-3 text-2xl font-semibold text-accent-white">
            {current.tasks.completed}
            <span className="ml-2 text-xs font-normal text-accent-subtle">
              /
              {' '}
              {current.tasks.created}
              {' '}
              {t(
                'focusMePage.monthlyReport.created',
              )}
            </span>
          </p>
        </section>

        <section className="card p-5">
          <FolderOpen
            size={18}
            className="text-accent-green"
          />

          <h3 className="mt-4 text-sm font-semibold text-accent-white">
            {t(
              'focusMePage.monthlyReport.projects',
            )}
          </h3>

          <p className="mt-3 text-2xl font-semibold text-accent-white">
            {current.projects.completed}
            <span className="ml-2 text-xs font-normal text-accent-subtle">
              {t(
                'focusMePage.monthlyReport.completed',
              )}
            </span>
          </p>
        </section>

        <section className="card p-5">
          <Target
            size={18}
            className="text-accent-green"
          />

          <h3 className="mt-4 text-sm font-semibold text-accent-white">
            {t(
              'focusMePage.monthlyReport.goals',
            )}
          </h3>

          <p className="mt-3 text-2xl font-semibold text-accent-white">
            {current.goals.completed}
            <span className="ml-2 text-xs font-normal text-accent-subtle">
              {t(
                'focusMePage.monthlyReport.completed',
              )}
            </span>
          </p>
        </section>
      </div>

      {current.projects.topProjects.length > 0 && (
        <section className="card p-5">
          <h3 className="text-sm font-semibold text-accent-white">
            {t(
              'focusMePage.monthlyReport.topProjects',
            )}
          </h3>

          <div className="mt-4 space-y-3">
            {current.projects.topProjects.map(
              (project, index) => (
                <div
                  key={project.id}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.025] p-3"
                >
                  <span className="w-5 text-xs text-accent-subtle">
                    {index + 1}
                  </span>

                  <span className="text-lg">
                    {project.emoji}
                  </span>

                  <span className="min-w-0 flex-1 truncate text-sm text-accent-white">
                    {project.name}
                  </span>

                  <span className="text-xs font-medium text-accent-green">
                    {formatMinutes(
                      project.focusMinutes,
                    )}
                  </span>
                </div>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  )
}
