import { motion } from 'framer-motion'
import {
  Timer,
  Flame,
  CheckSquare,
  TrendingUp,
  Play,
  ArrowRight,
} from 'lucide-react'

import { Link } from 'react-router-dom'
import { format } from 'date-fns'

import { usePomodoroStore } from '../store/pomodoroStore'
import { useStatsStore } from '../store/statsStore'
import { useTasksStore } from '../store/tasksStore'
import { useProjectsStore } from '../store/projectsStore'

import { StatCard } from '../components/ui/Card'
import { CircularProgress } from '../components/ui/CircularProgress'

import {
  formatDuration,
  formatTime,
  getTodayString,
} from '../utils'

const DAILY_GOAL_MINUTES = 120

export function DashboardPage() {
  const {
    status,
    sessionType,
    secondsLeft,
    settings,
    getTodayFocusMinutes,
  } = usePomodoroStore()

  const { streak, dailyStats } = useStatsStore()

  const tasks = useTasksStore(s => s.tasks)
  const projects = useProjectsStore(s => s.projects)

  const todayFocus = getTodayFocusMinutes()

  const todayStats =
    dailyStats[getTodayString()]

  const progressRatio = Math.min(
    todayFocus / DAILY_GOAL_MINUTES,
    1
  )

  const todayTasks = tasks.filter(t =>
    t.createdAt.startsWith(getTodayString())
  )

  const completedToday =
    todayTasks.filter(t => t.completed).length

  const pendingTasks = tasks
    .filter(t => !t.completed)
    .slice(0, 4)

  const totalDuration =
    sessionType === 'work'
      ? settings.workDuration * 60
      : sessionType === 'short_break'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60

  const timerProgress =
    status !== 'idle'
      ? 1 - secondsLeft / totalDuration
      : 0

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">

      {/* Greeting */}

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="label mb-1">
          {format(
            new Date(),
            'EEEE, MMMM d'
          )}
        </p>

        <h1 className="text-3xl font-bold text-accent-white tracking-tight">
          Good {getGreeting()}
        </h1>

        <p className="text-accent-subtle mt-1 text-sm">
          {todayFocus > 0
            ? `You've focused for ${formatDuration(todayFocus)} today.`
            : 'Start your first session to build momentum.'}
        </p>
      </motion.div>

      {/* Stats */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

        <StatCard
          label="Today's Focus"
          value={formatDuration(todayFocus)}
          sub={`Goal: ${formatDuration(
            DAILY_GOAL_MINUTES
          )}`}
          icon={<Timer size={16} />}
        />

        <StatCard
          label="Current Streak"
          value={streak.currentStreak}
          sub={
            streak.currentStreak === 1
              ? 'day'
              : 'days'
          }
          icon={<Flame size={16} />}
          accent={streak.currentStreak >= 3}
          delay={0.05}
        />

        <StatCard
          label="Tasks Done"
          value={
            todayStats?.tasksCompleted ?? 0
          }
          sub="today"
          icon={<CheckSquare size={16} />}
          delay={0.1}
        />

        <StatCard
          label="Sessions"
          value={
            todayStats?.sessionsCompleted ?? 0
          }
          sub="pomodoros"
          icon={<TrendingUp size={16} />}
          delay={0.15}
        />

      </div>

      {/* Main */}

      <div className="grid lg:grid-cols-5 gap-6">

        <div className="lg:col-span-2 space-y-4">

          <motion.div
            className="card p-6 flex flex-col items-center"
          >

            <p className="label mb-4">
              {
                sessionType === 'work'
                ? 'Focus Session'
                : sessionType === 'short_break'
                ? 'Short Break'
                : 'Long Break'
              }
            </p>

            <CircularProgress
              progress={timerProgress}
              size={160}
              strokeWidth={4}
              color={
                sessionType === 'work'
                  ? '#7EE081'
                  : '#7EA8E0'
              }
            >

              <span className="text-4xl font-bold font-mono text-accent-white">
                {formatTime(secondsLeft)}
              </span>

            </CircularProgress>

            <Link
              to="/timer"
              className="mt-5 btn-primary flex items-center gap-2 text-sm"
            >
              <Play size={14}/>
              Open Timer
            </Link>

          </motion.div>

        </div>

        <div className="lg:col-span-3">

          <div className="card p-5">

            <div className="flex items-center justify-between mb-4">

              <span className="label">
                Pending Tasks
              </span>

              <Link
                to="/tasks"
                className="text-xs text-accent-subtle"
              >
                View all
              </Link>

            </div>

            <div className="space-y-2">

              {pendingTasks.map(task => (

                <div
                  key={task.id}
                  className="p-3 rounded-xl bg-bg-secondary"
                >
                  <p className="text-sm text-accent-white">
                    {task.title}
                  </p>
                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()

  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'

  return 'evening'
}