import { useState } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from 'framer-motion'
import {
  CheckCircle2,
  ChevronDown,
  Coffee,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  TimerReset,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { useProjects } from '@/hooks/projects/useProjects'
import {
  useTasks,
  useToggleTask,
} from '@/hooks/tasks/useTasks'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { CircularProgress } from '@/components/ui/CircularProgress'
import {
  FOCUS_HOME_COLORS,
  FocusHomeSymbol,
} from '@/components/focusme/FocusHomeSymbol'
import {
  FocusMeIcon,
} from '@/components/icons/FocusMeIcon'
import {
  useFocusHomeProfile,
} from '@/hooks/focusme/useFocusHomeProfile'
import {
  FOCUS_HOME_PREVIEW,
} from '@/config/focusHomePreview'
import {
  cn,
  formatTime,
} from '@/utils'

import type { SessionType } from '@/types'
import { useTranslation } from 'react-i18next'

const SESSION_LABEL_KEYS: Record<
  SessionType,
  string
> = {
  work: 'timer.session.work',
  short_break: 'timer.session.shortBreak',
  long_break: 'timer.session.longBreak',
}

const SESSION_TYPES: SessionType[] = [
  'work',
  'short_break',
  'long_break',
]

export function TimerPage() {
  const { t } = useTranslation()
  const shouldReduceMotion =
    useReducedMotion()

  const focusHomeProfileQuery =
    useFocusHomeProfile()

  const focusHome =
    FOCUS_HOME_PREVIEW ??
    focusHomeProfileQuery.data?.focusHome

  const {
    status,
    sessionType,
    secondsLeft,
    settings,
    currentSessionCount,
    activeProjectId,
    activeTaskId,
    start,
    pause,
    reset,
    switchSession,
    setActiveProject,
    setActiveTask,
    updateSettings,
  } = usePomodoroStore()

  const projectsQuery = useProjects()
  const tasksQuery = useTasks()
  const toggleTaskMutation = useToggleTask()

  const projects =
    projectsQuery.data ?? []

  const tasks = (tasksQuery.data ?? []).filter(
    (task) => !task.completed,
  )

  const activeTask = tasks.find(
    (task) => task.id === activeTaskId,
  )

  const [showSettings, setShowSettings] =
    useState(false)

  const totalSeconds =
    sessionType === 'work'
      ? settings.workDuration * 60
      : sessionType === 'short_break'
        ? settings.shortBreakDuration * 60
        : settings.longBreakDuration * 60

  const rawProgress =
    status !== 'idle' &&
    totalSeconds > 0
      ? 1 -
        secondsLeft / totalSeconds
      : 0

  const progress = Math.min(
    Math.max(rawProgress, 0),
    1,
  )

  const identityColor =
    focusHome
      ? FOCUS_HOME_COLORS[
          focusHome
        ]
      : '#34d399'

  const ringColor =
    focusHome
      ? identityColor
      : sessionType === 'work'
        ? '#34d399'
        : '#60a5fa'

  const completedSessionDots =
    settings.sessionsUntilLongBreak > 0
      ? currentSessionCount %
        settings.sessionsUntilLongBreak
      : 0

  const isRunning =
    status === 'running'

  const isSessionCompleted =
    status === 'completed'

  const completedWorkSession =
    isSessionCompleted &&
    sessionType !== 'work'

  const handleContinueFocus = () => {
    switchSession('work')
    usePomodoroStore.getState().start()
  }

  const handleStartBreak = () => {
    usePomodoroStore.getState().start()
  }

  const handleCompleteTask = async () => {
    if (!activeTask) {
      return
    }

    await toggleTaskMutation.mutateAsync(
      activeTask,
    )
    setActiveTask(null)
  }

  const handleChooseAnotherTask = () => {
    setActiveTask(null)
    switchSession('work')
  }

  return (
    <div className="mx-auto flex w-full max-w-xl min-w-0 flex-col items-center space-y-7">
      {/* Session type switcher */}

      <motion.div
        initial={{
          opacity: 0,
          y: -6,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="segment grid w-full grid-cols-3 sm:w-auto"
      >
        {SESSION_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              switchSession(type)
            }
            disabled={isRunning}
            className={cn(
              'segment-item min-w-0 whitespace-nowrap',
              sessionType === type
                ? 'active'
                : 'inactive',
              isRunning &&
                'cursor-not-allowed opacity-60',
            )}
          >
            {t(SESSION_LABEL_KEYS[type])}
          </button>
        ))}
      </motion.div>

      {/* Timer ring */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.92,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration: 0.45,
          ease: [
            0.16,
            1,
            0.3,
            1,
          ],
        }}
        className="relative isolate"
      >
        {/* Outer glass halo */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 -z-10 rounded-full border border-white/[0.08] bg-white/[0.025] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_70px_rgba(0,0,0,0.32)] backdrop-blur-xl"
        />

        {/* Inner translucent surface */}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-[11px] -z-10 overflow-hidden rounded-full border border-white/[0.055] bg-[radial-gradient(circle_at_42%_30%,rgba(255,255,255,0.075),rgba(8,15,13,0.30)_42%,rgba(2,7,6,0.48)_78%)] shadow-[inset_0_1px_18px_rgba(255,255,255,0.025)] backdrop-blur-md"
        >
          <motion.div
            className="absolute -left-16 top-4 h-20 w-72 rotate-[-18deg] bg-gradient-to-r from-transparent via-white/[0.045] to-transparent blur-xl"
            animate={
              shouldReduceMotion ||
              status !== 'running'
                ? {
                    x: 0,
                  }
                : {
                    x: [
                      -35,
                      35,
                      -35,
                    ],
                  }
            }
            transition={{
              duration: 8,
              repeat:
                shouldReduceMotion ||
                status !== 'running'
                  ? 0
                  : Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <CircularProgress
          progress={progress}
          size={260}
          strokeWidth={5}
          color={ringColor}
        >
          <div className="relative flex h-[210px] w-[210px] items-center justify-center overflow-hidden rounded-full">
            {/* FocushoMe identity */}

            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              animate={
                shouldReduceMotion
                  ? {
                      opacity: 0.16,
                      scale: 1,
                    }
                  : status === 'running'
                    ? {
                        opacity: [
                          0.13,
                          0.24,
                          0.13,
                        ],
                        scale: [
                          0.96,
                          1.045,
                          0.96,
                        ],
                      }
                    : status === 'completed'
                      ? {
                          opacity: [
                            0.16,
                            0.38,
                            0.16,
                          ],
                          scale: [
                            1,
                            1.2,
                            1,
                          ],
                        }
                      : {
                          opacity: 0.16,
                          scale: 1,
                        }
              }
              transition={
                status === 'running' &&
                !shouldReduceMotion
                  ? {
                      duration: 5.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }
                  : {
                      duration:
                        status ===
                        'completed'
                          ? 0.9
                          : 0.35,
                      ease: 'easeOut',
                    }
              }
              style={{
                filter: `drop-shadow(0 0 22px ${identityColor}66)`,
              }}
            >
              {focusHome ? (
                <FocusHomeSymbol
                  type={focusHome}
                  size={205}
                  className="h-[205px] w-[205px]"
                />
              ) : (
                <FocusMeIcon
                  size={185}
                  className="h-[185px] w-[185px]"
                  style={{
                    color:
                      identityColor,
                  }}
                />
              )}
            </motion.div>

            {/* Remaining time */}

            <AnimatePresence mode="wait">
              <motion.div
                key={`${sessionType}-${secondsLeft}`}
                initial={{
                  opacity: 0.65,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0.65,
                }}
                transition={{
                  duration: 0.12,
                }}
                className="relative z-10 flex flex-col items-center"
              >
                <span
                  className="font-mono text-[52px] font-bold leading-none tracking-[-3px] drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)] sm:text-[56px]"
                  style={{
                    color:
                      identityColor,
                    textShadow: `0 0 22px ${identityColor}38`,
                  }}
                >
                  {formatTime(
                    secondsLeft,
                  )}
                </span>

                <span className="mt-2 text-[13px] text-white/45 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
                  {t(
                    SESSION_LABEL_KEYS[
                      sessionType
                    ],
                  )}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </CircularProgress>
      </motion.div>

      {/* Session dots */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.15,
        }}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {Array.from({
          length:
            settings.sessionsUntilLongBreak,
        }).map((_, index) => (
          <div
            key={index}
            className="h-2 w-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                index <
                completedSessionDots
                  ? '#34d399'
                  : 'rgba(255,255,255,0.12)',
            }}
          />
        ))}

        <span className="ml-1 text-[11px] text-white/30">
          until long break
        </span>
      </motion.div>

      <AnimatePresence initial={false}>
        {isSessionCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="card w-full p-5"
          >
            <p className="label-section">
              {t(
                completedWorkSession
                  ? 'timer.completion.focusFinished'
                  : 'timer.completion.breakFinished',
              )}
            </p>

            <p className="mt-1 text-xs text-white/40">
              {activeTask
                ? t('timer.completion.taskContext', {
                    task: activeTask.title,
                  })
                : t('timer.completion.noTaskContext')}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleContinueFocus}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-xs font-semibold text-black transition-opacity hover:opacity-90"
              >
                <TimerReset size={15} />
                {t('timer.completion.continueFocus')}
              </button>

              {completedWorkSession && (
                <button
                  type="button"
                  onClick={handleStartBreak}
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/[0.1]"
                >
                  <Coffee size={15} />
                  {t('timer.completion.startBreak')}
                </button>
              )}

              {activeTask && (
                <button
                  type="button"
                  onClick={() => {
                    void handleCompleteTask()
                  }}
                  disabled={
                    toggleTaskMutation.isPending
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/[0.1] disabled:opacity-40"
                >
                  <CheckCircle2 size={15} />
                  {t('timer.completion.completeTask')}
                </button>
              )}

              <button
                type="button"
                onClick={handleChooseAnotherTask}
                className="rounded-xl bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-white/50 transition-colors hover:text-white/75"
              >
                {t(
                  activeTask
                    ? 'timer.completion.chooseTask'
                    : 'timer.completion.selectTask',
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer controls */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.2,
        }}
        className="flex items-center gap-4"
      >
        <button
          type="button"
          onClick={reset}
          className="btn-ghost h-11 w-11 justify-center p-0"
          aria-label={t('timer.status.reset')}
        >
          <RotateCcw size={16} />
        </button>

        <motion.button
          type="button"
          whileTap={{
            scale: 0.94,
          }}
          onClick={
            isRunning
              ? pause
              : start
          }
          className={cn(
            'flex h-[72px] w-[72px] items-center justify-center rounded-2xl font-bold text-black',
            'transition-all duration-150',
            isRunning
              ? 'bg-white hover:bg-white/85'
              : 'bg-gradient-to-br from-emerald-400 to-emerald-500 hover:opacity-90',
          )}
          style={{
            boxShadow:
              '0 0 24px rgba(52,211,153,0.18)',
          }}
          aria-label={
            isRunning
              ? 'Pause timer'
              : 'Start timer'
          }
        >
          {isRunning ? (
            <Pause size={26} />
          ) : (
            <Play
              size={26}
              className="translate-x-[1px]"
            />
          )}
        </motion.button>

        <button
          type="button"
          onClick={() =>
            updateSettings({
              soundEnabled:
                !settings.soundEnabled,
            })
          }
          className="btn-ghost h-11 w-11 justify-center p-0"
          aria-label={
            settings.soundEnabled
              ? t('timer.sound.mute')
              : t('timer.sound.enable')
          }
        >
          {settings.soundEnabled ? (
            <Volume2 size={16} />
          ) : (
            <VolumeX size={16} />
          )}
        </button>
      </motion.div>

      {/* Project and timer settings */}

      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{
          delay: 0.28,
        }}
        className="w-full space-y-3"
      >
        <div className="card p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="label-section">
                {t('timer.tasks.assign')}
              </p>
              {activeTask && (
                <p className="mt-1 text-xs text-white/40">
                  {t('timer.tasks.progress', {
                    completed: activeTask.completedPomodoros,
                    estimated: activeTask.estimatedPomodoros,
                  })}
                </p>
              )}
            </div>
            {activeTask && (
              <button
                type="button"
                onClick={() => setActiveTask(null)}
                disabled={isRunning}
                className="text-xs text-white/35 transition-colors hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t('timer.tasks.clear')}
              </button>
            )}
          </div>

          {tasksQuery.isLoading ? (
            <div className="flex min-h-10 items-center justify-center">
              <LoaderCircle
                size={18}
                className="animate-spin text-white/35"
              />
            </div>
          ) : tasksQuery.isError ? (
            <p className="text-xs text-red-400">
              {t('timer.tasks.loadError')}
            </p>
          ) : tasks.length === 0 ? (
            <p className="text-xs text-white/35">
              {t('timer.tasks.empty')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  disabled={isRunning}
                  onClick={() => {
                    setActiveTask(task.id)
                    setActiveProject(
                      task.projectId ?? null,
                    )
                  }}
                  title={task.title}
                  className={cn(
                    'max-w-full rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150',
                    activeTaskId === task.id
                      ? 'border border-emerald-300/30 bg-emerald-300/10 text-emerald-300'
                      : 'bg-white/[0.04] text-white/40 hover:text-white/60',
                    isRunning && 'cursor-not-allowed opacity-60',
                  )}
                >
                  <span className="block max-w-[260px] truncate">
                    {task.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <p className="label-section mb-3">
            {t('timer.projects.assign')}
          </p>

          {projectsQuery.isLoading ? (
            <div className="flex min-h-10 items-center justify-center">
              <LoaderCircle
                size={18}
                className="animate-spin text-white/35"
              />
            </div>
          ) : projectsQuery.isError ? (
            <p className="text-xs text-red-400">
              {projectsQuery.error
                instanceof Error
                ? projectsQuery.error
                    .message
                : t('timer.projects.loadError')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveProject(null)
                }
                disabled={isRunning}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150',
                  isRunning && 'cursor-not-allowed opacity-60',
                  activeProjectId ===
                    null
                    ? 'bg-white/10 text-white'
                    : 'bg-white/[0.04] text-white/40 hover:text-white/60',
                )}
              >
                None
              </button>

              {projects.map(
                (project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() =>
                      setActiveProject(
                        project.id,
                      )
                    }
                    disabled={isRunning}
                    title={project.name}
                    className={cn(
                      'flex max-w-full items-center gap-1.5 rounded-xl px-3 py-1.5',
                      'text-xs font-medium transition-all duration-150',
                      isRunning && 'cursor-not-allowed opacity-60',
                      activeProjectId ===
                        project.id
                        ? 'border border-white/10 bg-white/10 text-white'
                        : 'bg-white/[0.04] text-white/40 hover:text-white/60',
                    )}
                  >
                    <span className="flex-shrink-0">
                      {
                        project.emoji
                      }
                    </span>

                    <span className="max-w-[190px] truncate">
                      {
                        project.name
                      }
                    </span>
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        {/* Settings trigger */}

        <button
          type="button"
          onClick={() =>
            setShowSettings(
              (current) =>
                !current,
            )
          }
          className="card flex w-full items-center justify-between p-4 text-[13px] text-white/40 transition-colors hover:text-white/70"
          aria-expanded={
            showSettings
          }
        >
          <span>
            {t('timer.settings.title')}
          </span>

          <motion.span
            animate={{
              rotate:
                showSettings
                  ? 180
                  : 0,
            }}
            transition={{
              duration: 0.2,
            }}
          >
            <ChevronDown
              size={15}
            />
          </motion.span>
        </button>

        <AnimatePresence
          initial={false}
        >
          {showSettings && (
            <motion.div
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: 'auto',
              }}
              exit={{
                opacity: 0,
                height: 0,
              }}
              transition={{
                duration: 0.25,
                ease: [
                  0.16,
                  1,
                  0.3,
                  1,
                ],
              }}
              className="card overflow-hidden"
            >
              <div className="border-b border-white/[0.05] p-5">
                <div className="label-section mb-2">
                  {t(
                    'timer.settings.dailyGoal',
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateSettings({
                        dailyFocusGoalMinutes:
                          Math.max(
                            15,
                            (
                              settings
                                .dailyFocusGoalMinutes ??
                              120
                            ) - 15,
                          ),
                      })
                    }
                    disabled={
                      (
                        settings
                          .dailyFocusGoalMinutes ??
                        120
                      ) <= 15
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-white/60 disabled:opacity-30"
                  >
                    −
                  </button>

                  <span className="min-w-24 text-center font-mono text-sm text-white">
                    {
                      settings
                        .dailyFocusGoalMinutes ??
                      120
                    }
                    {' min'}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateSettings({
                        dailyFocusGoalMinutes:
                          Math.min(
                            720,
                            (
                              settings
                                .dailyFocusGoalMinutes ??
                              120
                            ) + 15,
                          ),
                      })
                    }
                    disabled={
                      (
                        settings
                          .dailyFocusGoalMinutes ??
                        120
                      ) >= 720
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] text-white/60 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <p className="mt-2 text-xs text-white/35">
                  {t(
                    'timer.settings.dailyGoalDescription',
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                {([
                  [
                    t('timer.settings.focus'),
                    settings.workDuration,
                    'workDuration',
                    5,
                    90,
                  ],
                  [
                    t('timer.settings.shortBreak'),
                    settings.shortBreakDuration,
                    'shortBreakDuration',
                    1,
                    30,
                  ],
                  [
                    t('timer.settings.longBreak'),
                    settings.longBreakDuration,
                    'longBreakDuration',
                    5,
                    60,
                  ],
                  [
                    t('timer.settings.sessionsUntilLongBreak'),
                    settings.sessionsUntilLongBreak,
                    'sessionsUntilLongBreak',
                    2,
                    8,
                  ],
                ] as const).map(
                  ([
                    label,
                    value,
                    key,
                    min,
                    max,
                  ]) => (
                    <div key={key}>
                      <div className="label-section mb-2">
                        {label}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={
                            isRunning ||
                            value <=
                              min
                          }
                          onClick={() =>
                            updateSettings(
                              {
                                [key]:
                                  Math.max(
                                    min,
                                    value -
                                      1,
                                  ),
                              },
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-base text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Decrease ${label}`}
                        >
                          −
                        </button>

                        <span className="w-12 text-center font-mono text-[13px] text-white">
                          {value}
                          {key !==
                            'sessionsUntilLongBreak' &&
                            'm'}
                        </span>

                        <button
                          type="button"
                          disabled={
                            isRunning ||
                            value >=
                              max
                          }
                          onClick={() =>
                            updateSettings(
                              {
                                [key]:
                                  Math.min(
                                    max,
                                    value +
                                      1,
                                  ),
                              },
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-base text-white/60 transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Increase ${label}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>

              <div className="border-t border-white/[0.05] p-5">
                <p className="label-section mb-3">
                  {t('timer.settings.automation')}
                </p>

                <div className="space-y-3">
                  {([
                    [
                      'autoStartBreaks',
                      t('timer.settings.autoStartBreaks'),
                      t('timer.settings.autoStartBreaksDescription'),
                      settings.autoStartBreaks,
                    ],
                    [
                      'autoStartWork',
                      t('timer.settings.autoStartWork'),
                      t('timer.settings.autoStartWorkDescription'),
                      settings.autoStartWork,
                    ],
                  ] as const).map(
                    ([
                      key,
                      label,
                      description,
                      enabled,
                    ]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-sm text-white/75">
                            {label}
                          </p>
                          <p className="mt-0.5 text-xs text-white/35">
                            {description}
                          </p>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={enabled}
                          onClick={() =>
                            updateSettings({
                              [key]: !enabled,
                            })
                          }
                          disabled={isRunning}
                          className={cn(
                            'relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                            enabled
                              ? 'bg-emerald-400'
                              : 'bg-white/10',
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-1 h-4 w-4 rounded-full bg-white transition-transform',
                              enabled
                                ? 'translate-x-5'
                                : 'translate-x-1',
                            )}
                          />
                        </button>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {isRunning && (
                <p className="border-t border-white/[0.05] px-5 py-3 text-xs text-white/30">
                  Pause or reset the
                  timer to change its
                  duration.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
