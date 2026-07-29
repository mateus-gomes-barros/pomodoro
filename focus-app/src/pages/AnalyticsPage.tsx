import { useState } from 'react'
import { motion } from 'framer-motion'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import {
  format,
  parseISO,
} from 'date-fns'

import { useStatsStore } from '../store/statsStore'
import { useProjectsStore } from '../store/projectsStore'

import { StatCard } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'

import {
  formatDuration,
  cn,
} from '../utils'

export function AnalyticsPage() {
  const {
    getWeeklyData,
    getMonthlyData,
    getTotalFocusMinutes,
    getTotalSessions,
  } = useStatsStore()

  const projects = useProjectsStore(
    s => s.projects
  )

  const [range, setRange] = useState<
    'week' | 'month'
  >('week')

  const weeklyData =
    getWeeklyData()

  const monthlyData =
    getMonthlyData()

  const chartData = (
    range === 'week'
      ? weeklyData
      : monthlyData
  ).map(data => ({
    ...data,

    label: format(
      parseISO(data.date),
      range === 'week'
        ? 'EEE'
        : 'd'
    ),

    hours: +(
      data.focusMinutes / 60
    ).toFixed(1),
  }))

  const totalMinutes =
    getTotalFocusMinutes()

  const totalSessions =
    getTotalSessions()

  const avgDaily =
    weeklyData.length
      ? Math.round(
          weeklyData.reduce(
            (acc, data) =>
              acc + data.focusMinutes,
            0
          ) / 7
        )
      : 0

  const topProject =
    [...projects]
      .sort(
        (a, b) =>
          b.totalFocusMinutes -
          a.totalFocusMinutes
      )[0]

  function CustomTooltip({
    active,
    payload,
    label,
  }: any) {

    if (
      !active ||
      !payload?.length
    ) {
      return null
    }

    return (
      <div className="bg-bg-elevated border border-border-subtle rounded-xl p-3 shadow-lg">

        <p className="text-xs text-accent-subtle mb-1">
          {label}
        </p>

        <p className="text-xs text-accent-green font-semibold">
          {payload[0]?.value}h focus
        </p>

      </div>
    )
  }

  return (

    <div className="w-full px-2 lg:px-4 py-2">

      <PageHeader
        title="Analytics"
        subtitle="Your productivity insights"
      />

      {/* STATS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-5
        mb-8
      ">

        <StatCard
          label="Focus Time"
          value={formatDuration(totalMinutes)}
          sub="all time"
        />

        <StatCard
          label="Sessions"
          value={totalSessions}
          sub="pomodoros"
        />

        <StatCard
          label="Daily Avg"
          value={formatDuration(avgDaily)}
          sub="this week"
        />

        <StatCard
          label="Top Project"
          value={topProject?.emoji || '—'}
          sub={topProject?.name || 'None'}
        />

      </div>

      {/* RANGE */}

      <div className="
        flex
        gap-2
        bg-bg-card
        p-1
        rounded-2xl
        mb-6
        w-fit
      ">

        {['week', 'month'].map(tab => (

          <button
            key={tab}
            onClick={() =>
              setRange(
                tab as
                'week' |
                'month'
              )
            }
            className={cn(
              `
              px-5
              py-2
              rounded-xl
              text-sm
              transition-all
              `,

              range === tab
                ? 'bg-bg-elevated text-white'
                : 'text-accent-subtle'
            )}
          >
            {tab}

          </button>

        ))}

      </div>

      {/* CHART */}

      <motion.div
        initial={{
          opacity:0,
          y:10
        }}
        animate={{
          opacity:1,
          y:0
        }}
        className="card p-8 mb-8 overflow-hidden"
      >

        <h3 className="font-semibold text-lg mb-6">

          Focus Hours

        </h3>

        <ResponsiveContainer
          width="100%"
          height={300}
        >

          <AreaChart
            data={chartData}
          >

            <defs>

              <linearGradient
                id="focus"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >

                <stop
                  offset="0%"
                  stopColor="#7EE081"
                  stopOpacity={0.4}
                />

                <stop
                  offset="100%"
                  stopColor="#7EE081"
                  stopOpacity={0}
                />

              </linearGradient>

            </defs>

            <XAxis
              dataKey="label"
            />

            <YAxis />

            <Tooltip
              content={
                <CustomTooltip />
              }
            />

            <Area
              type="monotone"
              dataKey="hours"
              stroke="#7EE081"
              strokeWidth={3}
              fill="url(#focus)"
            />

          </AreaChart>

        </ResponsiveContainer>

      </motion.div>

      {/* PROJECTS */}

      <motion.div
        initial={{
          opacity:0,
          y:10
        }}
        animate={{
          opacity:1,
          y:0
        }}
        className="card p-8"
      >

        <h3 className="font-semibold text-lg mb-6">

          Projects

        </h3>

        {projects.length === 0 ? (

          <p className="text-accent-subtle">

            No projects yet

          </p>

        ) : (

          <div className="space-y-5">

            {[...projects]
              .sort(
                (a,b)=>
                  b.totalFocusMinutes -
                  a.totalFocusMinutes
              )
              .map(project=>{

                const max =
                  Math.max(
                    ...projects.map(
                      p=>p.totalFocusMinutes
                    ),
                    1
                  )

                const width =
                  (
                    project.totalFocusMinutes /
                    max
                  ) * 100

                return(

                  <div
                    key={project.id}
                  >

                    <div className="
                      flex
                      justify-between
                      mb-2
                    ">

                      <span>

                        {project.emoji}
                        {' '}
                        {project.name}

                      </span>

                      <span className="
                        text-sm
                        text-accent-subtle
                      ">

                        {formatDuration(
                          project.totalFocusMinutes
                        )}

                      </span>

                    </div>

                    <div className="
                      h-3
                      rounded-full
                      overflow-hidden
                      bg-bg-secondary
                    ">

                      <div
                        className="
                          h-full
                          rounded-full
                        "
                        style={{
                          width:`${width}%`,
                          backgroundColor:
                          project.color
                        }}
                      />

                    </div>

                  </div>

                )
              })}

          </div>

        )}

      </motion.div>

    </div>

  )
}