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
import { format, parseISO } from 'date-fns'
import { LoaderCircle } from 'lucide-react'

import { useAnalytics } from '@/hooks/analytics/useAnalytics'
import { StatCard } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn, formatDuration } from '@/utils'

type ChartTooltipPayload = {
  value: number
  name: string
  color?: string
}

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
            item.name === 'sessionsCompleted'
              ? 'Sessions'
              : item.name === 'tasksCompleted'
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
                  color: item.color ?? '#34d399',
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

export function AnalyticsPage() {
  const {
    weeklyData,
    monthlyData,
    totalFocusMinutes,
    totalSessions,
    averageDailyFocusMinutes,
    projectAnalytics,
    topProject,
    isLoading,
    isError,
    error,
  } = useAnalytics()

  const [range, setRange] = useState<
    'week' | 'month'
  >('week')

  const sourceData =
    range === 'week'
      ? weeklyData
      : monthlyData

  const chartData = sourceData.map(
    (day) => ({
      ...day,

      label: format(
        parseISO(day.date),
        range === 'week'
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

  const maxProjectMinutes = Math.max(
    ...projectAnalytics.map(
      (project) =>
        project.calculatedFocusMinutes,
    ),
    1,
  )

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
          value={topProject?.emoji ?? '—'}
          sub={
            topProject?.name ?? 'None yet'
          }
          accent={Boolean(topProject)}
          delay={0.15}
        />
      </div>

      {/* Range selector */}

      <div className="segment w-fit">
        {(
          ['week', 'month'] as const
        ).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setRange(item)
            }
            className={cn(
              'segment-item',
              range === item
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

      {/* Project breakdown */}

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
          delay: 0.3,
        }}
        className="card p-6"
      >
        <p className="mb-5 text-[13px] font-semibold text-white">
          Project Breakdown
        </p>

        {projectAnalytics.length ===
        0 ? (
          <div className="flex min-h-[140px] items-center justify-center">
            <p className="text-[13px] text-white/30">
              No projects created yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {projectAnalytics.map(
              (project, index) => {
                const percentage =
                  Math.min(
                    project.calculatedFocusMinutes /
                      maxProjectMinutes,
                    1,
                  )

                return (
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
                        index * 0.06,
                    }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-6 flex-shrink-0 text-center text-base">
                      {project.emoji}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <span className="truncate text-[13px] font-medium text-white/80">
                          {project.name}
                        </span>

                        <span className="flex-shrink-0 font-mono text-[11px] text-white/30">
                          {formatDuration(
                            project.calculatedFocusMinutes,
                          )}
                        </span>
                      </div>

                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{
                            width: 0,
                          }}
                          animate={{
                            width: `${percentage * 100}%`,
                          }}
                          transition={{
                            duration: 0.8,
                            ease: 'easeOut',
                            delay:
                              0.4 +
                              index *
                                0.07,
                          }}
                          className="h-full rounded-full"
                          style={{
                            backgroundColor:
                              project.color,
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )
              },
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}