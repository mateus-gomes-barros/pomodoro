import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckSquare,
  Flame,
  LoaderCircle,
  Play,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  format,
  subDays,
} from 'date-fns'

import { usePomodoroStore } from '@/store/pomodoroStore'
import { usePomodoroSessions } from '@/hooks/pomodoro/usePomodoroSessions'
import { useTasks } from '@/hooks/tasks/useTasks'
import { useProjects } from '@/hooks/projects/useProjects'
import { useGoals } from '@/hooks/goals/useGoals'

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

function calculateCurrentStreak(
  activeDates: string[],
): number {
  const uniqueDates = new Set(activeDates)

  const today = new Date()
  const todayString = format(
    today,
    'yyyy-MM-dd',
  )

  const yesterday = subDays(today, 1)
  const yesterdayString = format(
    yesterday,
    'yyyy-MM-dd',
  )

  let currentDate: Date | null =
    uniqueDates.has(todayString)
      ? today
      : uniqueDates.has(yesterdayString)
        ? yesterday
        : null

  let currentStreak = 0

  while (currentDate) {
    const dateString = format(
      currentDate,
      'yyyy-MM-dd',
    )

    if (!uniqueDates.has(dateString)) {
      break
    }

    currentStreak += 1
    currentDate = subDays(
      currentDate,
      1,
    )
  }

  return currentStreak
}

export function DashboardPage() {
  const {
    status,
    sessionType,
    secondsLeft,
    settings,
    start,
  } = usePomodoroStore()

  const sessionsQuery =
    usePomodoroSessions()

  const tasksQuery = useTasks()
  const projectsQuery = useProjects()
  const currentYear =
  new Date().getFullYear()

const goalsQuery =
  useGoals(currentYear)

  const sessions =
    sessionsQuery.data ?? []

  const tasks = tasksQuery.data ?? []
  const projects =
    projectsQuery.data ?? []
  
    const goals =
  goalsQuery.data ?? []

const completedGoalsThisYear =
  goals.filter(
    (goal) => goal.completed,
  ).length

  const today = getTodayString()

  const workSessions = useMemo(
    () =>
      sessions.filter(
        (session) =>
          session.type === 'work',
      ),
    [sessions],
  )

  const todaySessions = useMemo(
    () =>
      workSessions.filter(
        (session) =>
          session.date === today,
      ),
    [today, workSessions],
  )

  const todayFocus = useMemo(
    () =>
      todaySessions.reduce(
        (total, session) =>
          total +
          session.durationMinutes,
        0,
      ),
    [todaySessions],
  )

  const todayCompletedTasks =
    useMemo(
      () =>
        tasks.filter((task) => {
          if (
            !task.completed ||
            !task.completedAt
          ) {
            return false
          }

          return (
            task.completedAt.split(
              'T',
            )[0] === today
          )
        }).length,
      [tasks, today],
    )

  const currentStreak = useMemo(
    () =>
      calculateCurrentStreak(
        workSessions.map(
          (session) =>
            session.date,
        ),
      ),
    [workSessions],
  )

  const projectFocusMinutes =
    useMemo(() => {
      const totals = new Map<
        string,
        number
      >()

      workSessions.forEach(
        (session) => {
          if (!session.projectId) {
            return
          }

          totals.set(
            session.projectId,
            (totals.get(
              session.projectId,
            ) ?? 0) +
              session.durationMinutes,
          )
        },
      )

      return totals
    }, [workSessions])

  const progressRatio = Math.min(
    todayFocus /
      DAILY_GOAL_MINUTES,
    1,
  )

  const pendingTasks = tasks
    .filter(
      (task) => !task.completed,
    )
    .slice(0, 4)

  const totalSecs =
    sessionType === 'work'
      ? settings.workDuration * 60
      : sessionType ===
          'short_break'
        ? settings.shortBreakDuration *
          60
        : settings.longBreakDuration *
          60

  const timerProgress =
    status !== 'idle' &&
    totalSecs > 0
      ? 1 -
        secondsLeft / totalSecs
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

        const isLoading =
        sessionsQuery.isLoading ||
        tasksQuery.isLoading ||
        projectsQuery.isLoading ||
        goalsQuery.isLoading

        const isError =
        sessionsQuery.isError ||
        tasksQuery.isError ||
        projectsQuery.isError ||
        goalsQuery.isError

        const error =
        sessionsQuery.error ??
        tasksQuery.error ??
        projectsQuery.error ??
        goalsQuery.error

  if (isLoading) {
    return (
      <div className="w-full min-w-0 space-y-8">
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
        <div className="card p-6">
          <p className="text-sm text-red-400">
            {error instanceof Error
              ? error.message
              : 'An unexpected error occurred while loading the dashboard.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-8">
      {/* Greeting */}

      <motion.div
        initial={{
          opacity: 0,
          y: -6,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.3,
          ease: [
            0.16,
            1,
            0.3,
            1,
          ],
        }}
      >
        <p className="label-section mb-2">
          {format(
            new Date(),
            'EEEE, MMMM d',
          )}
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          Good {greeting}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-white/45">
          {todayFocus > 0
            ? `You've focused for ${formatDuration(
                todayFocus,
              )} today.`
            : 'Start your first session to build momentum.'}
        </p>
      </motion.div>

      {/* Statistics */}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Focus"
          value={formatDuration(
            todayFocus,
          )}
          sub={`Goal: ${formatDuration(
            DAILY_GOAL_MINUTES,
          )}`}
          icon={<Timer size={15} />}
          delay={0}
        />

        <StatCard
          label="Streak"
          value={currentStreak}
          sub={
            currentStreak === 1
              ? 'day'
              : 'days'
          }
          icon={<Flame size={15} />}
          accent={
            currentStreak >= 3
          }
          delay={0.05}
        />

        <StatCard
          label="Tasks Done"
          value={
            todayCompletedTasks
          }
          sub="today"
          icon={
            <CheckSquare
              size={15}
            />
          }
          delay={0.1}
        />

        <StatCard
          label="Sessions"
          value={
            todaySessions.length
          }
          sub="pomodoros"
          icon={
            <TrendingUp
              size={15}
            />
          }
          delay={0.15}
        />
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.18,
          duration: 0.35,
          ease: [
            0.16,
            1,
            0.3,
            1,
          ],
        }}
      >
        <Link
          to="/goals"
          className="
            card
            group
            flex
            items-center
            justify-between
            gap-5
            px-5
            py-4
            transition-colors
            hover:border-emerald-400/20
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-emerald-400/10
                text-accent-green
              "
            >
              <Target size={17} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                Goals done this year
              </p>

              <p className="mt-0.5 text-xs text-white/35">
                View your {currentYear} goals
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <span className="text-2xl font-semibold text-white">
              {completedGoalsThisYear}
            </span>

            <ArrowRight
              size={16}
              className="
                text-white/25
                transition-transform
                group-hover:translate-x-1
                group-hover:text-accent-green
              "
            />
          </div>
        </Link>
      </motion.div>

      {/* Main content */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Timer and daily progress */}

        <div className="flex min-w-0 flex-col gap-5 xl:col-span-2">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              delay: 0.1,
              duration: 0.35,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            className="card flex min-h-[340px] flex-col items-center justify-center p-7"
          >
            <p className="label-section mb-6">
              {sessionType ===
              'work'
                ? 'Focus Session'
                : sessionType ===
                    'short_break'
                  ? 'Short Break'
                  : 'Long Break'}
            </p>

            <CircularProgress
              progress={
                timerProgress
              }
              size={164}
              strokeWidth={5}
              color={ringColor}
            >
              <span className="font-mono text-[34px] font-bold tracking-tighter text-white">
                {formatTime(
                  secondsLeft,
                )}
              </span>
            </CircularProgress>

            <div className="mt-6">
              {status !==
              'running' ? (
                <button
                  type="button"
                  onClick={start}
                  className="btn-primary"
                >
                  <Play size={14} />

                  {status ===
                  'paused'
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
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="card p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="label-section">
                Daily Progress
              </span>

              <span className="font-mono text-xs text-white/40">
                {Math.round(
                  progressRatio *
                    100,
                )}
                %
              </span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{
                  width: 0,
                }}
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
                {formatDuration(
                  todayFocus,
                )}
              </span>

              <span className="text-xs text-white/30">
                {formatDuration(
                  DAILY_GOAL_MINUTES,
                )}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Tasks and projects */}

        <div className="flex min-w-0 flex-col gap-5 xl:col-span-3">
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
              delay: 0.15,
            }}
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
                <ArrowRight
                  size={12}
                />
              </Link>
            </div>

            {pendingTasks.length ===
            0 ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <p className="text-sm text-white/30">
                  All tasks complete
                  🎉
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingTasks.map(
                  (
                    task,
                    index,
                  ) => (
                    <motion.div
                      key={task.id}
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
                          0.2 +
                          index *
                            0.05,
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
                            {
                              task.completedPomodoros
                            }
                            /
                            {
                              task.estimatedPomodoros
                            }{' '}
                            🍅
                          </span>

                          <span
                            className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                PRIORITY_COLORS[
                                  task
                                    .priority
                                ],
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ),
                )}
              </div>
            )}
          </motion.div>

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
              delay: 0.22,
            }}
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
                <ArrowRight
                  size={12}
                />
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
                {projects
                  .slice(0, 3)
                  .map(
                    (
                      project,
                      index,
                    ) => {
                      const progress =
                        project.totalSessions >
                        0
                          ? Math.min(
                              project.completedSessions /
                                project.totalSessions,
                              1,
                            )
                          : 0

                      const focusMinutes =
                        projectFocusMinutes.get(
                          project.id,
                        ) ?? 0

                      return (
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
                              0.28 +
                              index *
                                0.06,
                          }}
                          className="flex items-center gap-3"
                        >
                          <span className="text-lg">
                            {
                              project.emoji
                            }
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <span className="truncate text-sm font-medium text-white/80">
                                {
                                  project.name
                                }
                              </span>

                              <span className="flex-shrink-0 font-mono text-xs text-white/30">
                                {formatDuration(
                                  focusMinutes,
                                )}
                              </span>
                            </div>

                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                              <motion.div
                                initial={{
                                  width: 0,
                                }}
                                animate={{
                                  width: `${progress * 100}%`,
                                }}
                                transition={{
                                  duration: 0.8,
                                  ease: 'easeOut',
                                  delay:
                                    0.35 +
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
      </div>
    </div>
  )
}