import { motion } from 'framer-motion'

import { useAuth } from '@/contexts/AuthContext'

import { usePomodoroStore } from '../store/pomodoroStore'
import { PageHeader } from '../components/ui/PageHeader'

export function SettingsPage() {
  const { settings, updateSettings } =
    usePomodoroStore()

  const {
    user,
    isDemoMode,
  } = useAuth()

  return (
    <div className="p-6 lg:p-10 max-w-xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="Customize your focus experience"
      />

      <div className="space-y-4">

        {/* ACCOUNT */}

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-accent-white mb-2">
            Account
          </h3>

          {isDemoMode ? (
            <>
              <p className="text-sm text-accent-white">
                Guest Mode
              </p>

              <p className="mt-2 text-sm text-accent-subtle">
                You're using Focus without an account.
                Your data is stored only on this
                device.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  className="rounded-xl bg-primary px-4 py-3 font-medium text-white opacity-60 cursor-not-allowed"
                >
                  Continue with Google
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-white/10 px-4 py-3 font-medium text-accent-subtle opacity-60 cursor-not-allowed"
                >
                  Exit Guest Mode
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-accent-white">
                Connected Account
              </p>

              <p className="mt-2 text-sm text-accent-subtle break-all">
                {user?.email}
              </p>

              <button
                type="button"
                className="mt-5 w-full rounded-xl border border-white/10 px-4 py-3 font-medium text-accent-subtle opacity-60 cursor-not-allowed"
              >
                Sign Out
              </button>
            </>
          )}
        </motion.div>

        {/* TIMER */}

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
            delay: 0,
          }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-accent-white mb-5">
            Timer Durations
          </h3>

          <div className="space-y-4">
            <Setting
              label="Focus session"
              value={settings.workDuration}
              unit="min"
              min={5}
              max={90}
              onChange={(v) =>
                updateSettings({
                  workDuration: v,
                })
              }
            />

            <Setting
              label="Short break"
              value={
                settings.shortBreakDuration
              }
              unit="min"
              min={1}
              max={30}
              onChange={(v) =>
                updateSettings({
                  shortBreakDuration: v,
                })
              }
            />

            <Setting
              label="Long break"
              value={
                settings.longBreakDuration
              }
              unit="min"
              min={5}
              max={60}
              onChange={(v) =>
                updateSettings({
                  longBreakDuration: v,
                })
              }
            />

            <Setting
              label="Sessions until long break"
              value={
                settings.sessionsUntilLongBreak
              }
              unit=""
              min={2}
              max={8}
              onChange={(v) =>
                updateSettings({
                  sessionsUntilLongBreak: v,
                })
              }
            />
          </div>
        </motion.div>

        {/* PREFERENCES */}

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
            delay: 0.1,
          }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-accent-white mb-5">
            Preferences
          </h3>

          <div className="space-y-4">
            <Toggle
              label="Sound notifications"
              value={
                settings.soundEnabled
              }
              onChange={(v) =>
                updateSettings({
                  soundEnabled: v,
                })
              }
            />

            <Toggle
              label="Auto-start breaks"
              value={
                settings.autoStartBreaks
              }
              onChange={(v) =>
                updateSettings({
                  autoStartBreaks: v,
                })
              }
            />

            <Toggle
              label="Auto-start work sessions"
              value={
                settings.autoStartWork
              }
              onChange={(v) =>
                updateSettings({
                  autoStartWork: v,
                })
              }
            />
          </div>
        </motion.div>

        {/* ABOUT */}

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
            delay: 0.15,
          }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-accent-white mb-2">
            About
          </h3>

          <p className="text-sm text-accent-subtle">
            Focus v1.0 — A minimalist
            Pomodoro and productivity app.
            All data is stored locally on
            your device.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

function Setting({
  label,
  value,
  unit,
  onChange,
  min,
  max,
}: {
  label: string
  value: number
  unit: string
  onChange: (v: number) => void
  min: number
  max: number
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-accent-muted">
        {label}
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            onChange(
              Math.max(
                min,
                value - 1,
              ),
            )
          }
          className="w-7 h-7 rounded-lg bg-bg-secondary flex items-center justify-center"
        >
          −
        </button>

        <span className="text-sm font-mono text-accent-white w-12 text-center">
          {value}
          {unit}
        </span>

        <button
          onClick={() =>
            onChange(
              Math.min(
                max,
                value + 1,
              ),
            )
          }
          className="w-7 h-7 rounded-lg bg-bg-secondary flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  )
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-accent-muted">
        {label}
      </span>

      <button
        onClick={() =>
          onChange(!value)
        }
        className={`w-11 h-6 rounded-full relative transition-all duration-300 ${
          value
            ? 'bg-accent-green'
            : 'bg-bg-secondary border border-border-muted'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${
            value
              ? 'left-5'
              : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}