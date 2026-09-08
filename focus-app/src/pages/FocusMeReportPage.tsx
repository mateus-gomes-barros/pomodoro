import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckSquare2,
  FolderOpen,
  LoaderCircle,
  Play,
  Target,
  Timer,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  FocusMeMonthlyNarrativeSection,
} from '@/components/focusme/FocusMeMonthlyNarrativeSection'
import {
  FocusMeWeeklyNarrativeCard,
} from '@/components/focusme/FocusMeWeeklyNarrativeCard'
import {
  FocusMeIcon,
} from '@/components/icons/FocusMeIcon'
import {
  PageHeader,
} from '@/components/ui/PageHeader'
import {
  useFocusMeReport,
} from '@/hooks/focusme/useFocusMeReports'
import type {
  FocusMeMonthlyReport,
} from '@/services/focusMeMonthlyService'
import type {
  FocusMeWeeklyReport,
} from '@/services/focusMeService'

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

export function FocusMeReportPage() {
  const {
    t,
    i18n,
  } = useTranslation()

  const navigate = useNavigate()

  const {
    reportId,
  } = useParams<{
    reportId: string
  }>()

  const reportQuery =
    useFocusMeReport(reportId)

  const report =
    reportQuery.data

  const locale =
    i18n.resolvedLanguage === 'pt-BR'
      ? 'pt-BR'
      : 'en-US'




  function formatPeriod(
    startValue: string,
    endValue: string,
    type: 'weekly' | 'monthly',
  ): string {
    const start = new Date(
      `${startValue}T12:00:00`,
    )

    const end = new Date(
      `${endValue}T12:00:00`,
    )

    end.setDate(
      end.getDate() - 1,
    )

    if (type === 'monthly') {
      return new Intl.DateTimeFormat(
        locale,
        {
          month: 'long',
          year: 'numeric',
        },
      ).format(start)
    }

    const formatter =
      new Intl.DateTimeFormat(
        locale,
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        },
      )

    return (
      `${formatter.format(start)} – ` +
      formatter.format(end)
    )
  }

  if (reportQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoaderCircle
          size={30}
          className="animate-spin text-accent-green"
        />
      </div>
    )
  }

  if (
    reportQuery.isError ||
    !report
  ) {
    return (
      <div className="mx-auto max-w-4xl px-6 pb-12 lg:px-10">
        <button
          type="button"
          onClick={() =>
            navigate(
              '/focusme/history',
            )
          }
          className="mb-5 flex items-center gap-2 text-sm text-accent-subtle transition hover:text-accent-white"
        >
          <ArrowLeft size={17} />

          {t(
            'focusMeReportPage.back',
          )}
        </button>

        <div className="card p-6 text-sm text-red-300">
          {t(
            'focusMeReportPage.error',
          )}
        </div>
      </div>
    )
  }

  const isWeekly =
    report.type === 'weekly'

  const weekly = isWeekly
    ? report.metrics as
        FocusMeWeeklyReport
    : null

  const monthly = !isWeekly
    ? report.metrics as
        FocusMeMonthlyReport
    : null

  const focusMinutes =
    weekly
      ? weekly.focus.totalMinutes
      : monthly?.current
          .focusMinutes ?? 0

  const sessions =
    weekly
      ? weekly.focus
          .completedSessions
      : monthly?.current
          .completedSessions ?? 0

  const activeDays =
    weekly
      ? weekly.focus.activeDays
      : monthly?.current
          .activeDays ?? 0

  const tasksCreated =
    weekly
      ? weekly.tasks.created
      : monthly?.current.tasks
          .created ?? 0

  const tasksCompleted =
    weekly
      ? weekly.tasks.completed
      : monthly?.current.tasks
          .completed ?? 0

  const projectsCreated =
    weekly
      ? weekly.projects.created
      : monthly?.current.projects
          .created ?? 0

  const projectsCompleted =
    weekly
      ? weekly.projects.completed
      : monthly?.current.projects
          .completed ?? 0

  const goalsCreated =
    weekly
      ? weekly.goals.created
      : monthly?.current.goals
          .created ?? 0

  const goalsCompleted =
    weekly
      ? weekly.goals.completed
      : monthly?.current.goals
          .completed ?? 0

  const graphItems = weekly
    ? weekly.focus.days.map(
        (day, index) => ({
          key: day.date,
          label:
            new Intl.DateTimeFormat(
              locale,
              {
                weekday: 'short',
              },
            )
              .format(
                new Date(
                  `${day.date}T12:00:00`,
                ),
              )
              .slice(0, 3),
          minutes:
            day.focusMinutes,
          order: index + 1,
        }),
      )
    : (
        monthly?.current.weeks ??
        []
      ).map((week) => ({
        key: String(week.week),
        label: t(
          'focusMeReportPage.week',
          {
            number: week.week,
          },
        ),
        minutes:
          week.focusMinutes,
        order: week.week,
      }))

  const maxGraphMinutes =
    Math.max(
      ...graphItems.map(
        (item) => item.minutes,
      ),
      1,
    )

  const topProject =
    weekly
      ? weekly.projects.topProject
      : monthly?.current.projects
          .topProjects[0] ?? null

  const summaryItems = [
    {
      key: 'focus',
      label: t(
        'focusMeReportPage.focusTime',
      ),
      value:
        formatMinutes(focusMinutes),
      icon: Timer,
    },
    {
      key: 'sessions',
      label: t(
        'focusMeReportPage.sessions',
      ),
      value: sessions,
      icon: Play,
    },
    {
      key: 'days',
      label: t(
        'focusMeReportPage.activeDays',
      ),
      value: activeDays,
      icon: CalendarDays,
    },
    {
      key: 'tasks',
      label: t(
        'focusMeReportPage.tasksCompleted',
      ),
      value: tasksCompleted,
      icon: CheckSquare2,
    },
  ]

  return (
    <div className="mx-auto max-w-5xl px-6 pb-12 lg:px-10 lg:pb-16">
      <button
        type="button"
        onClick={() =>
          navigate('/focusme/history')
        }
        className="mb-5 flex items-center gap-2 text-sm text-accent-subtle transition hover:text-accent-white"
      >
        <ArrowLeft size={17} />

        {t(
          'focusMeReportPage.back',
        )}
      </button>

      <PageHeader
        title={formatPeriod(
          report.periodStart,
          report.periodEnd,
          report.type,
        )}
        subtitle={t(
          `focusMeReportPage.types.${report.type}`,
        )}
      />

      <div className="space-y-4">
        <section className="card relative overflow-hidden p-5 sm:p-7">
          <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-accent-green/[0.08] blur-3xl" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
                <FocusMeIcon
                  size={25}
                />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-green">
                  FocusMe
                </p>

                <p className="mt-1 text-xs text-accent-subtle">
                  {t(
                    'focusMeReportPage.preserved',
                  )}
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {summaryItems.map(
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
          </div>
        </section>

        <section className="card p-5">
          <div className="flex items-center gap-3">
            <BarChart3
              size={18}
              className="text-accent-green"
            />

            <h2 className="text-sm font-semibold text-accent-white">
              {isWeekly
                ? t(
                    'focusMeReportPage.dailyEvolution',
                  )
                : t(
                    'focusMeReportPage.weeklyEvolution',
                  )}
            </h2>
          </div>

          {graphItems.length > 0 ? (
            <div
              className="mt-6 grid h-40 items-end gap-2"
              style={{
                gridTemplateColumns:
                  `repeat(${graphItems.length}, minmax(0, 1fr))`,
              }}
            >
              {graphItems.map(
                (item) => {
                  const height =
                    item.minutes > 0
                      ? Math.max(
                          8,
                          (
                            item.minutes /
                            maxGraphMinutes
                          ) * 100,
                        )
                      : 3

                  return (
                    <div
                      key={item.key}
                      className="flex h-full min-w-0 flex-col items-center justify-end gap-2"
                    >
                      <span className="hidden text-[10px] text-accent-subtle sm:block">
                        {item.minutes > 0
                          ? formatMinutes(
                              item.minutes,
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

                      <span className="truncate text-[10px] capitalize text-accent-subtle">
                        {item.label}
                      </span>
                    </div>
                  )
                },
              )}
            </div>
          ) : (
            <p className="mt-5 text-sm text-accent-subtle">
              {t(
                'focusMeReportPage.noFocus',
              )}
            </p>
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <section className="card p-5">
            <CheckSquare2
              size={18}
              className="text-accent-green"
            />

            <h2 className="mt-4 text-sm font-semibold text-accent-white">
              {t(
                'focusMeReportPage.tasks',
              )}
            </h2>

            <p className="mt-3 text-xl font-semibold text-accent-white">
              {tasksCompleted}
              <span className="ml-2 text-xs font-normal text-accent-subtle">
                /
                {' '}
                {tasksCreated}
              </span>
            </p>
          </section>

          <section className="card p-5">
            <FolderOpen
              size={18}
              className="text-accent-green"
            />

            <h2 className="mt-4 text-sm font-semibold text-accent-white">
              {t(
                'focusMeReportPage.projects',
              )}
            </h2>

            <p className="mt-3 text-xl font-semibold text-accent-white">
              {projectsCompleted}
              <span className="ml-2 text-xs font-normal text-accent-subtle">
                /
                {' '}
                {projectsCreated}
              </span>
            </p>
          </section>

          <section className="card p-5">
            <Target
              size={18}
              className="text-accent-green"
            />

            <h2 className="mt-4 text-sm font-semibold text-accent-white">
              {t(
                'focusMeReportPage.goals',
              )}
            </h2>

            <p className="mt-3 text-xl font-semibold text-accent-white">
              {goalsCompleted}
              <span className="ml-2 text-xs font-normal text-accent-subtle">
                /
                {' '}
                {goalsCreated}
              </span>
            </p>
          </section>
        </div>

        {topProject && (
          <section className="card p-5">
            <p className="text-xs text-accent-subtle">
              {t(
                'focusMeReportPage.topProject',
              )}
            </p>

            <p className="mt-2 text-sm font-semibold text-accent-white">
              {topProject.emoji}
              {' '}
              {topProject.name}
              {' · '}
              {formatMinutes(
                topProject.focusMinutes,
              )}
            </p>
          </section>
        )}

        {!isWeekly && monthly && (
          <FocusMeMonthlyNarrativeSection
            storedReport={report}
            report={monthly}
          />
        )}

        {isWeekly && weekly && (
          <FocusMeWeeklyNarrativeCard
            report={weekly}
          />
        )}


      </div>
    </div>
  )
}
