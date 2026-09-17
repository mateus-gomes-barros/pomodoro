import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getTimerState,
  startTimer,
  pauseTimer,
  resetTimer,
  setActiveTimerTask,
  getHydrationReminder,
  setHydrationReminder,
  getAuthState,
  getAuthDiagnostic,
  signInWithGoogle,
  signOutUser,
  getExtensionTasks,
  getExtensionProjects,
} = vi.hoisted(() => ({
  getTimerState: vi.fn(),
  startTimer: vi.fn(),
  pauseTimer: vi.fn(),
  resetTimer: vi.fn(),
  setActiveTimerTask: vi.fn(),
  getHydrationReminder: vi.fn(),
  setHydrationReminder: vi.fn(),
  getAuthState: vi.fn(),
  getAuthDiagnostic: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
  getExtensionTasks: vi.fn(),
  getExtensionProjects: vi.fn(),
}))

vi.mock('../timer/timerStore', () => ({
  getTimerState,
  startTimer,
  pauseTimer,
  resetTimer,
  setActiveTimerTask,
}))

vi.mock('../reminders/reminderStore', () => ({
  getHydrationReminder,
  setHydrationReminder,
}))

vi.mock('../auth/authService', () => ({
  getAuthState,
  signInWithGoogle,
  signOutUser,
}))

vi.mock('../auth/authDiagnostics', () => ({
  getAuthDiagnostic,
}))

vi.mock('../data/tasks', () => ({
  getExtensionTasks,
}))

vi.mock('../data/projects', () => ({
  getExtensionProjects,
}))

import { App } from './App'

const idleState = {
  status: 'idle' as const,
  sessionType: 'work' as const,
  secondsLeft: 1500,
  endsAt: null,
  activeTaskId: null,
  activeProjectId: null,
}

const user = {
  id: 'user-1',
  email: 'mateus@example.com',
  user_metadata: { display_name: 'Mateus' },
}

const tasks = [
  {
    id: 'task-1',
    title: 'Ship extension',
    projectId: 'project-1',
    plannedDate: '2026-09-17',
    dailyPriority: 1,
    order: 0,
  },
]

const projects = [
  {
    id: 'project-1',
    name: 'Focus 6.0',
    emoji: '🎯',
    color: '#10b981',
  },
]

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
    setActiveTimerTask.mockImplementation(async (taskId, projectId) => ({
      ...idleState,
      activeTaskId: taskId,
      activeProjectId: projectId,
    }))
    getHydrationReminder.mockResolvedValue({
      enabled: false,
      intervalMinutes: 60,
    })
    setHydrationReminder.mockImplementation(async (state) => state)
    getAuthState.mockResolvedValue({ session: null, user: null })
    getAuthDiagnostic.mockResolvedValue(null)
    signOutUser.mockResolvedValue(undefined)
    getExtensionTasks.mockResolvedValue(tasks)
    getExtensionProjects.mockResolvedValue(projects)
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

  it('enables hydration reminders and changes their interval', async () => {
    render(<App />)

    const toggle = await screen.findByRole('checkbox', {
      name: /water reminders/i,
    })

    fireEvent.click(toggle)

    await waitFor(() => {
      expect(setHydrationReminder).toHaveBeenCalledWith({
        enabled: true,
        intervalMinutes: 60,
      })
    })

    fireEvent.change(screen.getByLabelText(/water reminder interval/i), {
      target: { value: '45' },
    })

    await waitFor(() => {
      expect(setHydrationReminder).toHaveBeenLastCalledWith({
        enabled: true,
        intervalMinutes: 45,
      })
    })
  })

  it('shows a persisted OAuth failure after the popup reopens', async () => {
    getAuthDiagnostic.mockResolvedValue({
      stage: 'launch-web-auth-flow',
      message: 'Authorization page could not be loaded.',
      redirectTo: 'https://extension-id.chromiumapp.org/auth',
      createdAt: '2026-09-17T22:00:00.000Z',
    })

    render(<App />)

    expect(await screen.findByText(/launch-web-auth-flow/i)).toBeInTheDocument()
    expect(
      screen.getByText('https://extension-id.chromiumapp.org/auth'),
    ).toBeInTheDocument()
  })

  it('offers Google sign in while preserving local mode', async () => {
    signInWithGoogle.mockResolvedValue(undefined)
    getAuthState
      .mockResolvedValueOnce({ session: null, user: null })
      .mockResolvedValueOnce({ session: { user }, user })

    render(<App />)

    fireEvent.click(
      await screen.findByRole('button', { name: /continue with google/i }),
    )

    await waitFor(() => {
      expect(signInWithGoogle).toHaveBeenCalledTimes(1)
      expect(getExtensionTasks).toHaveBeenCalledTimes(1)
    })

    expect(await screen.findByText('Mateus')).toBeInTheDocument()
  })

  it('loads account tasks and assigns one to the timer', async () => {
    getAuthState.mockResolvedValue({
      session: { user },
      user,
    })

    render(<App />)

    const select = await screen.findByLabelText(/active task/i)
    fireEvent.change(select, { target: { value: 'task-1' } })

    await waitFor(() => {
      expect(setActiveTimerTask).toHaveBeenCalledWith('task-1', 'project-1')
    })

    expect(screen.getByText(/Focus 6.0/)).toBeInTheDocument()
  })
})
