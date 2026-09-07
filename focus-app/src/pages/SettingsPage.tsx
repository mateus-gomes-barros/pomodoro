import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { setAppLanguage } from '@/i18n'

import { useAuth } from '@/contexts/AuthContext'
import {
  signInWithGoogle,
  signOut,
  updateDisplayName,
} from '@/services/authService'

import { usePomodoroStore } from '../store/pomodoroStore'
import { PageHeader } from '../components/ui/PageHeader'

export function SettingsPage() {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

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
    displayName,
    setDisplayName,
  ] = useState(() => {
    const metadataName =
      user?.user_metadata?.display_name ??
      user?.user_metadata?.full_name ??
      user?.user_metadata?.name

    return typeof metadataName ===
      'string'
      ? metadataName
      : ''
  })

  const [
    isSavingDisplayName,
    setIsSavingDisplayName,
  ] = useState(false)

  const [
    displayNameMessage,
    setDisplayNameMessage,
  ] = useState<string | null>(null)

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

  async function handleSaveDisplayName() {
    try {
      setIsSavingDisplayName(true)
      setErrorMessage(null)
      setDisplayNameMessage(null)

      const updatedUser =
        await updateDisplayName(
          displayName,
        )

      const savedName =
        updatedUser.user_metadata
          ?.display_name

      if (
        typeof savedName ===
        'string'
      ) {
        setDisplayName(savedName)
      }

      setDisplayNameMessage(
        t('settings.account.saved'),
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not save your display name.'

      console.error(
        'Failed to update display name:',
        error,
      )

      setErrorMessage(message)
    } finally {
      setIsSavingDisplayName(false)
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
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
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
            {t('settings.account.title')}
          </h3>

          {user ? (
            <>
              <p className="text-sm text-accent-white">
                {t('settings.account.connected')}
              </p>

              <p className="mt-2 text-sm text-accent-subtle break-all">
                {user.email ??
                  t('settings.account.googleConnected')}
              </p>

              <div className="mt-6">
                <label
                  htmlFor="display-name"
                  className="text-sm font-medium text-accent-white"
                >
                  {t('settings.account.displayName')}
                </label>

                <p className="mt-1 text-xs leading-relaxed text-accent-subtle">
                  {t('settings.account.displayNameDescription')}
                </p>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(event) => {
                      setDisplayName(
                        event.target.value,
                      )
                      setDisplayNameMessage(
                        null,
                      )
                    }}
                    maxLength={40}
                    autoComplete="name"
                    placeholder={t('settings.account.placeholder')}
                    className="
                      min-w-0
                      flex-1
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.035]
                      px-4
                      py-3
                      text-sm
                      text-white
                      outline-none
                      transition
                      placeholder:text-white/25
                      focus:border-accent-green/50
                      focus:ring-2
                      focus:ring-accent-green/10
                    "
                  />

<button
  type="button"
  onClick={handleSaveDisplayName}
  disabled={
    isSavingDisplayName ||
    !displayName.trim()
  }
  className="
    w-full
    rounded-xl
    border
    border-accent-green
    bg-accent-green
    px-5
    py-3
    text-sm
    font-semibold
   text-white
    shadow-[0_8px_24px_rgba(52,211,153,0.12)]
    transition
    duration-200
    hover:brightness-110
    active:scale-[0.98]
    disabled:cursor-not-allowed
    disabled:opacity-40
    sm:w-auto
    sm:min-w-[130px]
  "
>
  {isSavingDisplayName
    ? t('settings.account.saving')
    : t('settings.account.save')}
</button>
                </div>

                {displayNameMessage && (
                  <p className="mt-3 text-sm text-accent-green">
                    {displayNameMessage}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="mt-5 w-full rounded-xl border border-white/10 px-4 py-3 font-medium text-accent-subtle transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSigningOut
                  ? t('settings.account.signingOut')
                  : t('settings.account.signOut')}
              </button>
            </>
          ) : isDemoMode ? (
            <>
              <p className="text-sm text-accent-white">
                {t('settings.account.guestMode')}
              </p>

              <p className="mt-2 text-sm text-accent-subtle">
                {t('settings.account.guestDescription')}
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="rounded-xl bg-accent-green px-4 py-3 font-medium text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSigningIn
                    ? t('settings.account.redirecting')
                    : t('settings.account.continueGoogle')}
                </button>

                <button
                  type="button"
                  onClick={handleExitDemoMode}
                  disabled={isSigningIn}
                  className="rounded-xl border border-white/10 px-4 py-3 font-medium text-accent-subtle transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('settings.account.exitGuest')}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-accent-white">
                {t('settings.account.noAccount')}
              </p>

              <p className="mt-2 text-sm text-accent-subtle">
                {t('settings.account.noAccountDescription')}
              </p>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSigningIn}
                className="mt-5 w-full rounded-xl bg-accent-green px-4 py-3 font-medium text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSigningIn
                  ? t('settings.account.redirecting')
                  : t('settings.account.continueGoogle')}
              </button>
            </>
          )}

          {errorMessage && (
            <p className="mt-4 text-sm text-red-400">
              {errorMessage}
            </p>
          )}
        </motion.div>

        {/* LANGUAGE */}

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
            delay: 0.025,
          }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-accent-white mb-2">
            {t('settings.language.title')}
          </h3>

          <p className="text-xs leading-relaxed text-accent-subtle">
            {t(
              'settings.language.description',
            )}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                void setAppLanguage('en')
              }
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                i18n.language === 'en'
                  ? 'border-accent-green bg-accent-green/10 text-accent-green'
                  : 'border-white/10 bg-white/[0.025] text-accent-subtle hover:border-white/20'
              }`}
            >
              <span className="font-medium">
                English
              </span>

              <span className="mt-1 block text-xs opacity-60">
                English
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                void setAppLanguage(
                  'pt-BR',
                )
              }
              className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                i18n.language === 'pt-BR'
                  ? 'border-accent-green bg-accent-green/10 text-accent-green'
                  : 'border-white/10 bg-white/[0.025] text-accent-subtle hover:border-white/20'
              }`}
            >
              <span className="font-medium">
                Português
              </span>

              <span className="mt-1 block text-xs opacity-60">
                Brasil
              </span>
            </button>
          </div>
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
            {t('settings.timer.title')}
          </h3>

          <div className="space-y-4">
            <Setting
              label={t('settings.timer.focus')}
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
              label={t('settings.timer.shortBreak')}
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
              label={t('settings.timer.longBreak')}
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
              label={t('settings.timer.sessionsUntilLongBreak')}
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
            {t('settings.preferences.title')}
          </h3>

          <div className="space-y-4">
            <Toggle
              label={t('settings.preferences.sound')}
              value={settings.soundEnabled}
              onChange={(value) =>
                updateSettings({
                  soundEnabled: value,
                })
              }
            />

            <Toggle
              label={t('settings.preferences.autoBreak')}
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
              label={t('settings.preferences.autoWork')}
              value={settings.autoStartWork}
              onChange={(value) =>
                updateSettings({
                  autoStartWork: value,
                })
              }
            />
          </div>
        </motion.div>

        {/* FOCUSME */}

        <motion.button
          type="button"
          onClick={() =>
            navigate('/focusme')
          }
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
          className="card flex w-full items-center gap-4 p-6 text-left transition hover:border-accent-green/20 hover:bg-accent-green/[0.025]"
        >
          <div className="rounded-xl bg-accent-green/10 p-3 text-accent-green">
            <BarChart3 size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-accent-white">
                FocusMe
              </h3>

              <span className="rounded-full border border-accent-green/30 bg-accent-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-green">
                {t(
                  'settings.focusMe.badge',
                )}
              </span>
            </div>

            <p className="mt-1 text-xs leading-relaxed text-accent-subtle">
              {t(
                'settings.focusMe.description',
              )}
            </p>
          </div>

          <ChevronRight
            size={18}
            className="shrink-0 text-accent-subtle"
          />
        </motion.button>

        {/* CHANGES AND UPDATES */}

        <motion.button
          type="button"
          onClick={() =>
            navigate('/settings/changes')
          }
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
          className="card flex w-full items-center gap-4 p-6 text-left transition hover:border-white/15 hover:bg-white/[0.035]"
        >
          <div className="rounded-xl bg-accent-green/10 p-3 text-accent-green">
            <Sparkles size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-accent-white">
              {t('settings.changes.title')}
            </h3>

            <p className="mt-1 text-xs leading-relaxed text-accent-subtle">
              {t(
                'settings.changes.description',
              )}
            </p>
          </div>

          <ChevronRight
            size={18}
            className="shrink-0 text-accent-subtle"
          />
        </motion.button>

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
            delay: 0.2,
          }}
          className="card p-6"
        >
          <h3 className="text-sm font-semibold text-accent-white mb-2">
            {t('settings.about.title')}
          </h3>

          <p className="text-sm text-accent-subtle">
            {t('settings.about.description')}
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
    <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-4">
      <span className="min-w-0 text-sm leading-5 text-accent-muted">
        {label}
      </span>

      <button
        type="button"
        onClick={() =>
          onChange(!value)
        }
        className={`relative h-6 w-11 shrink-0 justify-self-end rounded-full transition-all duration-300 ${
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