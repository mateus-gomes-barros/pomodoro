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
  label: string
}> = [
  {
    value: 'week',
    label: 'This Week',
  },
  {
    value: 'month',
    label: 'This Month',
  },
  {
    value: 'year',
    label: 'This Year',
  },
  {
    value: 'all',
    label: 'All Time',
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
              ? 'Sessions'
              : item.name ===
                  'tasksCompleted'
                ? 'Tasks'
                : 'Hours'

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
  if (range === 'all') {
    return null
  }

  if (isNew) {
    return (
      <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
        New
      </span>
    )
  }

  if (changePercentage === null) {
    return (
      <span className="rounded-full bg-white/[0.05] px-2 py-1 text-[10px] font-medium text-white/30">
        No previous data
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

function getPreviousPeriodLabel(
  range: TrendRange,
) {
  if (range === 'week') {
    return 'last week'
  }

  if (range === 'month') {
    return 'last month'
  }

  if (range === 'year') {
    return 'last year'
  }

  return null
}

export function AnalyticsPage() {
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

  const {
    weeklyData,
    monthlyData,
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

  const previousPeriodLabel =
    getPreviousPeriodLabel(
      trendRange,
    )

  const hasTrendData =
    trends.totalFocusMinutes > 0

  if (isLoading) {
    return (
      <div className="w-full min-w-0 space-y-8">
        <PageHeader
          title="Analytics"
          subtitle="Loading your productivity data"
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
          title="Analytics"
          subtitle="Unable to load your productivity data"
        />

        <div className="card p-6">
          <p className="text-sm text-red-400">
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred while loading analytics.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-8">
      <PageHeader
        title="Analytics"
        subtitle="Your productivity at a glance"
      />

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Focus"
          value={formatDuration(
            totalFocusMinutes,
          )}
          sub="all time"
          delay={0}
        />

        <StatCard
          label="Total Sessions"
          value={totalSessions}
          sub="pomodoros"
          delay={0.05}
        />

        <StatCard
          label="Daily Average"
          value={formatDuration(
            averageDailyFocusMinutes,
          )}
          sub="this week"
          delay={0.1}
        />

        <StatCard
          label="Top Project"
          value={
            topProject?.emoji ?? '—'
          }
          sub={
            topProject?.name ??
            'None yet'
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
              ? 'This Week'
              : 'This Month'}
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
            Focus Hours
          </p>

          <p className="mt-0.5 text-[11px] text-white/35">
            Daily concentration time
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
            Sessions & Tasks
          </p>

          <p className="mt-0.5 text-[11px] text-white/35">
            Pomodoros completed vs tasks done
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

            Sessions
          </div>

          <div className="flex items-center gap-2 text-[11px] text-white/35">
            <div className="h-3 w-3 rounded-sm bg-blue-400/60" />

            Tasks
          </div>
        </div>
      </motion.div>

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
              Trends
            </p>

            <p className="mt-1 text-[12px] text-white/35">
              Discover where your focus
              time is going
            </p>
          </div>

          <div className="segment w-full overflow-x-auto sm:w-fit">
            {trendRangeOptions.map(
              (option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setTrendRange(
                      option.value,
                    )
                  }
                  className={cn(
                    'segment-item whitespace-nowrap',
                    trendRange ===
                      option.value
                      ? 'active'
                      : 'inactive',
                  )}
                >
                  {option.label}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
          {/* Top projects */}

          <div className="card p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy
                    size={16}
                    className="text-amber-300"
                  />

                  <p className="text-[13px] font-semibold text-white">
                    Top Projects
                  </p>
                </div>

                <p className="mt-1 text-[11px] text-white/35">
                  {previousPeriodLabel
                    ? `Focus time compared with ${previousPeriodLabel}`
                    : 'Share of all recorded focus time'}
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono text-[13px] font-semibold text-white/80">
                  {formatDuration(
                    trends.totalFocusMinutes,
                  )}
                </p>

                <p className="mt-0.5 text-[10px] text-white/30">
                  total focus
                </p>
              </div>
            </div>

            {!hasTrendData ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <div className="max-w-[260px] text-center">
                  <p className="text-[13px] font-medium text-white/45">
                    No focus sessions in
                    this period
                  </p>

                  <p className="mt-1.5 text-[11px] leading-relaxed text-white/25">
                    Complete a Pomodoro
                    connected to a project
                    to see its trend here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {trends.topProjects
                  .slice(0, 5)
                  .map(
                    (
                      project,
                      index,
                    ) => (
                      <motion.div
                        key={project.id}
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
                      >
                        <div className="mb-2 flex items-center gap-3">
                          <span className="w-5 flex-shrink-0 text-center font-mono text-[11px] text-white/25">
                            {index + 1}
                          </span>

                          <span className="flex-shrink-0 text-base">
                            {project.emoji}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-white/80">
                              {
                                project.name
                              }
                            </p>

                            <p className="mt-0.5 text-[10px] text-white/30">
                              {
                                project.sharePercentage
                              }
                              % of your
                              focus time
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

                            <span className="min-w-[54px] text-right font-mono text-[11px] text-white/45">
                              {formatDuration(
                                project.currentFocusMinutes,
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="ml-8 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div
                            initial={{
                              width: 0,
                            }}
                            animate={{
                              width: `${Math.min(
                                project.sharePercentage,
                                100,
                              )}%`,
                            }}
                            transition={{
                              duration: 0.75,
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
                  Insights
                </p>

                <p className="mt-0.5 text-[11px] text-white/35">
                  Highlights from this
                  period
                </p>
              </div>
            </div>

            {!hasTrendData ? (
              <div className="flex min-h-[220px] items-center justify-center">
                <p className="max-w-[230px] text-center text-[12px] leading-relaxed text-white/30">
                  Your insights will appear
                  after you complete focus
                  sessions.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trendRange !== 'all' && (
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
                      Focus momentum
                    </p>

                    <p className="mt-1 text-[11px] leading-relaxed text-white/35">
                      {trends.totalChangePercentage ===
                      null
                        ? `There is no focus data from ${previousPeriodLabel} to compare yet.`
                        : trends.totalChangePercentage >
                            0
                          ? `You focused ${trends.totalChangePercentage}% more than ${previousPeriodLabel}.`
                          : trends.totalChangePercentage <
                              0
                            ? `You focused ${Math.abs(
                                trends.totalChangePercentage,
                              )}% less than ${previousPeriodLabel}.`
                            : `Your focus time is unchanged from ${previousPeriodLabel}.`}
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
                    Most productive day
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-white/35">
                    {trends.mostProductiveWeekday
                      ? `${trends.mostProductiveWeekday} is your strongest focus day in this period.`
                      : 'Not enough activity to identify your best day yet.'}
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
                    Main focus
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-white/35">
                    {topTrendProject
                      ? `${topTrendProject.name} received ${topTrendProject.sharePercentage}% of your total focus time.`
                      : 'Connect sessions to projects to discover your main focus.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                  <p className="text-[12px] font-semibold text-white/80">
                    Active days
                  </p>

                  <p className="mt-1 text-[11px] leading-relaxed text-white/35">
                    You recorded focus time
                    on{' '}
                    <span className="font-semibold text-white/65">
                      {trends.activeDays}
                    </span>{' '}
                    {trends.activeDays ===
                    1
                      ? 'day'
                      : 'days'}{' '}
                    during this period.
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