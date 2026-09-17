import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Droplets,
  ExternalLink,
  LogIn,
  LogOut,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react'

import {
  getAuthState,
  signInWithGoogle,
  signOutUser,
  type ExtensionAuthState,
} from '../auth/authService'
import {
  getExtensionProjects,
  type ExtensionProject,
} from '../data/projects'
import {
  getExtensionTasks,
  type ExtensionTask,
} from '../data/tasks'
import {
  getHydrationReminder,
  setHydrationReminder,
  type HydrationInterval,
  type HydrationReminderState,
} from '../reminders/reminderStore'
import {
  getTimerState,
  pauseTimer,
  resetTimer,
  setActiveTimerTask,
  startTimer,
} from '../timer/timerStore'
import type { ExtensionTimerState } from '../timer/timerStorage'

const FALLBACK_TIMER_STATE: ExtensionTimerState = {
  status: 'idle',
  sessionType: 'work',
  secondsLeft: 25 * 60,
  endsAt: null,
  activeTaskId: null,
  activeProjectId: null,
}

const FALLBACK_HYDRATION_STATE: HydrationReminderState = {
  enabled: false,
  intervalMinutes: 60,
}

const HYDRATION_INTERVALS: HydrationInterval[] = [30, 45, 60, 90]

function formatTimer(seconds: number) {
  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

function getDisplayName(user: NonNullable<ExtensionAuthState['user']>) {
  const metadataName = user.user_metadata?.display_name

  if (typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName.trim()
  }

  return user.email?.split('@')[0] ?? 'Focus user'
}

export function App() {
  const [timer, setTimer] = useState<ExtensionTimerState>(FALLBACK_TIMER_STATE)
  const [hydration, setHydration] = useState<HydrationReminderState>(
    FALLBACK_HYDRATION_STATE,
  )
  const [user, setUser] = useState<ExtensionAuthState['user']>(null)
  const [tasks, setTasks] = useState<ExtensionTask[]>([])
  const [projects, setProjects] = useState<ExtensionProject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)

  const refreshTimer = useCallback(async () => {
    const nextState = await getTimerState()
    setTimer(nextState)
  }, [])

  const loadAccountData = useCallback(async () => {
    const [nextTasks, nextProjects] = await Promise.all([
      getExtensionTasks(),
      getExtensionProjects(),
    ])

    setTasks(nextTasks)
    setProjects(nextProjects)
  }, [])

  useEffect(() => {
    void Promise.all([
      refreshTimer(),
      getHydrationReminder(),
      getAuthState(),
    ])
      .then(async ([, hydrationState, authState]) => {
        setHydration(hydrationState)
        setUser(authState.user)

        if (authState.user) {
          await loadAccountData()
        }
      })
      .catch((error: unknown) => {
        setAccountError(
          error instanceof Error ? error.message : 'Could not load Focus account.',
        )
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [loadAccountData, refreshTimer])

  useEffect(() => {
    if (timer.status !== 'running') {
      return
    }

    const intervalId = window.setInterval(() => {
      void refreshTimer()
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [refreshTimer, timer.status])

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === timer.activeTaskId) ?? null,
    [tasks, timer.activeTaskId],
  )

  const activeProject = useMemo(() => {
    const projectId = activeTask?.projectId ?? timer.activeProjectId
    return projects.find((project) => project.id === projectId) ?? null
  }, [activeTask, projects, timer.activeProjectId])

  const handlePrimaryAction = async () => {
    if (timer.status === 'running') {
      setTimer(await pauseTimer())
      return
    }

    setTimer(await startTimer())
  }

  const handleReset = async () => {
    setTimer(await resetTimer())
  }

  const handleTaskChange = async (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId) ?? null
    setTimer(
      await setActiveTimerTask(task?.id ?? null, task?.projectId ?? null),
    )
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true)
      setAccountError(null)
      const session = await signInWithGoogle()
      setUser(session?.user ?? null)

      if (session?.user) {
        await loadAccountData()
      }
    } catch (error) {
      setAccountError(
        error instanceof Error ? error.message : 'Could not sign in with Google.',
      )
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setAccountError(null)
      await signOutUser()
      setUser(null)
      setTasks([])
      setProjects([])
      setTimer(await setActiveTimerTask(null, null))
    } catch (error) {
      setAccountError(
        error instanceof Error ? error.message : 'Could not sign out.',
      )
    }
  }

  const updateHydration = async (nextState: HydrationReminderState) => {
    setHydration(await setHydrationReminder(nextState))
  }

  const isRunning = timer.status === 'running'
  const primaryLabel = isRunning ? 'Pause focus' : 'Start focus'

  return (
    <main className="popup-shell">
      <header className="popup-header">
        <div>
          <p className="eyebrow">Focus — Horizon</p>
          <h1>Focus</h1>
        </div>

        <button
          className="icon-button"
          type="button"
          aria-label="Open Focus Horizon"
          title="Open Focus Horizon"
        >
          <ExternalLink size={17} />
        </button>
      </header>

      <section className="timer-card" aria-label="Focus timer">
        <p className="session-label">
          {timer.sessionType === 'work' ? 'Focus session' : 'Break'}
        </p>
        <strong className="timer-value" aria-live="polite">
          {isLoading ? '--:--' : formatTimer(timer.secondsLeft)}
        </strong>

        <div className="timer-actions">
          <button
            className="primary-button"
            type="button"
            aria-label={primaryLabel}
            onClick={() => void handlePrimaryAction()}
            disabled={isLoading || timer.secondsLeft <= 0}
          >
            {isRunning ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" />
            )}
            {primaryLabel}
          </button>

          <button
            className="secondary-button"
            type="button"
            aria-label="Reset timer"
            title="Reset timer"
            onClick={() => void handleReset()}
            disabled={isLoading}
          >
            <RotateCcw size={17} />
          </button>
        </div>
      </section>

      {user ? (
        <section className="account-card" aria-label="Focus account">
          <div className="account-row">
            <div>
              <p className="status-label">Focus account</p>
              <p className="status-value">{getDisplayName(user)}</p>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => void handleSignOut()}
              aria-label="Sign out"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>

          <label className="task-control">
            <span className="status-label">Active task</span>
            <select
              aria-label="Active task"
              value={timer.activeTaskId ?? ''}
              onChange={(event) => void handleTaskChange(event.target.value)}
            >
              <option value="">No task selected</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>

          {activeProject && (
            <p className="project-context">
              {activeProject.emoji} {activeProject.name}
            </p>
          )}
        </section>
      ) : (
        <section className="account-card signed-out-card" aria-label="Focus account">
          <div>
            <p className="status-label">Focus account</p>
            <p className="status-value">Sync tasks and projects with Horizon</p>
          </div>
          <button
            className="google-button"
            type="button"
            onClick={() => void handleGoogleSignIn()}
            disabled={isLoading || isSigningIn}
          >
            <LogIn size={16} />
            {isSigningIn ? 'Connecting…' : 'Continue with Google'}
          </button>
        </section>
      )}

      <section className="status-card">
        <div>
          <p className="status-label">Current mode</p>
          <p className="status-value">
            {activeTask?.title ?? (user ? 'No task selected' : 'Timer only')}
          </p>
        </div>

        <span className="status-pill">
          {timer.status === 'running'
            ? 'Focusing'
            : timer.status === 'paused'
              ? 'Paused'
              : user
                ? 'Synced'
                : 'Local mode'}
        </span>
      </section>

      <section className="reminder-card" aria-label="Water reminder settings">
        <div className="reminder-heading">
          <div className="reminder-icon">
            <Droplets size={17} />
          </div>
          <div>
            <p className="status-label">Water reminders</p>
            <p className="status-value">Stay hydrated while you focus</p>
          </div>
        </div>

        <label className="switch-control">
          <input
            type="checkbox"
            aria-label="Water reminders"
            checked={hydration.enabled}
            onChange={(event) =>
              void updateHydration({
                ...hydration,
                enabled: event.target.checked,
              })
            }
            disabled={isLoading}
          />
          <span className="switch-track" aria-hidden="true" />
        </label>

        <label className="interval-control">
          <span>Every</span>
          <select
            aria-label="Water reminder interval"
            value={hydration.intervalMinutes}
            onChange={(event) =>
              void updateHydration({
                ...hydration,
                intervalMinutes: Number(event.target.value) as HydrationInterval,
              })
            }
            disabled={isLoading || !hydration.enabled}
          >
            {HYDRATION_INTERVALS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes} min
              </option>
            ))}
          </select>
        </label>
      </section>

      {accountError && <p className="account-error">{accountError}</p>}

      <footer className="popup-footer">
        Timer and reminders work even without signing in.
      </footer>
    </main>
  )
}
