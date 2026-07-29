import { motion } from 'framer-motion'
import {
  Flame,
  Trophy,
  Calendar,
  Zap,
} from 'lucide-react'

import {
  format,
  startOfMonth,
  eachDayOfInterval,
  endOfMonth,
  subMonths,
} from 'date-fns'

import { useStatsStore } from '../store/statsStore'

import { StatCard } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'

import {
  formatDuration,
  cn,
} from '../utils'

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
    desc: '7-day streak',
  },
  {
    id: 'month_streak',
    icon: '🏆',
    title: 'Iron Will',
    desc: '30-day streak',
  },
  {
    id: 'ten_hours',
    icon: '⚡',
    title: 'Power User',
    desc: '600+ focus minutes',
  },
]

export function StreaksPage() {
  const {
    streak,
    dailyStats,
    getTotalFocusMinutes,
  } = useStatsStore()

  const totalMinutes =
    getTotalFocusMinutes()

  const today = new Date()

  const months = [
    subMonths(today, 2),
    subMonths(today, 1),
    today,
  ]

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">

      <PageHeader
        title="Streaks"
        subtitle="Keep your momentum going"
      />

      {/* TOP CARDS */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">

        <StatCard
          label="Current"
          value={streak.currentStreak}
          sub="days"
          icon={<Flame size={16}/>}
          accent={streak.currentStreak >= 3}
        />

        <StatCard
          label="Longest"
          value={streak.longestStreak}
          sub="best"
          icon={<Trophy size={16}/>}
        />

        <StatCard
          label="Active Days"
          value={streak.activeDates.length}
          sub="total"
          icon={<Calendar size={16}/>}
        />

        <StatCard
          label="Focus Time"
          value={formatDuration(
            totalMinutes
          )}
          sub="all time"
          icon={<Zap size={16}/>}
        />

      </div>

      {/* MAIN STREAK */}

      <motion.div
        initial={{
          opacity:0,
          y:10
        }}
        animate={{
          opacity:1,
          y:0
        }}
        className="card p-6 mb-6 flex flex-col items-center"
      >

        <div className="text-6xl mb-4">

          {streak.currentStreak >= 30
            ? '🏆'
            : streak.currentStreak >= 7
            ? '🔥'
            : streak.currentStreak >= 3
            ? '✨'
            : '💧'}

        </div>

        <h2 className="text-5xl font-bold text-accent-white">
          {streak.currentStreak}
        </h2>

        <p className="text-accent-subtle mt-2">
          day streak
        </p>

      </motion.div>

      {/* HEATMAP */}

      <motion.div
        initial={{
          opacity:0,
          y:10
        }}
        animate={{
          opacity:1,
          y:0
        }}
        transition={{
          delay:0.1
        }}
        className="card p-6 mb-6"
      >

        <h3 className="font-semibold text-accent-white mb-5">
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

      </motion.div>

      {/* ACHIEVEMENTS */}

      <div className="card p-6">

        <h3 className="font-semibold text-accent-white mb-4">
          Achievements
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {ACHIEVEMENTS.map(
            achievement=>{

            const unlocked =
              achievement.id ===
              'first_session'
                ? streak.activeDates.length > 0
                : achievement.id ===
                  'week_streak'
                ? streak.longestStreak >= 7
                : achievement.id ===
                  'month_streak'
                ? streak.longestStreak >= 30
                : totalMinutes >= 600

            return (

              <div
                key={achievement.id}
                className={cn(
                  'rounded-2xl p-4 border',

                  unlocked
                    ? 'bg-accent-green/10 border-accent-green/30'
                    : 'bg-bg-secondary border-border-subtle opacity-50'
                )}
              >

                <div className="text-2xl mb-2">
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
          })}

        </div>

      </div>

    </div>
  )
}

function MonthGrid({
  month,
  dailyStats,
}: {
  month: Date
  dailyStats: Record<string, any>
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

      <p className="text-xs text-accent-subtle mb-2">

        {format(
          month,
          'MMMM yyyy'
        )}

      </p>

      <div className="grid grid-cols-7 gap-1">

        {['S','M','T','W','T','F','S']
        .map((day,index)=>(
          <div
            key={index}
            className="text-center text-xs text-accent-subtle"
          >
            {day}
          </div>
        ))}

        {Array.from({
          length:startDay
        }).map((_,i)=>(
          <div key={i}/>
        ))}

        {days.map(day=>{

          const dateString =
            format(
              day,
              'yyyy-MM-dd'
            )

          const minutes =
            dailyStats[
              dateString
            ]?.focusMinutes || 0

          const intensity =
            Math.min(
              minutes/120,
              1
            )

          return(
            <div
              key={dateString}
              className="aspect-square rounded-md"
              title={`${minutes} minutes`}
              style={{
                backgroundColor:
                  minutes > 0
                    ? `rgba(126,224,129,${
                        0.2 + intensity*0.8
                      })`
                    : '#1E1E1E'
              }}
            />
          )
        })}

      </div>

    </div>
  )
}