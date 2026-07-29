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

import { usePomodoroStore } from '@/store/pomodoroStore'
import { useStatsStore } from '@/store/statsStore'
import { useTasksStore } from '@/store/tasksStore'
import { useProjectsStore } from '@/store/projectsStore'

import { StatCard } from '@/components/ui/Card'
import { CircularProgress } from '@/components/ui/CircularProgress'

import {
  formatDuration,
  formatTime,
  getTodayString,
} from '@/utils'

const DAILY_GOAL_MINUTES = 120

const PRIORITY_COLORS = {
  high: '#f87171',
  medium: '#fb923c',
  low: '#6b7280',
} as const

export function DashboardPage() {
  const {
    status,
    sessionType,
    secondsLeft,
    settings,
    start,
    getTodayFocusMinutes,
  } = usePomodoroStore()

  const {
    streak,
    dailyStats,
  } = useStatsStore()

  const tasks = useTasksStore((state) => state.tasks)
  const projects = useProjectsStore((state) => state.projects)

  const todayFocus = getTodayFocusMinutes()
  const todayStats = dailyStats[getTodayString()]
  const progressRatio = Math.min(todayFocus / DAILY_GOAL_MINUTES, 1)

  const pendingTasks = tasks
    .filter((task) => !task.completed)
    .slice(0, 4)

  const totalSecs =
    sessionType === 'work'
      ? settings.workDuration * 60
      : sessionType === 'short_break'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60

  const timerProgress =
    status !== 'idle' && totalSecs > 0
      ? 1 - secondsLeft / totalSecs
      : 0

  const ringColor =
    sessionType === 'work'
      ? '#34d399'
      : '#60a5fa'

  const hour = new Date().getHours()

  const greeting =
    hour < 12
      ? 'morning'
      : hour < 17
        ? 'afternoon'
        : 'evening'

  return (
    <div className="w-full min-w-0 space-y-8">
      {/* Greeting */}

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <p className="label-section mb-2">
          {format(new Date(), 'EEEE, MMMM d')}
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Good {greeting}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-white/45">
          {todayFocus > 0
            ? `You've focused for ${formatDuration(todayFocus)} today.`
            : 'Start your first session to build momentum.'}
        </p>
      </motion.div>

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Focus"
          value={formatDuration(todayFocus)}
          sub={`Goal: ${formatDuration(DAILY_GOAL_MINUTES)}`}
          icon={<Timer size={15} />}
          delay={0}
        />

        <StatCard
          label="Streak"
          value={streak.currentStreak}
          sub={streak.currentStreak === 1 ? 'day' : 'days'}
          icon={<Flame size={15} />}
          accent={streak.currentStreak >= 3}
          delay={0.05}
        />

        <StatCard
          label="Tasks Done"
          value={todayStats?.tasksCompleted ?? 0}
          sub="today"
          icon={<CheckSquare size={15} />}
          delay={0.1}
        />

        <StatCard
          label="Sessions"
          value={todayStats?.sessionsCompleted ?? 0}
          sub="pomodoros"
          icon={<TrendingUp size={15} />}
          delay={0.15}
        />
      </div>

      {/* Main content */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Timer and daily progress */}

        <div className="flex min-w-0 flex-col gap-5 xl:col-span-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.1,
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="card flex min-h-[340px] flex-col items-center justify-center p-7"
          >
            <p className="label-section mb-6">
              {sessionType === 'work'
                ? 'Focus Session'
                : sessionType === 'short_break'
                  ? 'Short Break'
                  : 'Long Break'}
            </p>

            <CircularProgress
              progress={timerProgress}
              size={164}
              strokeWidth={5}
              color={ringColor}
            >
              <span className="font-mono text-[34px] font-bold tracking-tighter text-white">
                {formatTime(secondsLeft)}
              </span>
            </CircularProgress>

            <div className="mt-6">
              {status !== 'running' ? (
                <button
                  type="button"
                  onClick={start}
                  className="btn-primary"
                >
                  <Play size={14} />

                  {status === 'paused'
                    ? 'Resume'
                    : 'Start Session'}
                </button>
              ) : (
                <Link
                  to="/timer"
                  className="badge-green flex items-center gap-2 px-3 py-1.5"
                >
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Running
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="label-section">
                Daily Progress
              </span>

              <span className="font-mono text-xs text-white/40">
                {Math.round(progressRatio * 100)}%
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${progressRatio * 100}%`,
                }}
                transition={{
                  duration: 1,
                  ease: 'easeOut',
                  delay: 0.3,
                }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
              />
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-xs text-white/30">
                {formatDuration(todayFocus)}
              </span>

              <span className="text-xs text-white/30">
                {formatDuration(DAILY_GOAL_MINUTES)}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Tasks and projects */}

        <div className="flex min-w-0 flex-col gap-5 xl:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="label-section">
                Pending Tasks
              </span>

              <Link
                to="/tasks"
                className="flex items-center gap-1 text-xs text-white/35 transition-colors hover:text-white/65"
              >
                View all
                <ArrowRight size={12} />
              </Link>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <p className="text-sm text-white/30">
                  All tasks complete 🎉
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.2 + index * 0.05,
                    }}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.025] p-3.5"
                  >
                    <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full border border-white/20" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white/80">
                        {task.title}
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="font-mono text-xs text-white/30">
                          {task.completedPomodoros}/
                          {task.estimatedPomodoros} 🍅
                        </span>

                        <span
                          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              PRIORITY_COLORS[task.priority],
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="card p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="label-section">
                Projects
              </span>

              <Link
                to="/projects"
                className="flex items-center gap-1 text-xs text-white/35 transition-colors hover:text-white/65"
              >
                View all
                <ArrowRight size={12} />
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="flex min-h-[140px] items-center justify-center">
                <p className="text-sm text-white/30">
                  No projects yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 3).map((project, index) => {
                  const progress =
                    project.totalSessions > 0
                      ? Math.min(
                          project.completedSessions /
                            project.totalSessions,
                          1,
                        )
                      : 0

                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.28 + index * 0.06,
                      }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-lg">
                        {project.emoji}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-medium text-white/80">
                            {project.name}
                          </span>

                          <span className="flex-shrink-0 font-mono text-xs text-white/30">
                            {formatDuration(
                              project.totalFocusMinutes,
                            )}
                          </span>
                        </div>

                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${progress * 100}%`,
                            }}
                            transition={{
                              duration: 0.8,
                              ease: 'easeOut',
                              delay: 0.35 + index * 0.07,
                            }}
                            className="h-full rounded-full"
                            style={{
                              backgroundColor: project.color,
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}