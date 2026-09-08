import {
  useState,
} from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  ChevronRight,
  History,
  LoaderCircle,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'
import {
  useNavigate,
} from 'react-router-dom'

import {
  FocusHomeJourney,
} from '@/components/focusme/FocusHomeJourney'
import {
  PageHeader,
} from '@/components/ui/PageHeader'
import {
  useFocusMeReports,
} from '@/hooks/focusme/useFocusMeReports'
import type {
  FocusMeMonthlyReport,
} from '@/services/focusMeMonthlyService'
import type {
  FocusMeStoredReport,
} from '@/services/focusMeReportsService'
import type {
  FocusMeWeeklyReport,
} from '@/services/focusMeService'

type ReportFilter =
  | 'all'
  | 'weekly'
  | 'monthly'

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

function getReportSummary(
  report: FocusMeStoredReport,
) {
  if (report.type === 'weekly') {
    const metrics =
      report.metrics as
        FocusMeWeeklyReport

    return {
      minutes:
        metrics.focus.totalMinutes,
      sessions:
        metrics.focus
          .completedSessions,
      tasks:
        metrics.tasks.completed,
    }
  }

  const metrics =
    report.metrics as
      FocusMeMonthlyReport

  return {
    minutes:
      metrics.current.focusMinutes,
    sessions:
      metrics.current
        .completedSessions,
    tasks:
      metrics.current.tasks
        .completed,
  }
}

export function FocusMeHistoryPage() {
  const {
    t,
    i18n,
  } = useTranslation()

  const navigate = useNavigate()

  const [
    filter,
    setFilter,
  ] = useState<ReportFilter>('all')

  const reportsQuery =
    useFocusMeReports()

  const reports =
    reportsQuery.data ?? []

  const visibleReports =
    filter === 'all'
      ? reports
      : reports.filter(
          (report) =>
            report.type === filter,
        )

  const locale =
    i18n.resolvedLanguage === 'pt-BR'
      ? 'pt-BR'
      : 'en-US'

  function formatPeriod(
    report: FocusMeStoredReport,
  ): string {
    const start = new Date(
      `${report.periodStart}T12:00:00`,
    )

    const end = new Date(
      `${report.periodEnd}T12:00:00`,
    )

    end.setDate(
      end.getDate() - 1,
    )

    if (report.type === 'monthly') {
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
        },
      )

    return (
      `${formatter.format(start)} – ` +
      formatter.format(end)
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pb-12 lg:px-10 lg:pb-16">
      <button
        type="button"
        onClick={() =>
          navigate('/focusme')
        }
        className="mb-5 flex items-center gap-2 text-sm text-accent-subtle transition-colors hover:text-accent-white"
      >
        <ArrowLeft size={17} />

        {t(
          'focusMeHistoryPage.back',
        )}
      </button>

      <PageHeader
        title={t(
          'focusMeHistoryPage.title',
        )}
        subtitle={t(
          'focusMeHistoryPage.subtitle',
        )}
      />

      <FocusHomeJourney />

      <div
        className="card mb-5 grid grid-cols-3 gap-1 p-1"
        role="group"
        aria-label={t(
          'focusMeHistoryPage.filterLabel',
        )}
      >
        {(
          [
            'all',
            'weekly',
            'monthly',
          ] as ReportFilter[]
        ).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setFilter(item)
            }
            className={
              filter === item
                ? 'rounded-xl bg-white/[0.08] px-3 py-2.5 text-xs font-semibold text-accent-green'
                : 'rounded-xl px-3 py-2.5 text-xs font-medium text-accent-subtle transition hover:text-accent-white'
            }
          >
            {t(
              `focusMeHistoryPage.filters.${item}`,
            )}
          </button>
        ))}
      </div>

      {reportsQuery.isLoading && (
        <div className="flex items-center justify-center py-20">
          <LoaderCircle
            size={28}
            className="animate-spin text-accent-green"
          />
        </div>
      )}

      {reportsQuery.isError && (
        <div className="card p-5">
          <p className="text-sm text-red-300">
            {t(
              'focusMeHistoryPage.error',
            )}
          </p>
        </div>
      )}

      {reportsQuery.isSuccess &&
        visibleReports.length === 0 && (
          <motion.div
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="card flex flex-col items-center px-6 py-14 text-center"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
              <History size={24} />
            </div>

            <h2 className="mt-5 text-base font-semibold text-accent-white">
              {t(
                'focusMeHistoryPage.empty.title',
              )}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-accent-subtle">
              {t(
                'focusMeHistoryPage.empty.description',
              )}
            </p>

            <div className="mt-5 inline-flex items-center gap-2 text-xs text-accent-green">
              <CalendarDays size={15} />

              {t(
                'focusMeHistoryPage.empty.schedule',
              )}
            </div>
          </motion.div>
        )}

      {visibleReports.length > 0 && (
        <div className="space-y-3">
          {visibleReports.map(
            (report, index) => {
              const summary =
                getReportSummary(report)

              const Icon =
                report.type ===
                'monthly'
                  ? BarChart3
                  : CalendarDays

              return (
                <motion.button
                  key={report.id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/focusme/reports/${report.id}`,
                    )
                  }
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.035,
                  }}
                  className="card flex w-full items-center gap-4 p-5 text-left transition hover:border-accent-green/20 hover:bg-accent-green/[0.025]"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green">
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold capitalize text-accent-white">
                        {formatPeriod(
                          report,
                        )}
                      </h2>

                      <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2 py-0.5 text-[10px] font-medium text-accent-subtle">
                        {t(
                          `focusMeHistoryPage.types.${report.type}`,
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-accent-subtle">
                      {formatMinutes(
                        summary.minutes,
                      )}
                      {' · '}
                      {summary.sessions}
                      {' '}
                      {t(
                        'focusMeHistoryPage.sessions',
                      )}
                      {' · '}
                      {summary.tasks}
                      {' '}
                      {t(
                        'focusMeHistoryPage.tasks',
                      )}
                    </p>
                  </div>

                  <ChevronRight
                    size={18}
                    className="shrink-0 text-accent-subtle"
                  />
                </motion.button>
              )
            },
          )}
        </div>
      )}
    </div>
  )
}
