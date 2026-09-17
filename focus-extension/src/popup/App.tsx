import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, Pause, Play, RotateCcw } from 'lucide-react'

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

function formatTimer(seconds: number) {
  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function App() {
  const [timer, setTimer] = useState<ExtensionTimerState>(FALLBACK_TIMER_STATE)
  const [isLoading, setIsLoading] = useState(true)

  const refreshTimer = useCallback(async () => {
    const nextState = await getTimerState()
    setTimer(nextState)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    void refreshTimer()
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

      <footer className="popup-footer">
        Timer and reminders work even without signing in.
      </footer>
    </main>
  )
}
