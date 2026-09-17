import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Droplets,
  ExternalLink,
  LogIn,
  LogOut,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react'

import {
  getAuthState,
  signInWithGoogle,
  signOutUser,
  type ExtensionAuthState,
} from '../auth/authService'
import {
  getAuthDiagnostic,
  type AuthDiagnostic,
} from '../auth/authDiagnostics'
import { getExtensionFocusHome, type FocusHomeKey } from '../data/focusHome'
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
  switchTimerSession,
  toggleTimerSound,
} from '../timer/timerStore'
import { getSessionDurationSeconds, type ExtensionTimerState, type SessionType } from '../timer/timerStorage'
import { CircularProgress } from './CircularProgress'
import { FOCUS_HOME_COLORS, FocusHomeSymbol, FocusMeIcon } from './FocusIdentity'

const FALLBACK_TIMER_STATE: ExtensionTimerState = {
  status: 'idle',
  sessionType: 'work',
  secondsLeft: 25 * 60,
  endsAt: null,
  currentSessionCount: 0,
  activeTaskId: null,
  activeProjectId: null,
  settings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
  },
}

const FALLBACK_HYDRATION_STATE: HydrationReminderState = {
  enabled: false,
  intervalMinutes: 60,
}

const HYDRATION_INTERVALS: HydrationInterval[] = [30, 45, 60, 90]
const SESSION_TYPES: SessionType[] = ['work', 'short_break', 'long_break']
const SESSION_LABELS: Record<SessionType, string> = {
  work: 'Focus',
  short_break: 'Short break',
  long_break: 'Long break',
}
const HORIZON_WEB_URL = 'https://pomodoro-1ktl-theta.vercel.app/'

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
  const [focusHome, setFocusHome] = useState<FocusHomeKey | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [accountError, setAccountError] = useState<string | null>(null)
  const [authDiagnostic, setAuthDiagnostic] = useState<AuthDiagnostic | null>(null)

  const refreshTimer = useCallback(async () => {
    const nextState = await getTimerState()
    setTimer(nextState)
  }, [])

  const loadAccountData = useCallback(async () => {
    const [nextTasks, nextProjects, nextFocusHome] = await Promise.all([
      getExtensionTasks(),
      getExtensionProjects(),
      getExtensionFocusHome(),
    ])

    setTasks(nextTasks)
    setProjects(nextProjects)
    setFocusHome(nextFocusHome)
  }, [])

  useEffect(() => {
    void Promise.all([
      refreshTimer(),
      getHydrationReminder(),
      getAuthState(),
      getAuthDiagnostic(),
    ])
      .then(async ([, hydrationState, authState, diagnostic]) => {
        setHydration(hydrationState)
        setUser(authState.user)
        setAuthDiagnostic(diagnostic)

        if (diagnostic) {
          setAccountError(`${diagnostic.stage}: ${diagnostic.message}`)
        }

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

  const visibleTasks = useMemo(() => {
    if (!timer.activeProjectId) {
      return tasks
    }

    return tasks.filter((task) => task.projectId === timer.activeProjectId)
  }, [tasks, timer.activeProjectId])

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

  const handleSessionChange = async (sessionType: SessionType) => {
    setTimer(await switchTimerSession(sessionType))
  }

  const handleSoundToggle = async () => {
    setTimer(await toggleTimerSound())
  }

  const handleProjectChange = async (projectId: string) => {
    const nextProjectId = projectId || null
    const currentTask =
      tasks.find((item) => item.id === timer.activeTaskId) ?? null
    const keepCurrentTask =
      currentTask?.projectId === nextProjectId ? currentTask.id : null

    setTimer(await setActiveTimerTask(keepCurrentTask, nextProjectId))
  }

  const handleTaskChange = async (taskId: string) => {
    const task = tasks.find((item) => item.id === taskId) ?? null
    setTimer(
      await setActiveTimerTask(
        task?.id ?? null,
        task?.projectId ?? timer.activeProjectId ?? null,
      ),
    )
  }

  const handleOpenHorizon = async () => {
    await chrome.tabs.create({ url: HORIZON_WEB_URL })
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true)
      setAccountError(null)
      setAuthDiagnostic(null)
      await signInWithGoogle()
      const authState = await getAuthState()
      setUser(authState.user)

      if (authState.user) {
        await loadAccountData()
      }
    } catch (error) {
      const diagnostic = await getAuthDiagnostic()
      setAuthDiagnostic(diagnostic)
      setAccountError(
        diagnostic
          ? `${diagnostic.stage}: ${diagnostic.message}`
          : error instanceof Error
            ? error.message
            : 'Could not sign in with Google.',
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
      setFocusHome(null)
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
  const primaryLabel = isRunning ? 'Pause timer' : 'Start timer'
  const totalSeconds = getSessionDurationSeconds(timer.sessionType, timer.settings)
  const progress = Math.min(
    Math.max(timer.status !== 'idle' && totalSeconds > 0 ? 1 - timer.secondsLeft / totalSeconds : 0, 0),
    1,
  )
  const identityColor = focusHome ? FOCUS_HOME_COLORS[focusHome] : '#34d399'
  const ringColor = focusHome
    ? identityColor
    : timer.sessionType === 'work'
      ? '#34d399'
      : '#60a5fa'
  const completedSessionDots =
    timer.settings.sessionsUntilLongBreak > 0
      ? timer.currentSessionCount % timer.settings.sessionsUntilLongBreak
      : 0

  return (
    <main className="popup-shell">
      <header className="popup-header">
        <div>
          <p className="eyebrow">Focus — Horizon</p>
          <div className="header-title-row">
            <h1>Focus</h1>
            {user && focusHome && (
              <span
                className="header-focus-badge"
                aria-label="Your FocushoMe badge"
                title="Your FocushoMe"
              >
                <FocusHomeSymbol type={focusHome} size={24} />
              </span>
            )}
          </div>
        </div>

        <button
          className="icon-button"
          type="button"
          aria-label="Open Focus Horizon"
          title="Open Focus Horizon"
          onClick={() => void handleOpenHorizon()}
        >
          <ExternalLink size={17} />
        </button>
      </header>

      <section className="focus-timer-section" aria-label="Focus timer">
        <div className="focus-session-switcher" role="group" aria-label="Session type">
          {SESSION_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`focus-segment-button ${timer.sessionType === type ? 'active' : ''}`}
              onClick={() => void handleSessionChange(type)}
              disabled={isRunning}
            >
              {SESSION_LABELS[type]}
            </button>
          ))}
        </div>

        <div className="focus-timer-ring-wrap">
          <div className="focus-outer-glass" aria-hidden="true" />
          <div className="focus-inner-glass" aria-hidden="true">
            <div className={`focus-glass-sheen ${isRunning ? 'running' : ''}`} />
          </div>

          <CircularProgress progress={progress} size={260} strokeWidth={5} color={ringColor}>
            <div className="focus-ring-inner">
              <div
                className={`focus-home-identity ${isRunning ? 'running' : ''} ${timer.status === 'completed' ? 'completed' : ''}`}
                style={{ filter: `drop-shadow(0 0 22px ${identityColor}66)` }}
                aria-hidden="true"
              >
                {focusHome ? (
                  <FocusHomeSymbol type={focusHome} size={205} />
                ) : (
                  <FocusMeIcon size={185} style={{ color: identityColor }} />
                )}
              </div>

              <div className="focus-time-layer">
                <span
                  className="focus-time-value"
                  style={{ color: identityColor, textShadow: `0 0 22px ${identityColor}38` }}
                >
                  {isLoading ? '--:--' : formatTimer(timer.secondsLeft)}
                </span>
                <span className="focus-time-label">{SESSION_LABELS[timer.sessionType]}</span>
              </div>
            </div>
          </CircularProgress>
        </div>

        <div className="focus-session-dots">
          {Array.from({ length: timer.settings.sessionsUntilLongBreak }).map((_, index) => (
            <span
              key={index}
              className="focus-session-dot"
              style={{
                backgroundColor:
                  index < completedSessionDots ? '#34d399' : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
          <span className="focus-until-break">until long break</span>
        </div>

        {timer.status === 'completed' && (
          <div className="focus-completed-card">
            <strong>
              {timer.sessionType === 'work' ? 'Break finished' : 'Focus finished'}
            </strong>
            <span>
              {timer.sessionType === 'work'
                ? 'Ready to focus again.'
                : 'Your session is complete. The next break is ready.'}
            </span>
          </div>
        )}

        <div className="focus-timer-controls">
          <button
            type="button"
            className="focus-control-secondary"
            aria-label="Reset timer"
            onClick={() => void handleReset()}
          >
            <RotateCcw size={16} />
          </button>

          <button
            type="button"
            className={`focus-control-primary ${isRunning ? 'running' : ''}`}
            aria-label={primaryLabel}
            onClick={() => void handlePrimaryAction()}
            disabled={isLoading || timer.secondsLeft <= 0}
          >
            {isRunning ? <Pause size={26} /> : <Play size={26} className="focus-play-icon" />}
          </button>

          <button
            type="button"
            className="focus-control-secondary"
            aria-label={timer.settings.soundEnabled ? 'Mute timer sound' : 'Enable timer sound'}
            onClick={() => void handleSoundToggle()}
          >
            {timer.settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
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
            <span className="status-label">Active project</span>
            <select
              aria-label="Active project"
              value={timer.activeProjectId ?? ''}
              onChange={(event) => void handleProjectChange(event.target.value)}
              disabled={isRunning}
            >
              <option value="">No project selected</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.emoji ? `${project.emoji} ` : ''}{project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="task-control">
            <span className="status-label">Active task</span>
            <select
              aria-label="Active task"
              value={timer.activeTaskId ?? ''}
              onChange={(event) => void handleTaskChange(event.target.value)}
              disabled={isRunning}
            >
              <option value="">No task selected</option>
              {visibleTasks.map((task) => (
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

      {accountError && (
        <div className="account-error" role="alert">
          <strong>Google sign-in failed</strong>
          <span>{accountError}</span>
          {authDiagnostic && (
            <code className="auth-redirect">{authDiagnostic.redirectTo}</code>
          )}
        </div>
      )}

      <footer className="popup-footer">
        Timer and reminders work even without signing in.
      </footer>
    </main>
  )
}
