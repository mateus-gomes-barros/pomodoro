import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'

import { usePomodoroStore } from '../store/pomodoroStore'
import { useProjectsStore } from '../store/projectsStore'

import { CircularProgress } from '../components/ui/CircularProgress'

import { formatTime, cn } from '../utils'

import type { SessionType } from '../types'

const SESSION_LABELS: Record<SessionType, string> = {
  work: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
}

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

  const projects = useProjectsStore((s) => s.projects)

  const [showSettings, setShowSettings] = useState(false)

  const totalSeconds =
    sessionType === 'work'
      ? settings.workDuration * 60
      : sessionType === 'short_break'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60

  const progress =
    status !== 'idle'
      ? 1 - secondsLeft / totalSeconds
      : 0

  const isWork = sessionType === 'work'

  const ringColor = isWork
    ? '#7EE081'
    : '#7EA8E0'

  const sessionsUntilLong =
    settings.sessionsUntilLongBreak || 4

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto flex flex-col items-center min-h-screen">

      {/* Session switcher */}

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-1 bg-bg-card rounded-2xl p-1 border border-border-subtle mt-4 mb-10"
      >
        {(
          ['work', 'short_break', 'long_break'] as SessionType[]
        ).map((type) => (
          <button
            key={type}
            onClick={() => switchSession(type)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              sessionType === type
                ? 'bg-bg-elevated text-accent-white'
                : 'text-accent-subtle hover:text-accent-muted'
            )}
          >
            {SESSION_LABELS[type]}
          </button>
        ))}
      </motion.div>

      {/* Timer */}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative mb-10"
      >
        <CircularProgress
          progress={progress}
          size={280}
          strokeWidth={5}
          color={ringColor}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={secondsLeft}
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-6xl font-bold font-mono text-accent-white">
                {formatTime(secondsLeft)}
              </span>

              <span className="text-accent-subtle text-sm mt-2">
                {SESSION_LABELS[sessionType]}
              </span>
            </motion.div>
          </AnimatePresence>
        </CircularProgress>

        {status === 'running' && isWork && (
          <div
            className="absolute inset-0 rounded-full opacity-10 animate-pulse pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${ringColor} 0%, transparent 70%)`,
            }}
          />
        )}
      </motion.div>

      {/* Session indicators */}

      <div className="flex items-center gap-2 mb-10">
        {Array.from({
          length: sessionsUntilLong,
        }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full',
              i <
                (currentSessionCount %
                  sessionsUntilLong)
                ? 'bg-accent-green'
                : 'bg-border-muted'
            )}
          />
        ))}

        <span className="text-xs text-accent-subtle ml-2">
          until long break
        </span>
      </div>

      {/* Controls */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-4 mb-10"
      >
        <button
          onClick={reset}
          className="w-12 h-12 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center"
        >
          <RotateCcw size={18} />
        </button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={
            status === 'running'
              ? pause
              : start
          }
          className={cn(
            'w-20 h-20 rounded-3xl flex items-center justify-center text-bg-primary shadow-glow',
            status === 'running'
              ? 'bg-accent-white'
              : 'bg-gradient-green'
          )}
        >
          {status === 'running' ? (
            <Pause size={28} />
          ) : (
            <Play size={28} />
          )}
        </motion.button>

        <button
          onClick={() =>
            updateSettings({
              soundEnabled:
                !settings.soundEnabled,
            })
          }
          className="w-12 h-12 rounded-2xl bg-bg-card border border-border-subtle flex items-center justify-center"
        >
          {settings.soundEnabled ? (
            <Volume2 size={18} />
          ) : (
            <VolumeX size={18} />
          )}
        </button>
      </motion.div>

      {/* Projects */}

      <div className="w-full space-y-4">

        <div className="card p-4">
          <p className="label mb-3">
            Assign to Project
          </p>

          <div className="flex flex-wrap gap-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() =>
                  setActiveProject(
                    project.id
                  )
                }
                className={cn(
                  'px-3 py-2 rounded-xl text-sm',
                  activeProjectId ===
                    project.id
                    ? 'bg-bg-elevated text-accent-white'
                    : 'bg-bg-secondary text-accent-subtle'
                )}
              >
                {project.emoji} {project.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() =>
            setShowSettings(
              !showSettings
            )
          }
          className="card p-4 w-full flex justify-between items-center"
        >
          <span>Timer Settings</span>

          <motion.div
            animate={{
              rotate:
                showSettings
                  ? 180
                  : 0,
            }}
          >
            <ChevronDown size={18} />
          </motion.div>
        </button>

        <AnimatePresence>
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
              className="card p-5 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4">

                <DurationInput
                  label="Focus"
                  value={settings.workDuration}
                  onChange={(v) =>
                    updateSettings({
                      workDuration: v,
                    })
                  }
                  min={5}
                  max={90}
                />

                <DurationInput
                  label="Short Break"
                  value={settings.shortBreakDuration}
                  onChange={(v) =>
                    updateSettings({
                      shortBreakDuration: v,
                    })
                  }
                  min={1}
                  max={30}
                />

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}

function DurationInput({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <div>
      <label className="label mb-2 block">
        {label}
      </label>

      <div className="flex gap-2 items-center">

        <button
          onClick={() =>
            onChange(
              Math.max(
                min,
                value - 1
              )
            )
          }
        >
          −
        </button>

        <span>{value}m</span>

        <button
          onClick={() =>
            onChange(
              Math.min(
                max,
                value + 1
              )
            )
          }
        >
          +
        </button>

      </div>
    </div>
  )
}