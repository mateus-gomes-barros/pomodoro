import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '@/contexts/AuthContext'
import {
  signInWithGoogle,
  signOut,
} from '@/services/authService'

import { usePomodoroStore } from '../store/pomodoroStore'
import { PageHeader } from '../components/ui/PageHeader'

export function SettingsPage() {
  const navigate = useNavigate()

  const {
    user,
    isDemoMode,
    exitDemoMode,
  } = useAuth()

  const {
    settings,
    updateSettings,
  } = usePomodoroStore()

  const [
    isSigningIn,
    setIsSigningIn,
  ] = useState(false)

  const [
    isSigningOut,
    setIsSigningOut,
  ] = useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null)

  async function handleGoogleLogin() {
    try {
      setIsSigningIn(true)
      setErrorMessage(null)

      await signInWithGoogle()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not start Google login.'

      console.error(
        'Failed to sign in:',
        error,
      )

      setErrorMessage(message)
      setIsSigningIn(false)
    }
  }

  async function handleSignOut() {
    try {
      setIsSigningOut(true)
      setErrorMessage(null)

      await signOut()

      navigate(
        '/login',
        {
          replace: true,
        },
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not sign out.'

      console.error(
        'Failed to sign out:',
        error,
      )

      setErrorMessage(message)
    } finally {
      setIsSigningOut(false)
    }
  }

  function handleExitDemoMode() {
    exitDemoMode()

    navigate(
      '/login',
      {
        replace: true,
      },
    )
  }

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

          {user ? (
            <>
              <p className="text-sm text-accent-white">
                Connected Account
              </p>

              <p className="mt-2 text-sm text-accent-subtle break-all">
                {user.email ??
                  'Google account connected'}
              </p>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="mt-5 w-full rounded-xl border border-white/10 px-4 py-3 font-medium text-accent-subtle transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSigningOut
                  ? 'Signing out...'
                  : 'Sign Out'}
              </button>
            </>
          ) : isDemoMode ? (
            <>
              <p className="text-sm text-accent-white">
                Guest Mode
              </p>

              <p className="mt-2 text-sm text-accent-subtle">
                You're using Focus without an
                account. Your data is stored only
                on this device.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="rounded-xl bg-accent-green px-4 py-3 font-medium text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSigningIn
                    ? 'Redirecting...'
                    : 'Continue with Google'}
                </button>

                <button
                  type="button"
                  onClick={handleExitDemoMode}
                  disabled={isSigningIn}
                  className="rounded-xl border border-white/10 px-4 py-3 font-medium text-accent-subtle transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Exit Guest Mode
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-accent-white">
                No Account Connected
              </p>

              <p className="mt-2 text-sm text-accent-subtle">
                Connect your Google account to
                synchronize your Focus data.
              </p>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="mt-5 w-full rounded-xl bg-accent-green px-4 py-3 font-medium text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSigningIn
                  ? 'Redirecting...'
                  : 'Continue with Google'}
              </button>
            </>
          )}

          {errorMessage && (
            <p className="mt-4 text-sm text-red-400">
              {errorMessage}
            </p>
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
            delay: 0.05,
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
              onChange={(value) =>
                updateSettings({
                  workDuration: value,
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
              onChange={(value) =>
                updateSettings({
                  shortBreakDuration: value,
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
              onChange={(value) =>
                updateSettings({
                  longBreakDuration: value,
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
              onChange={(value) =>
                updateSettings({
                  sessionsUntilLongBreak:
                    value,
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
              value={settings.soundEnabled}
              onChange={(value) =>
                updateSettings({
                  soundEnabled: value,
                })
              }
            />

            <Toggle
              label="Auto-start breaks"
              value={
                settings.autoStartBreaks
              }
              onChange={(value) =>
                updateSettings({
                  autoStartBreaks: value,
                })
              }
            />

            <Toggle
              label="Auto-start work sessions"
              value={settings.autoStartWork}
              onChange={(value) =>
                updateSettings({
                  autoStartWork: value,
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
            Focus v1.0 — A minimalist Pomodoro
            and productivity app. Guest data is
            stored locally on your device.
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
  onChange: (value: number) => void
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
          type="button"
          onClick={() =>
            onChange(
              Math.max(
                min,
                value - 1,
              ),
            )
          }
          className="w-7 h-7 rounded-lg bg-bg-secondary flex items-center justify-center"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>

        <span className="text-sm font-mono text-accent-white w-12 text-center">
          {value}
          {unit}
        </span>

        <button
          type="button"
          onClick={() =>
            onChange(
              Math.min(
                max,
                value + 1,
              ),
            )
          }
          className="w-7 h-7 rounded-lg bg-bg-secondary flex items-center justify-center"
          aria-label={`Increase ${label}`}
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
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-accent-muted">
        {label}
      </span>

      <button
        type="button"
        onClick={() =>
          onChange(!value)
        }
        className={`w-11 h-6 rounded-full relative transition-all duration-300 ${
          value
            ? 'bg-accent-green'
            : 'bg-bg-secondary border border-border-muted'
        }`}
        role="switch"
        aria-checked={value}
        aria-label={label}
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