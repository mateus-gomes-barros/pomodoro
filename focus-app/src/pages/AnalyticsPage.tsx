import { enUS, ptBR } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  format,
  parseISO,
} from 'date-fns'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  LoaderCircle,
  Minus,
  Sparkles,
  Trophy,
} from 'lucide-react'

import {
  useAnalytics,
  type TrendRange,
} from '@/hooks/analytics/useAnalytics'
import {
  StatCard,
} from '@/components/ui/Card'
import {
  PageHeader,
} from '@/components/ui/PageHeader'
import {
  cn,
  formatDuration,
} from '@/utils'

type ChartTooltipPayload = {
  value: number
  name: string
  color?: string
}

interface ProjectChangeBadgeProps {
  changePercentage: number | null
  isNew: boolean
  range: TrendRange
}

const trendRangeOptions: Array<{
  value: TrendRange
  labelKey: string
}> = [
  {
    value: 'week',
    labelKey: 'analyticsPage.ranges.week',
  },
  {
    value: 'month',
    labelKey: 'analyticsPage.ranges.month',
  },
  {
    value: 'year',
    labelKey: 'analyticsPage.ranges.year',
  },
  {
    value: 'all',
    labelKey: 'analyticsPage.ranges.all',
  },
]

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: ChartTooltipPayload[]
  label?: string
}) {
  const { t } = useTranslation()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-xl border border-white/[0.1] bg-[#1c1c1c] px-3 py-2 text-[11px] shadow-xl">
      <p className="mb-1.5 text-white/40">
        {label}
      </p>

      <div className="space-y-1">
        {payload.map((item) => {
          const itemLabel =
            item.name ===
            'sessionsCompleted'
              ? t(
                  'analyticsPage.tooltip.sessions',
                )
              : item.name ===
                  'tasksCompleted'
                ? t(
                    'analyticsPage.tooltip.tasks',
                  )
                : t(
                    'analyticsPage.tooltip.hours',
                  )

          return (
            <div
              key={item.name}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-white/40">
                {itemLabel}
              </span>

              <span
                className="font-mono font-semibold"
                style={{
                  color:
                    item.color ??
                    '#34d399',
                }}
              >
                {item.value}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProjectChangeBadge({
  changePercentage,
  isNew,
  range,
}: ProjectChangeBadgeProps) {
  const { t } = useTranslation()

  if (range === 'all') {
    return null
  }

  if (isNew) {
    return (
      <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
        {t('analyticsPage.change.new')}
      </span>
    )
  }

  if (changePercentage === null) {
    return (
      <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] font-medium text-white/30">
        {t(
          'analyticsPage.change.noPrevious',
        )}
      </span>
    )
  }

  if (changePercentage > 0) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
        <ArrowUpRight size={12} />

        {changePercentage}%
      </span>
    )
  }

  if (changePercentage < 0) {
    return (
      <span className="flex items-center gap-1 rounded-full bg-red-400/10 px-2 py-1 text-[10px] font-semibold text-red-300">
        <ArrowDownRight size={12} />

        {Math.abs(
          changePercentage,
        )}
        %
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-white/[0.05] px-2 py-1 text-[10px] font-medium text-white/35">
      <Minus size={12} />

      0%
    </span>
  )
}

export function AnalyticsPage() {
  const { t, i18n } = useTranslation()

  const [
    chartRange,
    setChartRange,
  ] = useState<
    'week' | 'month'
  >('week')

  const [
    trendRange,
    setTrendRange,
  ] = useState<TrendRange>(
    'week',
  )

  const [
    showAllProjects,
    setShowAllProjects,
  ] = useState(false)

  const {
    weeklyData,
    monthlyData,
    monthlyHistory,
    totalFocusMinutes,
    totalSessions,
    averageDailyFocusMinutes,
    topProject,
    trends,
    isLoading,
    isError,
    error,
  } = useAnalytics(trendRange)

  const sourceData =
    chartRange === 'week'
      ? weeklyData
      : monthlyData

  const chartData = sourceData.map(
    (day) => ({
      ...day,

      label: format(
        parseISO(day.date),
        chartRange === 'week'
          ? 'EEE'
          : 'd',
        {
          locale:
            i18n.language === 'pt-BR'
              ? ptBR
              : enUS,
        },
      ),

      hours: Number(
        (
          day.focusMinutes / 60
        ).toFixed(1),
      ),
    }),
  )

  const topTrendProject =
    trends.topProjects[0]

  const topThreeProjects =
    trends.topProjects.slice(0, 3)

  const otherProjects =
    trends.topProjects.slice(3)

  const visibleOtherProjects =
    showAllProjects
      ? otherProjects
      : otherProjects.slice(0, 3)

  const previousPeriodLabel =
    trendRange === 'week'
      ? t('analyticsPage.ranges.lastWeek')
      : trendRange === 'month'
        ? t('analyticsPage.ranges.lastMonth')
        : trendRange === 'year'
          ? t('analyticsPage.ranges.lastYear')
          : null

  const hasFocusData =
    trends.totalFocusMinutes > 0

  const hasProjectTrendData =
    trends.topProjects.length > 0

  const hasMonthlyHistoryData =
    monthlyHistory.totalFocusMinutes > 0

  const maximumMonthlyFocus =
    Math.max(
      ...monthlyHistory.months.map(
        (month) =>
          month.focusMinutes,
      ),
      1,
    )

  const latestMonth =
    monthlyHistory.months[
      monthlyHistory.months.length - 1
    ]

  if (isLoading) {
    return (
      <div className="w-full min-w-0 space-y-8">
        <PageHeader
          title={t('analyticsPage.title')}
          subtitle={t('analyticsPage.loading')}
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
      <div className="w-full min-w-0 space-y-8">
        <PageHeader
          title={t('analyticsPage.title')}
          subtitle={t('analyticsPage.unableToLoad')}
        />

        <div className="card p-6">
          <p className="text-sm text-red-400">
            {error instanceof Error
              ? error.message
              : t('analyticsPage.loadError')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-8">
      <PageHeader
        title={t('analyticsPage.title')}
        subtitle={t('analyticsPage.subtitle')}
      />

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('analyticsPage.stats.totalFocus')}
          value={formatDuration(
            totalFocusMinutes,
          )}
          sub={t('analyticsPage.stats.allTime')}
          delay={0}
        />

        <StatCard
          label={t('analyticsPage.stats.totalSessions')}
          value={totalSessions}
          sub={t('analyticsPage.stats.pomodoros')}
          delay={0.05}
        />

        <StatCard
          label={t('analyticsPage.stats.dailyAverage')}
          value={formatDuration(
            averageDailyFocusMinutes,
          )}
          sub={t('analyticsPage.stats.thisWeek')}
          delay={0.1}
        />

        <StatCard
          label={t('analyticsPage.stats.topProject')}
          value={
            topProject?.emoji ?? '—'
          }
          sub={
            topProject?.name ??
            t('analyticsPage.stats.noneYet')
          }
          accent={Boolean(
            topProject,
          )}
          delay={0.15}
        />
      </div>

      {/* Chart range selector */}

      <div className="segment w-fit">
        {(
          [
            'week',
            'month',
          ] as const
        ).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setChartRange(item)
            }
            className={cn(
              'segment-item',
              chartRange === item
                ? 'active'
                : 'inactive',
            )}
          >
            {item === 'week'
              ? t('analyticsPage.ranges.week')
              : t('analyticsPage.ranges.month')}
          </button>
        ))}
      </div>

      {/* Focus hours chart */}

      <motion.div
        initial={{
          opacity: 0,
          y: 6,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.18,
        }}
        className="card p-6"
      >
        <div className="mb-5">
          <p className="text-[13px] font-semibold text-white">
            {t(
              'analyticsPage.focusChart.title',
            )}
          </p>

          <p className="mt-0.5 text-[11px] text-white/35">
            {t(
              'analyticsPage.focusChart.subtitle',
            )}
          </p>
        </div>

        <div className="chart-wrap">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={chartData}
              margin={{
                top: 4,
                right: 0,
                left: -28,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="focusGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#34d399"
                    stopOpacity={0.25}
                  />

                  <stop
                    offset="100%"
                    stopColor="#34d399"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="label"
                tick={{
                  fill: '#ffffff40',
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fill: '#ffffff40',
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={
                  <ChartTooltip />
                }
                cursor={{
                  stroke: '#ffffff10',
                  strokeWidth: 1,
                }}
              />

              <Area
                type="monotone"
                dataKey="hours"
                name="hours"
                stroke="#34d399"
                strokeWidth={2}
                fill="url(#focusGrad)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: '#34d399',
                  strokeWidth: 0,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Sessions and tasks chart */}

      <motion.div
        initial={{
          opacity: 0,
          y: 6,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.24,
        }}
        className="card p-6"
      >
        <div className="mb-5">
          <p className="text-[13px] font-semibold text-white">
            {t(
              'analyticsPage.sessionsChart.title',
            )}
          </p>

          <p className="mt-0.5 text-[11px] text-white/35">
            {t(
              'analyticsPage.sessionsChart.subtitle',
            )}
          </p>
        </div>

        <div className="chart-wrap">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={chartData}
              margin={{
                top: 4,
                right: 0,
                left: -28,
                bottom: 0,
              }}
              barGap={4}
            >
              <XAxis
                dataKey="label"
                tick={{
                  fill: '#ffffff40',
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fill: '#ffffff40',
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                content={
                  <ChartTooltip />
                }
                cursor={{
                  fill: '#ffffff05',
                }}
              />

              <Bar
                dataKey="sessionsCompleted"
                name="sessionsCompleted"
                fill="#34d399"
                radius={[
                  3,
                  3,
                  0,
                  0,
                ]}
                opacity={0.8}
              />

              <Bar
                dataKey="tasksCompleted"
                name="tasksCompleted"
                fill="#60a5fa"
                radius={[
                  3,
                  3,
                  0,
                  0,
                ]}
                opacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-[11px] text-white/35">
            <div className="h-3 w-3 rounded-sm bg-emerald-400/80" />

            {t(
              'analyticsPage.sessionsChart.sessions',
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-white/35">
            <div className="h-3 w-3 rounded-sm bg-blue-400/60" />

            {t(
              'analyticsPage.sessionsChart.tasks',
            )}
          </div>
        </div>
      </motion.div>

      {/* Monthly history */}

      <motion.section
        initial={{
          opacity: 0,
          y: 6,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.28,
        }}
        className="space-y-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-white">
              {t('analyticsPage.monthly.title')}
            </p>

            <p className="mt-1 text-[12px] text-white/35">
              {t('analyticsPage.monthly.subtitle')}
            </p>
          </div>

          {hasMonthlyHistoryData && (
            <div className="flex items-center gap-2">
              {monthlyHistory.latestMonthChangePercentage ===
              null ? (
                <span className="rounded-full bg-white/[0.05] px-3 py-1.5 text-[10px] font-medium text-white/35">
                  {t('analyticsPage.monthly.noPrevious')}
                </span>
              ) : monthlyHistory.latestMonthChangePercentage >
                0 ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-300">
                  <ArrowUpRight
                    size={12}
                  />

                  {t(
                    'analyticsPage.monthly.fromLastMonth',
                    {
                      percentage:
                        monthlyHistory.latestMonthChangePercentage,
                    },
                  )}
                </span>
              ) : monthlyHistory.latestMonthChangePercentage <
                0 ? (
                <span className="flex items-center gap-1 rounded-full bg-red-400/10 px-3 py-1.5 text-[10px] font-semibold text-red-300">
                  <ArrowDownRight
                    size={12}
                  />

                  {t(
                    'analyticsPage.monthly.fromLastMonth',
                    {
                      percentage:
                        Math.abs(
                          monthlyHistory.latestMonthChangePercentage,
                        ),
                    },
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-white/[0.05] px-3 py-1.5 text-[10px] font-medium text-white/35">
                  <Minus size={12} />

                  {t('analyticsPage.monthly.unchanged')}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="card p-6">
          {!hasMonthlyHistoryData ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="max-w-[270px] text-center">
                <CalendarDays
                  size={28}
                  className="mx-auto text-white/20"
                />

                <p className="mt-4 text-[13px] font-medium text-white/45">
                  {t('analyticsPage.monthly.empty')}
                </p>

                <p className="mt-1.5 text-[11px] leading-relaxed text-white/25">
                  {t(
                    'analyticsPage.monthly.emptyDescription',
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-7 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.7fr)]">
              <div className="min-w-0">
                <div className="overflow-x-auto pb-2">
                  <div className="grid min-w-[560px] grid-cols-6 gap-4">
                    {monthlyHistory.months.map(
                      (
                        month,
                        index,
                      ) => {
                        const barPercentage =
                          month.focusMinutes > 0
                            ? Math.max(
                                (month.focusMinutes /
                                  maximumMonthlyFocus) *
                                  100,
                                7,
                              )
                            : 0

                        return (
                          <motion.div
                            key={month.key}
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
                                0.32 +
                                index *
                                  0.05,
                            }}
                            className="flex min-w-0 flex-col"
                          >
                            <div className="mb-3 text-center">
                              <p className="font-mono text-[11px] font-semibold text-white/60">
                                {formatDuration(
                                  month.focusMinutes,
                                )}
                              </p>

                              <p className="mt-0.5 text-[9px] text-white/25">
                                {t(
                                  'analyticsPage.monthly.session',
                                  {
                                    count:
                                      month.sessionsCompleted,
                                  },
                                )}
                              </p>
                            </div>

                            <div className="flex h-44 items-end justify-center rounded-2xl bg-white/[0.025] px-3 pt-3">
                              <motion.div
                                initial={{
                                  height:
                                    0,
                                }}
                                animate={{
                                  height: `${barPercentage}%`,
                                }}
                                transition={{
                                  duration:
                                    0.75,
                                  ease: 'easeOut',
                                  delay:
                                    0.35 +
                                    index *
                                      0.05,
                                }}
                                className="relative w-full max-w-12 rounded-t-xl bg-emerald-400/75"
                              >
                                {month.topProject && (
                                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-lg">
                                    {
                                      month.topProject
                                        .emoji
                                    }
                                  </span>
                                )}
                              </motion.div>
                            </div>

                            <div className="mt-3 text-center">
                              <p className="text-[11px] font-semibold uppercase text-white/55">
                                {
                                  month.label
                                }
                              </p>

                              <p className="mt-0.5 text-[9px] text-white/25">
                                {t(
                                  'analyticsPage.monthly.activeDay',
                                  {
                                    count:
                                      month.activeDays,
                                  },
                                )}
                              </p>
                            </div>
                          </motion.div>
                        )
                      },
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                    {t('analyticsPage.monthly.sixMonthTotal')}
                  </p>

                  <p className="mt-2 font-mono text-[22px] font-semibold text-white/85">
                    {formatDuration(
                      monthlyHistory.totalFocusMinutes,
                    )}
                  </p>

                  <p className="mt-1 text-[10px] text-white/30">
                    {t(
                      'analyticsPage.monthly.averagePerMonth',
                      {
                        duration:
                          formatDuration(
                            monthlyHistory.averageMonthlyFocusMinutes,
                          ),
                      },
                    )}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
                      <Trophy
                        size={17}
                        className="text-amber-300"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                        {t('analyticsPage.monthly.bestMonth')}
                      </p>

                      <p className="mt-1 truncate text-[13px] font-semibold text-white/75">
                        {monthlyHistory.bestMonth
                          ?.fullLabel ??
                          t(
                            'analyticsPage.monthly.noData',
                          )}
                      </p>

                      <p className="mt-0.5 font-mono text-[10px] text-white/35">
                        {monthlyHistory.bestMonth
                          ? formatDuration(
                              monthlyHistory.bestMonth
                                .focusMinutes,
                            )
                          : '0m'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{
                        backgroundColor:
                          monthlyHistory.topProject
                            ? `${monthlyHistory.topProject.color}18`
                            : 'rgba(255,255,255,0.04)',
                      }}
                    >
                      {monthlyHistory.topProject
                        ?.emoji ?? '—'}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                        {t('analyticsPage.monthly.topProject')}
                      </p>

                      <p className="mt-1 truncate text-[13px] font-semibold text-white/75">
                        {monthlyHistory.topProject
                          ?.name ??
                          t('analyticsPage.stats.noneYet')}
                      </p>

                      <p className="mt-0.5 font-mono text-[10px] text-white/35">
                        {monthlyHistory.topProject
                          ? formatDuration(
                              monthlyHistory.topProject
                                .focusMinutes,
                            )
                          : '0m'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25">
                    {t('analyticsPage.monthly.currentMonth')}
                  </p>

                  <p className="mt-2 text-[13px] font-semibold text-white/75">
                    {latestMonth?.fullLabel ??
                      t(
                        'analyticsPage.monthly.currentMonth',
                      )}
                  </p>

                  <p className="mt-1 font-mono text-[10px] text-white/35">
                    {latestMonth
                      ? formatDuration(
                          latestMonth.focusMinutes,
                        )
                      : '0m'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* Trends */}

      <motion.section
        initial={{
          opacity: 0,
          y: 6,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.3,
        }}
        className="space-y-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[15px] font-semibold text-white">
              {t('analyticsPage.trends.title')}
            </p>

            <p className="mt-1 text-[12px] text-white/35">
              {t(
                'analyticsPage.trends.subtitle',
              )}
            </p>
          </div>

          <div className="segment w-full overflow-x-auto sm:w-fit">
            {trendRangeOptions.map(
              (option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTrendRange(
                      option.value,
                    )

                    setShowAllProjects(
                      false,
                    )
                  }}
                  className={cn(
                    'segment-item whitespace-nowrap',
                    trendRange ===
                      option.value
                      ? 'active'
                      : 'inactive',
                  )}
                >
                  {t(option.labelKey)}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
          {/* {t('analyticsPage.monthly.topProject')}s */}

          <div className="card p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy
                    size={16}
                    className="text-amber-300"
                  />

                  <p className="text-[13px] font-semibold text-white">
                    {t(
                      'analyticsPage.trends.topProjects',
                    )}
                  </p>
                </div>

                <p className="mt-1 text-[11px] text-white/35">
                  {previousPeriodLabel
                    ? t(
                        'analyticsPage.trends.comparedWith',
                        {
                          period:
                            previousPeriodLabel,
                        },
                      )
                    : t(
                        'analyticsPage.trends.allRecorded',
                      )}
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono text-[13px] font-semibold text-white/80">
                  {formatDuration(
                    trends.totalFocusMinutes,
                  )}
                </p>

                <p className="mt-0.5 text-[10px] text-white/30">
                  {t(
                    'analyticsPage.trends.totalFocus',
                  )}
                </p>
              </div>
            </div>

            {!hasProjectTrendData ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <div className="max-w-[260px] text-center">
                  <p className="text-[13px] font-medium text-white/45">
                    {t(
                      'analyticsPage.trends.empty',
                    )}
                  </p>

                  <p className="mt-1.5 text-[11px] leading-relaxed text-white/25">
                    {t(
                      'analyticsPage.trends.emptyDescription',
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-7">
                <div>
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/30">
                    {t(
                      'analyticsPage.trends.topThree',
                    )}
                  </p>

                  <div className="space-y-3">
                    {topThreeProjects.map(
                      (
                        project,
                        index,
                      ) => (
                        <motion.div
                          key={
                            project.id
                          }
                          initial={{
                            opacity: 0,
                            x: -6,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay:
                              0.35 +
                              index *
                                0.05,
                          }}
                          className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                          style={{
                            boxShadow: `inset 3px 0 0 ${project.color}`,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 flex-shrink-0 text-center text-base">
                              {
                                [
                                  '🥇',
                                  '🥈',
                                  '🥉',
                                ][index]
                              }
                            </span>

                            <span className="flex-shrink-0 text-xl">
                              {
                                project.emoji
                              }
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-semibold text-white/85">
                                {
                                  project.name
                                }
                              </p>

                              <p className="mt-0.5 text-[10px] text-white/30">
                                {t(
                                  'analyticsPage.trends.share',
                                  {
                                    percentage:
                                      project.sharePercentage,
                                  },
                                )}
                              </p>
                            </div>

                            <div className="flex flex-shrink-0 items-center gap-2.5">
                              <ProjectChangeBadge
                                range={
                                  trendRange
                                }
                                changePercentage={
                                  project.changePercentage
                                }
                                isNew={
                                  project.isNew
                                }
                              />

                              <span className="min-w-[54px] text-right font-mono text-[11px] text-white/50">
                                {formatDuration(
                                  project.currentFocusMinutes,
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <motion.div
                              initial={{
                                width:
                                  0,
                              }}
                              animate={{
                                width: `${Math.min(
                                  project.sharePercentage,
                                  100,
                                )}%`,
                              }}
                              transition={{
                                duration:
                                  0.75,
                                ease: 'easeOut',
                                delay:
                                  0.4 +
                                  index *
                                    0.05,
                              }}
                              className="h-full rounded-full"
                              style={{
                                backgroundColor:
                                  project.color,
                              }}
                            />
                          </div>
                        </motion.div>
                      ),
                    )}
                  </div>
                </div>

                {otherProjects.length >
                  0 && (
                  <div className="border-t border-white/[0.06] pt-6">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/30">
                        {t(
                          'analyticsPage.trends.otherProjects',
                        )}
                      </p>

                      <span className="text-[10px] text-white/25">
                        {t(
                          'analyticsPage.trends.project',
                          {
                            count:
                              otherProjects.length,
                          },
                        )}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {visibleOtherProjects.map(
                        (
                          project,
                          index,
                        ) => (
                          <motion.div
                            key={
                              project.id
                            }
                            initial={{
                              opacity:
                                0,
                              y: 5,
                            }}
                            animate={{
                              opacity:
                                1,
                              y: 0,
                            }}
                            transition={{
                              delay:
                                0.42 +
                                index *
                                  0.04,
                            }}
                            className="rounded-xl border border-white/[0.05] bg-white/[0.018] px-3.5 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-5 flex-shrink-0 text-center font-mono text-[10px] text-white/20">
                                {index +
                                  4}
                              </span>

                              <span className="flex-shrink-0 text-base">
                                {
                                  project.emoji
                                }
                              </span>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[12px] font-medium text-white/65">
                                  {
                                    project.name
                                  }
                                </p>

                                <p className="mt-0.5 text-[9px] text-white/25">
                                  {t(
                                  'analyticsPage.trends.shareShort',
                                  {
                                    percentage:
                                      project.sharePercentage,
                                  },
                                )}
                                </p>
                              </div>

                              <ProjectChangeBadge
                                range={
                                  trendRange
                                }
                                changePercentage={
                                  project.changePercentage
                                }
                                isNew={
                                  project.isNew
                                }
                              />

                              <span className="min-w-[54px] text-right font-mono text-[10px] text-white/35">
                                {formatDuration(
                                  project.currentFocusMinutes,
                                )}
                              </span>
                            </div>

                            <div className="ml-8 mt-2 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                              <motion.div
                                initial={{
                                  width:
                                    0,
                                }}
                                animate={{
                                  width: `${Math.min(
                                    project.sharePercentage,
                                    100,
                                  )}%`,
                                }}
                                transition={{
                                  duration:
                                    0.65,
                                  ease: 'easeOut',
                                }}
                                className="h-full rounded-full"
                                style={{
                                  backgroundColor:
                                    project.color,
                                }}
                              />
                            </div>
                          </motion.div>
                        ),
                      )}
                    </div>

                    {otherProjects.length >
                      3 && (
                      <button
                        type="button"
                        onClick={() =>
                          setShowAllProjects(
                            (
                              currentValue,
                            ) =>
                              !currentValue,
                          )
                        }
                        className="mt-4 flex w-full items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-2.5 text-[11px] font-medium text-white/45 transition-colors hover:bg-white/[0.05] hover:text-white/70"
                      >
                        {showAllProjects
                          ? t(
                              'analyticsPage.trends.showLess',
                            )
                          : t(
                              'analyticsPage.trends.showAll',
                              {
                                count:
                                  otherProjects.length,
                              },
                            )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Insights */}

          <div className="card p-6">
            <div className="mb-6 flex items-center gap-2">
              <Sparkles
                size={16}
                className="text-emerald-300"
              />

              <div>
                <p className="text-[13px] font-semibold text-white">
                  {t(
                    'analyticsPage.insights.title',
                  )}
                </p>

                <p className="mt-0.5 text-[11px] text-white/35">
                  {t(
                    'analyticsPage.insights.subtitle',
                  )}
                </p>
              </div>
            </div>

            {!hasFocusData ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <p className="max-w-[230px] text-center text-[12px] leading-relaxed text-white/30">
                  {t(
                    'analyticsPage.insights.empty',
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trendRange !==
                  'all' && (
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10">
                      {trends.totalChangePercentage ===
                      null ? (
                        <Sparkles
                          size={16}
                          className="text-emerald-300"
                        />
                      ) : trends.totalChangePercentage >
                        0 ? (
                        <ArrowUpRight
                          size={16}
                          className="text-emerald-300"
                        />
                      ) : trends.totalChangePercentage <
                        0 ? (
                        <ArrowDownRight
                          size={16}
                          className="text-red-300"
                        />
                      ) : (
                        <Minus
                          size={16}
                          className="text-white/40"
                        />
                      )}
                    </div>

                    <p className="text-[12px] font-semibold text-white/80">
                      {t(
                        'analyticsPage.insights.momentum',
                      )}
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-white/35">
                      {trends.totalChangePercentage ===
                      null
                        ? t(
                            'analyticsPage.insights.noComparison',
                            {
                              period:
                                previousPeriodLabel,
                            },
                          )
                        : trends.totalChangePercentage >
                            0
                          ? t(
                              'analyticsPage.insights.more',
                              {
                                percentage:
                                  trends.totalChangePercentage,
                                period:
                                  previousPeriodLabel,
                              },
                            )
                          : trends.totalChangePercentage <
                              0
                            ? t(
                                'analyticsPage.insights.less',
                                {
                                  percentage:
                                    Math.abs(
                                      trends.totalChangePercentage,
                                    ),
                                  period:
                                    previousPeriodLabel,
                                },
                              )
                            : t(
                                'analyticsPage.insights.unchanged',
                                {
                                  period:
                                    previousPeriodLabel,
                                },
                              )}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-400/10">
                    <CalendarDays
                      size={16}
                      className="text-blue-300"
                    />
                  </div>

                  <p className="text-[12px] font-semibold text-white/80">
                    {t(
                      'analyticsPage.insights.productiveDay',
                    )}
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-white/35">
                    {trends.mostProductiveWeekday
                      ? t(
                          'analyticsPage.insights.productiveDayText',
                          {
                            day:
                              trends.mostProductiveWeekday,
                          },
                        )
                      : t(
                          'analyticsPage.insights.productiveDayEmpty',
                        )}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/10">
                    <Trophy
                      size={16}
                      className="text-amber-300"
                    />
                  </div>

                  <p className="text-[12px] font-semibold text-white/80">
                    {t(
                      'analyticsPage.insights.mainFocus',
                    )}
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-white/35">
                    {topTrendProject
                      ? t(
                          'analyticsPage.insights.mainFocusText',
                          {
                            project:
                              topTrendProject.name,
                            percentage:
                              topTrendProject.sharePercentage,
                          },
                        )
                      : t(
                          'analyticsPage.insights.mainFocusEmpty',
                        )}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="text-[12px] font-semibold text-white/80">
                    {t(
                      'analyticsPage.insights.activeDays',
                    )}
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-white/35">
                    {t(
                      'analyticsPage.insights.activeDaysText',
                      {
                        count:
                          trends.activeDays,
                      },
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  )
}