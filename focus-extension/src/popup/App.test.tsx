import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { App } from './App'

const getTimerState = vi.fn()
const startTimer = vi.fn()
const pauseTimer = vi.fn()
const resetTimer = vi.fn()

vi.mock('../timer/timerStore', () => ({
  getTimerState,
  startTimer,
  pauseTimer,
  resetTimer,
}))

const idleState = {
  status: 'idle' as const,
  sessionType: 'work' as const,
  secondsLeft: 1500,
  endsAt: null,
  activeTaskId: null,
  activeProjectId: null,
}

describe('Focus Horizon popup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getTimerState.mockResolvedValue(idleState)
    startTimer.mockResolvedValue({
      ...idleState,
      status: 'running',
      endsAt: Date.now() + 1_500_000,
    })
    pauseTimer.mockResolvedValue({
      ...idleState,
      status: 'paused',
      secondsLeft: 1490,
    })
    resetTimer.mockResolvedValue(idleState)
  })

  it('renders the persisted focus timer', async () => {
    render(<App />)

    expect(await screen.findByText('25:00')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /start focus/i }),
    ).toBeInTheDocument()
  })

  it('starts and pauses the timer from the popup', async () => {
    render(<App />)

    fireEvent.click(
      await screen.findByRole('button', { name: /start focus/i }),
    )

    await waitFor(() => {
      expect(startTimer).toHaveBeenCalledTimes(1)
    })

    expect(
      screen.getByRole('button', { name: /pause focus/i }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /pause focus/i }))

    await waitFor(() => {
      expect(pauseTimer).toHaveBeenCalledTimes(1)
    })
  })

  it('resets the current timer', async () => {
    getTimerState.mockResolvedValue({
      ...idleState,
      status: 'paused',
      secondsLeft: 600,
    })

    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: /reset timer/i }))

    await waitFor(() => {
      expect(resetTimer).toHaveBeenCalledTimes(1)
    })

    expect(await screen.findByText('25:00')).toBeInTheDocument()
  })
})
