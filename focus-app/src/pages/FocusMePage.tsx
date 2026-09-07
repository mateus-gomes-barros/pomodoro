import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays,
  CheckSquare2,
  ChevronRight,
  Clock3,
  History,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'
import {
  useNavigate,
} from 'react-router-dom'

import {
  FocusMeMonthlyPanel,
} from '@/components/focusme/FocusMeMonthlyPanel'
import {
  FocusHomeIdentityHeader,
} from '@/components/focusme/FocusHomeIdentityHeader'
import {
  FocusMeIcon,
} from '@/components/icons/FocusMeIcon'
import {
  useFocusMeWeeklyReport,
} from '@/hooks/focusme/useFocusMeWeeklyReport'

function formatMinutes(
  minutes: number,
): string {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours =
    Math.floor(minutes / 60)

  const remainingMinutes =
    minutes % 60

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}min`
    : `${hours}h`
}

export function FocusMePage() {
  const {
    t,
    i18n,
  } = useTranslation()

  const navigate = useNavigate()

  const [
    activeView,
    setActiveView,
  ] = useState<
    'week' | 'month'
  >('week')

  const reportQuery =
    useFocusMeWeeklyReport()

  const report =
    reportQuery.data

  const locale =
    i18n.resolvedLanguage === 'pt-BR'
      ? 'pt-BR'
      : 'en-US'

  const formatDay = (
    date: string,
    format: 'short' | 'long',
  ) =>
    new Intl.DateTimeFormat(
      locale,
      {
        weekday: format,
      },
    ).format(
      new Date(
        `${date}T12:00:00`,
      ),
    )

  const maxDailyMinutes =
    Math.max(
      ...(
        report?.focus.days.map(
          (day) =>
            day.focusMinutes,
        ) ?? [0]
      ),
      1,
    )

  const summaryMetrics = report
    ? [
        {
          key: 'focus',
          label: t(
            'focusMePage.weeklyReport.focusTime',
          ),
          value: formatMinutes(
            report.focus.totalMinutes,
          ),
          icon: Timer,
        },
        {
          key: 'sessions',
          label: t(
            'focusMePage.weeklyReport.sessions',
          ),
          value:
            report.focus.completedSessions,
          icon: Play,
        },
        {
          key: 'days',
          label: t(
            'focusMePage.weeklyReport.activeDays',
          ),
          value:
            report.focus.activeDays,
          icon: CalendarDays,
        },
        {
          key: 'tasks',
          label: t(
            'focusMePage.weeklyReport.tasksCompleted',
          ),
          value:
            report.tasks.completed,
          icon: CheckSquare2,
        },
      ]
    : []

  return (
    <div className="mx-auto max-w-5xl px-6 pb-12 lg:px-10 lg:pb-16">
      <FocusHomeIdentityHeader />

      <div
        className="card mb-5 grid grid-cols-2 gap-1 p-1"
        role="group"
        aria-label={t(
          'focusMePage.view.label',
        )}
      >
        {(['week', 'month'] as const).map(
          (view) => (
            <button
              key={view}
              type="button"
              onClick={() =>
                setActiveView(view)
              }
              className={
                activeView === view
                  ? 'rounded-xl bg-white/[0.08] px-3 py-2.5 text-xs font-semibold text-accent-green'
                  : 'rounded-xl px-3 py-2.5 text-xs font-medium text-accent-subtle transition hover:text-accent-white'
              }
            >
              {t(
                `focusMePage.view.${view}`,
              )}
            </button>
          ),
        )}
      </div>

      <div className="space-y-8">
        {activeView === 'week' && (
          <>
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent-green/30 bg-accent-green/[0.08] px-3 py-1 text-xs font-semibold text-accent-green">
                <FocusMeIcon size={15} />

                {t(
                  'focusMePage.weeklyReport.available',
                )}
              </span>

              <span className="text-xs text-accent-subtle">
                {t(
                  'focusMePage.weeklyReport.currentWeek',
                )}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-green">
                {t(
                  'focusMePage.weeklyReport.eyebrow',
                )}
              </p>

              <h2 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight text-accent-white sm:text-3xl">
                {t(
                  'focusMePage.weeklyReport.title',
                )}
              </h2>
            </div>

            {reportQuery.isLoading && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-24 animate-pulse rounded-2xl bg-white/[0.04]"
                    />
                  ),
                )}
              </div>
            )}

            {reportQuery.isError && (
              <p className="mt-6 rounded-xl border border-red-400/15 bg-red-400/[0.05] p-4 text-sm text-red-300">
                {t(
                  'focusMePage.weeklyReport.error',
                )}
              </p>
            )}

            {report && (
              <>
                <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {summaryMetrics.map(
                    ({
                      key,
                      label,
                      value,
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

                        <p className="mt-1 text-xs text-accent-subtle">
                          {label}
                        </p>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-7 border-t border-white/[0.06] pt-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-accent-white">
                      {t(
                        'focusMePage.weeklyReport.dailyRhythm',
                      )}
                    </h3>

                    {report.focus.bestDay && (
                      <p className="text-xs text-accent-subtle">
                        {t(
                          'focusMePage.weeklyReport.bestDay',
                        )}
                        {': '}
                        <span className="font-medium text-accent-green">
                          {formatDay(
                            report.focus.bestDay.date,
                            'long',
                          )}
                        </span>
                      </p>
                    )}
                  </div>

                  {report.focus.totalMinutes > 0 ? (
                    <div className="mt-5 grid h-32 grid-cols-7 items-end gap-2 sm:gap-3">
                      {report.focus.days.map(
                        (day) => {
                          const height =
                            day.focusMinutes > 0
                              ? Math.max(
                                  10,
                                  (
                                    day.focusMinutes /
                                    maxDailyMinutes
                                  ) * 100,
                                )
                              : 3

                          return (
                            <div
                              key={day.date}
                              className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
                            >
                              <span className="hidden text-[10px] text-accent-subtle sm:block">
                                {day.focusMinutes > 0
                                  ? formatMinutes(
                                      day.focusMinutes,
                                    )
                                  : ''}
                              </span>

                              <div className="flex h-20 w-full items-end justify-center">
                                <div
                                  className="w-full max-w-8 rounded-t-lg bg-gradient-to-t from-emerald-500/55 to-emerald-300 transition-all"
                                  style={{
                                    height: `${height}%`,
                                  }}
                                />
                              </div>

                              <span className="text-[10px] font-medium uppercase text-accent-subtle">
                                {formatDay(
                                  day.date,
                                  'short',
                                ).slice(0, 3)}
                              </span>
                            </div>
                          )
                        },
                      )}
                    </div>
                  ) : (
                    <p className="mt-5 rounded-xl bg-white/[0.025] p-4 text-sm leading-relaxed text-accent-subtle">
                      {t(
                        'focusMePage.weeklyReport.noFocus',
                      )}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.section>

        {report && (
          <section className="grid gap-3 md:grid-cols-2">
            <motion.article
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green">
                  <CheckSquare2
                    size={18}
                  />
                </div>

                <h2 className="text-sm font-semibold text-accent-white">
                  {t(
                    'focusMePage.weeklyReport.tasksTitle',
                  )}
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.025] p-4">
                  <p className="text-xl font-semibold text-accent-white">
                    {report.tasks.created}
                  </p>

                  <p className="mt-1 text-xs text-accent-subtle">
                    {t(
                      'focusMePage.weeklyReport.created',
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-white/[0.025] p-4">
                  <p className="text-xl font-semibold text-accent-green">
                    {report.tasks.completed}
                  </p>

                  <p className="mt-1 text-xs text-accent-subtle">
                    {t(
                      'focusMePage.weeklyReport.completed',
                    )}
                  </p>
                </div>
              </div>
            </motion.article>

            <motion.article
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.045] text-accent-white">
                  <RotateCcw
                    size={18}
                  />
                </div>

                <h2 className="text-sm font-semibold text-accent-white">
                  {t(
                    'focusMePage.weeklyReport.rhythmTitle',
                  )}
                </h2>
              </div>

              <div className="mt-5 grid grid-cols-4 gap-2 text-center">
                {[
                  {
                    label: t(
                      'focusMePage.weeklyReport.starts',
                    ),
                    value:
                      report.rhythm.starts,
                    icon: Play,
                  },
                  {
                    label: t(
                      'focusMePage.weeklyReport.pauses',
                    ),
                    value:
                      report.rhythm.pauses,
                    icon: Pause,
                  },
                  {
                    label: t(
                      'focusMePage.weeklyReport.resumes',
                    ),
                    value:
                      report.rhythm.resumes,
                    icon: RotateCcw,
                  },
                  {
                    label: t(
                      'focusMePage.weeklyReport.abandoned',
                    ),
                    value:
                      report.rhythm.abandoned,
                    icon: Clock3,
                  },
                ].map(
                  ({
                    label,
                    value,
                    icon: Icon,
                  }) => (
                    <div
                      key={label}
                      className="min-w-0"
                    >
                      <Icon
                        size={14}
                        className="mx-auto text-accent-green"
                      />

                      <p className="mt-2 text-base font-semibold text-accent-white">
                        {value}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-accent-subtle">
                        {label}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </motion.article>

            <motion.article
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="card p-5 md:col-span-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green">
                  <Sparkles size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-accent-subtle">
                    {t(
                      'focusMePage.weeklyReport.topProject',
                    )}
                  </p>

                  {report.projects.topProject ? (
                    <p className="mt-1 truncate text-sm font-semibold text-accent-white">
                      {
                        report.projects
                          .topProject.emoji
                      }{' '}
                      {
                        report.projects
                          .topProject.name
                      }
                      {' · '}
                      {formatMinutes(
                        report.projects
                          .topProject
                          .focusMinutes,
                      )}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-accent-subtle">
                      {t(
                        'focusMePage.weeklyReport.noProject',
                      )}
                    </p>
                  )}
                </div>
              </div>
            </motion.article>
          </section>
        )}

          </>
        )}

        {activeView === 'month' && (
          <FocusMeMonthlyPanel />
        )}

        <motion.button
          type="button"
          onClick={() =>
            navigate('/focusme/history')
          }
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="card flex w-full items-center gap-4 p-5 text-left transition hover:border-accent-green/20 hover:bg-accent-green/[0.025]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green">
            <History size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-accent-white">
              {t(
                'focusMePage.weeklyReport.historyTitle',
              )}
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-accent-subtle">
              {t(
                'focusMePage.weeklyReport.historyDescription',
              )}
            </p>
          </div>

          <ChevronRight
            size={18}
            className="shrink-0 text-accent-subtle"
          />
        </motion.button>
      </div>
    </div>
  )
}
