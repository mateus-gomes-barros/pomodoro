import { useMemo } from 'react'
import { enUS, ptBR } from 'date-fns/locale'
import { format, isBefore, isToday } from 'date-fns'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  LoaderCircle,
  Play,
  Sparkles,
  Timer,
  TriangleAlert,
} from 'lucide-react'
import {
  Link,
  useNavigate,
} from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useAuth } from '@/contexts/AuthContext'
import { usePomodoroSessions } from '@/hooks/pomodoro/usePomodoroSessions'
import {
  useTasks,
  useToggleTask,
  useUpdateTask,
} from '@/hooks/tasks/useTasks'
import { useProjects } from '@/hooks/projects/useProjects'
import { usePomodoroStore } from '@/store/pomodoroStore'
import type { Task } from '@/types'
import {
  formatDuration,
  formatLocalDate,
  formatTime,
  getTodayString,
} from '@/utils'

const CATEGORY_WEIGHT = {
  urgent: 0,
  quick: 1,
  planned: 2,
  long_term: 3,
} as const

const PRIORITY_WEIGHT = {
  high: 0,
  medium: 1,
  low: 2,
} as const

function sortPlanTasks(a: Task, b: Task) {
  const priorityA = a.dailyPriority ?? 99
  const priorityB = b.dailyPriority ?? 99

  if (priorityA !== priorityB) {
    return priorityA - priorityB
  }

  const orderA = a.dailyOrder ?? a.order
  const orderB = b.dailyOrder ?? b.order

  return orderA - orderB
}

function sortSuggestions(a: Task, b: Task) {
  const categoryDifference =
    CATEGORY_WEIGHT[a.category] -
    CATEGORY_WEIGHT[b.category]

  if (categoryDifference !== 0) {
    return categoryDifference
  }

  const priorityDifference =
    PRIORITY_WEIGHT[a.priority] -
    PRIORITY_WEIGHT[b.priority]

  if (priorityDifference !== 0) {
    return priorityDifference
  }

  return a.order - b.order
}

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const {
    status,
    sessionType,
    secondsLeft,
    settings,
    activeTaskId,
    start,
    switchSession,
    setActiveProject,
    setActiveTask,
  } = usePomodoroStore()

  const sessionsQuery =
    usePomodoroSessions()
  const tasksQuery = useTasks()
  const projectsQuery = useProjects()
  const updateTask = useUpdateTask()
  const toggleTask = useToggleTask()

  const sessions =
    sessionsQuery.data ?? []
  const tasks = tasksQuery.data ?? []
  const projects =
    projectsQuery.data ?? []

  const today = getTodayString()

  const todaySessions = useMemo(
    () =>
      sessions.filter(
        (session) =>
          session.type === 'work' &&
          session.date === today,
      ),
    [sessions, today],
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

  const todayPlan = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            task.plannedDate === today,
        )
        .sort(sortPlanTasks),
    [tasks, today],
  )

  const pendingToday = todayPlan.filter(
    (task) => !task.completed,
  )

  const completedToday = todayPlan.filter(
    (task) => task.completed,
  )

  const suggestions = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            !task.completed &&
            task.plannedDate !== today,
        )
        .sort(sortSuggestions)
        .slice(0, 3),
    [tasks, today],
  )

  const activeTask = tasks.find(
    (task) =>
      task.id === activeTaskId &&
      !task.completed,
  )

  const hasActiveSession =
    status === 'running' ||
    status === 'paused'

  const nextTask =
    hasActiveSession && activeTask
      ? activeTask
      : pendingToday[0]

  const urgentTask = tasks
    .filter(
      (task) =>
        !task.completed &&
        task.id !== nextTask?.id,
    )
    .find((task) => {
      if (task.category === 'urgent') {
        return true
      }

      if (!task.dueAt) {
        return false
      }

      const dueDate = new Date(task.dueAt)

      return (
        isToday(dueDate) ||
        isBefore(dueDate, new Date())
      )
    })

  const dailyGoal =
    settings.dailyFocusGoalMinutes ??
    120

  const focusRatio = Math.min(
    todayFocus / dailyGoal,
    1,
  )

  const taskRatio =
    todayPlan.length > 0
      ? completedToday.length /
        todayPlan.length
      : 0

  const projectById = useMemo(
    () =>
      new Map(
        projects.map((project) => [
          project.id,
          project,
        ]),
      ),
    [projects],
  )

  const dateLocale =
    i18n.language === 'pt-BR'
      ? ptBR
      : enUS

  const metadataName =
    user?.user_metadata?.display_name ??
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name

  const displayName =
    typeof metadataName === 'string'
      ? metadataName.trim()
      : ''

  const hour = new Date().getHours()

  const greetingKey =
    hour < 12
      ? 'morning'
      : hour < 17
        ? 'afternoon'
        : 'evening'

  const insightKey =
    todayFocus >= dailyGoal
      ? 'insightComplete'
      : focusRatio >= 0.5
        ? 'insightHalfway'
        : todaySessions.length > 0
          ? 'insightBuilding'
          : 'insightStart'

  const isLoading =
    sessionsQuery.isLoading ||
    tasksQuery.isLoading ||
    projectsQuery.isLoading

  const error =
    sessionsQuery.error ??
    tasksQuery.error ??
    projectsQuery.error

  function addToToday(task: Task) {
    updateTask.mutate({
      taskId: task.id,
      input: {
        plannedDate: today,
        dailyOrder: todayPlan.length,
        dailyPriority: null,
      },
    })
  }

  function completeTask(task: Task) {
    toggleTask.mutate(task)
  }

  function startTask(task: Task) {
    if (
      hasActiveSession &&
      activeTaskId === task.id
    ) {
      navigate('/timer')
      return
    }

    if (hasActiveSession) {
      navigate('/timer')
      return
    }

    if (sessionType !== 'work') {
      switchSession('work')
    }

    setActiveTask(task.id)
    setActiveProject(
      task.projectId ?? null,
    )
    start()
    navigate('/timer')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center">
        <LoaderCircle
          size={30}
          className="animate-spin text-white/40"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="card p-6">
        <p className="text-sm text-red-400">
          {error instanceof Error
            ? error.message
            : t('dashboard.error')}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full min-w-0 space-y-6 lg:space-y-7">
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <p className="label-section mb-2">
          {format(
            new Date(),
            i18n.language === 'pt-BR'
              ? "EEEE, d 'de' MMMM"
              : 'EEEE, MMMM d',
            { locale: dateLocale },
          )}
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          {t(
            'dashboard.greeting.' +
              greetingKey,
          )}
          {displayName
            ? ', ' + displayName
            : ''}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-white/45">
          {todayPlan.length > 0
            ? t(
                'dashboard.today.summaryWithPlan',
                {
                  count:
                    todayPlan.length,
                },
              )
            : t(
                'dashboard.today.summaryEmpty',
              )}
        </p>
      </motion.header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.05,
            duration: 0.35,
          }}
          className="relative overflow-hidden rounded-[28px] border border-emerald-400/15 bg-[radial-gradient(circle_at_top_right,rgba(52,211,153,0.16),transparent_40%),linear-gradient(145deg,rgba(14,24,20,0.96),rgba(7,12,10,0.98))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-8 xl:col-span-3"
        >
          <div className="relative z-10">
            <div className="mb-8 flex items-center justify-between gap-4">
              <span className="label-section text-emerald-300/80">
                {hasActiveSession &&
                activeTask
                  ? t(
                      'dashboard.today.activeEyebrow',
                    )
                  : t(
                      'dashboard.today.primaryEyebrow',
                    )}
              </span>

              {hasActiveSession && (
                <span className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.08] px-3 py-1.5 font-mono text-xs text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  {formatTime(
                    secondsLeft,
                  )}
                </span>
              )}
            </div>

            {nextTask ? (
              <>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.05] text-xl">
                    {nextTask.projectId
                      ? projectById.get(
                          nextTask.projectId,
                        )?.emoji ?? '✓'
                      : '✓'}
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
                      {nextTask.title}
                    </h2>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/40">
                      {nextTask.projectId &&
                        projectById.get(
                          nextTask.projectId,
                        ) && (
                          <span>
                            {
                              projectById.get(
                                nextTask.projectId,
                              )?.name
                            }
                          </span>
                        )}

                      <span className="flex items-center gap-1.5">
                        <Clock3 size={13} />
                        {nextTask
                          .estimatedPomodoros ===
                        1
                          ? t(
                              'dashboard.today.oneEstimatedSession',
                            )
                          : t(
                              'dashboard.today.estimatedSessions',
                              {
                                count:
                                  nextTask.estimatedPomodoros,
                              },
                            )}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    startTask(nextTask)
                  }
                  className="btn-primary mt-9"
                >
                  <Play size={15} />
                  {hasActiveSession
                    ? t(
                        'dashboard.today.continueFocus',
                      )
                    : t(
                        'dashboard.today.startFocus',
                      )}
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                  {t(
                    'dashboard.today.noTaskTitle',
                  )}
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/45">
                  {t(
                    'dashboard.today.noTaskDescription',
                  )}
                </p>

                <Link
                  to="/tasks"
                  className="btn-primary mt-8 inline-flex"
                >
                  <CalendarDays size={15} />
                  {t(
                    'dashboard.today.planDay',
                  )}
                </Link>
              </>
            )}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.1,
            duration: 0.35,
          }}
          className="card flex flex-col p-6 xl:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between">
            <span className="label-section">
              {t(
                'dashboard.today.progressTitle',
              )}
            </span>

            <span className="font-mono text-xs text-white/35">
              {Math.round(
                focusRatio * 100,
              )}
              %
            </span>
          </div>

          <div className="grid flex-1 grid-cols-3 gap-3">
            <div>
              <p className="text-2xl font-semibold text-white">
                {completedToday.length}
                <span className="text-white/25">
                  /{todayPlan.length}
                </span>
              </p>
              <p className="mt-1 text-xs text-white/35">
                {t(
                  'dashboard.today.plannedTasks',
                )}
              </p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-white">
                {formatDuration(
                  todayFocus,
                )}
              </p>
              <p className="mt-1 text-xs text-white/35">
                {t(
                  'dashboard.today.focusTime',
                )}
              </p>
            </div>

            <div>
              <p className="text-2xl font-semibold text-white">
                {todaySessions.length}
              </p>
              <p className="mt-1 text-xs text-white/35">
                {t(
                  'dashboard.today.sessions',
                )}
              </p>
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-2 flex justify-between text-xs text-white/30">
              <span>
                {formatDuration(
                  todayFocus,
                )}
              </span>
              <span>
                {formatDuration(
                  dailyGoal,
                )}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width:
                    focusRatio * 100 + '%',
                }}
                transition={{
                  delay: 0.25,
                  duration: 0.8,
                }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
              />
            </div>
          </div>
        </motion.section>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6 xl:col-span-3"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {t(
                  'dashboard.today.planTitle',
                )}
              </h2>
              {todayPlan.length > 0 && (
                <p className="mt-1 text-xs text-white/35">
                  {Math.round(
                    taskRatio * 100,
                  )}
                  % {t(
                    'dashboard.today.completed',
                  ).toLowerCase()}
                </p>
              )}
            </div>

            <Link
              to="/tasks"
              className="flex items-center gap-1 text-xs text-white/35 transition-colors hover:text-white/70"
            >
              {t(
                'dashboard.today.viewAllTasks',
              )}
              <ArrowRight size={12} />
            </Link>
          </div>

          {todayPlan.length === 0 ? (
            <div className="flex min-h-[130px] items-center justify-center rounded-2xl border border-dashed border-white/[0.08]">
              <p className="text-sm text-white/30">
                {t(
                  'dashboard.today.planEmpty',
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayPlan.map(
                (task, index) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 rounded-2xl border border-white/[0.04] bg-white/[0.025] p-3.5"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        completeTask(task)
                      }
                      aria-label={
                        task.completed
                          ? t(
                              'dashboard.today.completed',
                            )
                          : task.title
                      }
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-emerald-300 transition-colors hover:border-emerald-400/40"
                    >
                      {task.completed ? (
                        <Check size={13} />
                      ) : (
                        <Circle
                          size={10}
                          className="opacity-30"
                        />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <p
                        className={
                          'truncate text-sm ' +
                          (task.completed
                            ? 'text-white/25 line-through'
                            : 'text-white/80')
                        }
                      >
                        {task.title}
                      </p>

                      <p className="mt-1 text-xs text-white/25">
                        {task.dailyPriority
                          ? '#' +
                            task.dailyPriority +
                            ' · '
                          : ''}
                        {task.estimatedPomodoros}{' '}
                        × {settings.workDuration}
                        min
                      </p>
                    </div>

                    {!task.completed && (
                      <button
                        type="button"
                        onClick={() =>
                          startTask(task)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] text-white/35 transition-colors hover:bg-emerald-400/10 hover:text-emerald-300"
                      >
                        <Play size={13} />
                      </button>
                    )}

                    <span className="w-4 text-right font-mono text-[10px] text-white/15">
                      {index + 1}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </motion.section>

        <div className="flex flex-col gap-5 xl:col-span-2">
          {urgentTask && (
            <motion.section
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{ delay: 0.18 }}
              className="rounded-[24px] border border-amber-400/15 bg-amber-400/[0.055] p-5"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                  <TriangleAlert
                    size={15}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="label-section text-amber-200/60">
                    {t(
                      'dashboard.today.urgentTitle',
                    )}
                  </p>
                  <p className="mt-2 truncate text-sm font-medium text-white/85">
                    {urgentTask.title}
                  </p>
                  <p className="mt-1 text-xs text-white/35">
                    {t(
                      'dashboard.today.urgentDescription',
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    addToToday(urgentTask)
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </motion.section>
          )}

          <motion.section
            initial={{
              opacity: 0,
              y: 8,
            }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.21 }}
            className="card p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <Sparkles size={16} />
              </div>

              <div>
                <p className="label-section">
                  {t(
                    'dashboard.today.insightTitle',
                  )}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {t(
                    'dashboard.today.' +
                      insightKey,
                  )}
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {suggestions.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="card p-6"
        >
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {t(
                  'dashboard.today.suggestionsTitle',
                )}
              </h2>
              <p className="mt-1 text-xs text-white/35">
                {t(
                  'dashboard.today.suggestionsDescription',
                )}
              </p>
            </div>

            <Timer
              size={16}
              className="text-white/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {suggestions.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() =>
                  addToToday(task)
                }
                disabled={
                  updateTask.isPending
                }
                className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4 text-left transition-colors hover:border-emerald-400/15 hover:bg-emerald-400/[0.04]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-base">
                  {task.projectId
                    ? projectById.get(
                        task.projectId,
                      )?.emoji ?? '＋'
                    : '＋'}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-white/70">
                    {task.title}
                  </span>
                  <span className="mt-1 block text-xs text-white/25">
                    {t(
                      'dashboard.today.addToToday',
                    )}
                  </span>
                </span>

                <ChevronRight
                  size={14}
                  className="shrink-0 text-white/15 transition-transform group-hover:translate-x-0.5 group-hover:text-emerald-300"
                />
              </button>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}
