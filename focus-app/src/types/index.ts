// ─── Core Types ────────────────────────────────────────────────────────────────

export type SessionType = 'work' | 'short_break' | 'long_break'
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed'
export type TaskPriority = 'low' | 'medium' | 'high'

// ─── Project ────────────────────────────────────────────────────────────────────

export interface Project {
  id: string
  name: string
  color: string
  emoji: string
  description?: string
  totalSessions: number
  completedSessions: number
  totalFocusMinutes: number
  createdAt: string
  updatedAt: string
}

// ─── Task ───────────────────────────────────────────────────────────────────────

export interface Task {
  id: string
  title: string
  completed: boolean
  projectId?: string
  priority: TaskPriority
  estimatedPomodoros: number
  completedPomodoros: number
  createdAt: string
  completedAt?: string
  order: number
}

// ─── Goal ───────────────────────────────────────────────────────────────────────

export interface Goal {
  id: string
  title: string
  year: number
  completed: boolean
  completedAt?: string
  order: number
  createdAt: string
  updatedAt: string
}

// ─── Pomodoro Session ───────────────────────────────────────────────────────────

export interface PomodoroSession {
  id: string
  type: SessionType
  projectId?: string
  taskId?: string
  durationMinutes: number
  completedAt: string
  date: string
}

// ─── Timer Settings ─────────────────────────────────────────────────────────────

export interface TimerSettings {
  workDuration: number       // minutes
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  soundEnabled: boolean
  autoStartBreaks: boolean
  autoStartWork: boolean
}

// ─── Stats ──────────────────────────────────────────────────────────────────────

export interface DailyStats {
  date: string
  focusMinutes: number
  sessionsCompleted: number
  tasksCompleted: number
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string | null
  activeDates: string[]
}

// ─── Achievement ────────────────────────────────────────────────────────────────

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt?: string
  condition: (stats: AppStats) => boolean
}

export interface AppStats {
  totalFocusMinutes: number
  totalSessions: number
  totalTasksCompleted: number
  currentStreak: number
  longestStreak: number
}

export function generateId(): string {
    return crypto.randomUUID()
  }
  
  export function getTodayString(): string {
    return new Date().toISOString().split('T')[0]
  }