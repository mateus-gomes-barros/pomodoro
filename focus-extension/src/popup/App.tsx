import { useCallback, useEffect, useState } from 'react'
import { Droplets, ExternalLink, Pause, Play, RotateCcw } from 'lucide-react'

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

export function App() {
  const [timer, setTimer] = useState<ExtensionTimerState>(FALLBACK_TIMER_STATE)
  const [hydration, setHydration] = useState<HydrationReminderState>(
    FALLBACK_HYDRATION_STATE,
  )
  const [isLoading, setIsLoading] = useState(true)

  const refreshTimer = useCallback(async () => {
    const nextState = await getTimerState()
    setTimer(nextState)
  }, [])

  useEffect(() => {
    void Promise.all([refreshTimer(), getHydrationReminder()]).then(
      ([, hydrationState]) => {
        setHydration(hydrationState)
        setIsLoading(false)
      },
    )
  }, [refreshTimer])

  useEffect(() => {
    if (timer.status !== 'running') {
      return
    }

    const intervalId = window.setInterval(() => {
      void refreshTimer()
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [refreshTimer, timer.status])

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

      <section className="status-card">
        <div>
          <p className="status-label">Active task</p>
          <p className="status-value">No task selected</p>
        </div>

        <span className="status-pill">
          {timer.status === 'running'
            ? 'Focusing'
            : timer.status === 'paused'
              ? 'Paused'
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

      <footer className="popup-footer">
        Timer and reminders work even without signing in.
      </footer>
    </main>
  )
}
