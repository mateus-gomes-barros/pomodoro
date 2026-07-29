import { useState } from 'react'
import {
  AnimatePresence,
  motion,
} from 'framer-motion'
import {
  ChevronDown,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { useProjects } from '@/hooks/projects/useProjects'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { CircularProgress } from '@/components/ui/CircularProgress'
import {
  cn,
  formatTime,
} from '@/utils'

import type { SessionType } from '@/types'

const SESSION_LABELS: Record<
  SessionType,
  string
> = {
  work: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
}

const SESSION_TYPES: SessionType[] = [
  'work',
  'short_break',
  'long_break',
]

export function TimerPage() {
  const {
    status,
    sessionType,
    secondsLeft,
    settings,
    currentSessionCount,
    activeProjectId,
    start,
    pause,
    reset,
    switchSession,
    setActiveProject,
    updateSettings,
  } = usePomodoroStore()

  const projectsQuery = useProjects()

  const projects =
    projectsQuery.data ?? []

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

  const ringColor =
    sessionType === 'work'
      ? '#34d399'
      : '#60a5fa'

  const completedSessionDots =
    settings.sessionsUntilLongBreak > 0
      ? currentSessionCount %
        settings.sessionsUntilLongBreak
      : 0

  const isRunning =
    status === 'running'

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
            {SESSION_LABELS[type]}
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
        className="relative"
      >
        <CircularProgress
          progress={progress}
          size={260}
          strokeWidth={5}
          color={ringColor}
        >
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
              className="flex flex-col items-center"
            >
              <span className="font-mono text-[52px] font-bold leading-none tracking-[-3px] text-white sm:text-[56px]">
                {formatTime(
                  secondsLeft,
                )}
              </span>

              <span className="mt-2 text-[13px] text-white/40">
                {
                  SESSION_LABELS[
                    sessionType
                  ]
                }
              </span>
            </motion.div>
          </AnimatePresence>
        </CircularProgress>

        {isRunning &&
          sessionType === 'work' && (
            <div
              className="pointer-events-none absolute inset-0 animate-pulse rounded-full opacity-[0.07]"
              style={{
                background: `radial-gradient(circle, ${ringColor} 0%, transparent 70%)`,
              }}
            />
          )}
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
          aria-label="Reset timer"
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
              ? 'Mute sound'
              : 'Enable sound'
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
          <p className="label-section mb-3">
            Assign to Project
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
                : 'Unable to load projects.'}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setActiveProject(null)
                }
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-150',
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
                    title={project.name}
                    className={cn(
                      'flex max-w-full items-center gap-1.5 rounded-xl px-3 py-1.5',
                      'text-xs font-medium transition-all duration-150',
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
            Timer Settings
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
              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
                {([
                  [
                    'Focus',
                    settings.workDuration,
                    'workDuration',
                    5,
                    90,
                  ],
                  [
                    'Short Break',
                    settings.shortBreakDuration,
                    'shortBreakDuration',
                    1,
                    30,
                  ],
                  [
                    'Long Break',
                    settings.longBreakDuration,
                    'longBreakDuration',
                    5,
                    60,
                  ],
                  [
                    'Sessions until long break',
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