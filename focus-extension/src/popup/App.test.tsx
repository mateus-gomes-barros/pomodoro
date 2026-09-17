import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  getTimerState,
  startTimer,
  pauseTimer,
  resetTimer,
  setActiveTimerTask,
  switchTimerSession,
  toggleTimerSound,
  getHydrationReminder,
  setHydrationReminder,
  getAuthState,
  getAuthDiagnostic,
  signInWithGoogle,
  signOutUser,
  getExtensionTasks,
  getExtensionProjects,
  getExtensionFocusHome,
} = vi.hoisted(() => ({
  getTimerState: vi.fn(),
  startTimer: vi.fn(),
  pauseTimer: vi.fn(),
  resetTimer: vi.fn(),
  setActiveTimerTask: vi.fn(),
  switchTimerSession: vi.fn(),
  toggleTimerSound: vi.fn(),
  getHydrationReminder: vi.fn(),
  setHydrationReminder: vi.fn(),
  getAuthState: vi.fn(),
  getAuthDiagnostic: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOutUser: vi.fn(),
  getExtensionTasks: vi.fn(),
  getExtensionProjects: vi.fn(),
  getExtensionFocusHome: vi.fn(),
}))

vi.mock('../timer/timerStore', () => ({
  getTimerState,
  startTimer,
  pauseTimer,
  resetTimer,
  setActiveTimerTask,
  switchTimerSession,
  toggleTimerSound,
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

vi.mock('../data/focusHome', () => ({
  getExtensionFocusHome,
}))

import { App } from './App'

const idleState = {
  status: 'idle' as const,
  sessionType: 'work' as const,
  secondsLeft: 1500,
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

    Object.assign(globalThis, {
      chrome: {
        tabs: {
          create: vi.fn(async () => undefined),
        },
      },
    })
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
    switchTimerSession.mockImplementation(async (sessionType) => ({
      ...idleState,
      sessionType,
      secondsLeft:
        sessionType === 'work' ? 1500 : sessionType === 'short_break' ? 300 : 900,
    }))
    toggleTimerSound.mockResolvedValue({
      ...idleState,
      settings: { ...idleState.settings, soundEnabled: false },
    })
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
    getExtensionFocusHome.mockResolvedValue('verdant')
  })

  it('renders the persisted focus timer', async () => {
    render(<App />)

    expect(await screen.findByText('25:00')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /start timer/i }),
    ).toBeInTheDocument()
  })

  it('starts and pauses the timer from the popup', async () => {
    render(<App />)

    fireEvent.click(
      await screen.findByRole('button', { name: /start timer/i }),
    )

    await waitFor(() => {
      expect(startTimer).toHaveBeenCalledTimes(1)
    })

    fireEvent.click(screen.getByRole('button', { name: /pause timer/i }))

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

  it('shows the signed-in user FocushoMe badge beside the Focus title', async () => {
    getAuthState.mockResolvedValue({
      session: { user },
      user,
    })
    getExtensionFocusHome.mockResolvedValue('verdant')

    render(<App />)

    expect(
      await screen.findByLabelText(/your focushome badge/i),
    ).toBeInTheDocument()
  })

  it('does not show a header badge while signed out', async () => {
    render(<App />)

    await screen.findByText('25:00')

    expect(
      screen.queryByLabelText(/your focushome badge/i),
    ).not.toBeInTheDocument()
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

  it('opens the Focus Horizon web app from the header button', async () => {
    render(<App />)

    fireEvent.click(
      await screen.findByRole('button', { name: /open focus horizon/i }),
    )

    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'https://pomodoro-1ktl-theta.vercel.app/',
    })
  })

  it('lets a signed-in user choose a project independently', async () => {
    getAuthState.mockResolvedValue({
      session: { user },
      user,
    })

    render(<App />)

    const projectSelect = await screen.findByLabelText(/active project/i)
    fireEvent.change(projectSelect, { target: { value: 'project-1' } })

    await waitFor(() => {
      expect(setActiveTimerTask).toHaveBeenCalledWith(null, 'project-1')
    })
  })

  it('shows an explicit sign out action for signed-in users', async () => {
    getAuthState.mockResolvedValue({
      session: { user },
      user,
    })

    render(<App />)

    expect(
      await screen.findByRole('button', { name: /sign out/i }),
    ).toBeInTheDocument()
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

    expect(screen.getAllByText(/Focus 6.0/).length).toBeGreaterThan(0)
  })
})
