import { format, subDays } from 'date-fns'

import { usePomodoroSessions } from '@/hooks/pomodoro/usePomodoroSessions'
import { useProjects } from '@/hooks/projects/useProjects'
import { useTasks } from '@/hooks/tasks/useTasks'

import type {
  DailyStats,
  PomodoroSession,
  Project,
  Task,
} from '@/types'

export interface ProjectAnalytics
  extends Project {
  calculatedFocusMinutes: number
  calculatedSessions: number
}

function getLastDays(
  amount: number,
): string[] {
  const today = new Date()

  return Array.from(
    {
      length: amount,
    },
    (_, index) =>
      format(
        subDays(
          today,
          amount - 1 - index,
        ),
        'yyyy-MM-dd',
      ),
  )
}

function buildDailyStats(
  dates: string[],
  sessions: PomodoroSession[],
  tasks: Task[],
): DailyStats[] {
  const statsByDate = new Map<
    string,
    DailyStats
  >()

  dates.forEach((date) => {
    statsByDate.set(date, {
      date,
      focusMinutes: 0,
      sessionsCompleted: 0,
      tasksCompleted: 0,
    })
  })

  sessions.forEach((session) => {
    if (session.type !== 'work') {
      return
    }

    const currentStats =
      statsByDate.get(session.date)

    if (!currentStats) {
      return
    }

    currentStats.focusMinutes +=
      session.durationMinutes

    currentStats.sessionsCompleted += 1
  })

  tasks.forEach((task) => {
    if (
      !task.completed ||
      !task.completedAt
    ) {
      return
    }

    const completedDate =
      task.completedAt.split('T')[0]

    const currentStats =
      statsByDate.get(completedDate)

    if (!currentStats) {
      return
    }

    currentStats.tasksCompleted += 1
  })

  return dates.map(
    (date) =>
      statsByDate.get(date) ?? {
        date,
        focusMinutes: 0,
        sessionsCompleted: 0,
        tasksCompleted: 0,
      },
  )
}

function buildProjectAnalytics(
  projects: Project[],
  sessions: PomodoroSession[],
): ProjectAnalytics[] {
  const projectStats = new Map<
    string,
    {
      focusMinutes: number
      sessions: number
    }
  >()

  sessions.forEach((session) => {
    if (
      session.type !== 'work' ||
      !session.projectId
    ) {
      return
    }

    const currentStats =
      projectStats.get(
        session.projectId,
      ) ?? {
        focusMinutes: 0,
        sessions: 0,
      }

    projectStats.set(
      session.projectId,
      {
        focusMinutes:
          currentStats.focusMinutes +
          session.durationMinutes,

        sessions:
          currentStats.sessions + 1,
      },
    )
  })

  return projects.map((project) => {
    const stats = projectStats.get(
      project.id,
    )

    return {
      ...project,

      calculatedFocusMinutes:
        stats?.focusMinutes ?? 0,

      calculatedSessions:
        stats?.sessions ?? 0,
    }
  })
}

export function useAnalytics() {
  const sessionsQuery =
    usePomodoroSessions()

  const tasksQuery = useTasks()
  const projectsQuery = useProjects()

  const sessions =
    sessionsQuery.data ?? []

  const tasks = tasksQuery.data ?? []
  const projects =
    projectsQuery.data ?? []

  const workSessions =
    sessions.filter(
      (session) =>
        session.type === 'work',
    )

  const weeklyDates = getLastDays(7)
  const monthlyDates =
    getLastDays(30)

  const weeklyData = buildDailyStats(
    weeklyDates,
    workSessions,
    tasks,
  )

  const monthlyData = buildDailyStats(
    monthlyDates,
    workSessions,
    tasks,
  )

  const totalFocusMinutes =
    workSessions.reduce(
      (total, session) =>
        total +
        session.durationMinutes,
      0,
    )

  const totalSessions =
    workSessions.length

  const weeklyFocusMinutes =
    weeklyData.reduce(
      (total, day) =>
        total + day.focusMinutes,
      0,
    )

  const averageDailyFocusMinutes =
    weeklyData.length > 0
      ? Math.round(
          weeklyFocusMinutes /
            weeklyData.length,
        )
      : 0

  const projectAnalytics =
    buildProjectAnalytics(
      projects,
      workSessions,
    ).sort(
      (firstProject, secondProject) =>
        secondProject.calculatedFocusMinutes -
        firstProject.calculatedFocusMinutes,
    )

  const topProject =
    projectAnalytics.find(
      (project) =>
        project.calculatedFocusMinutes >
        0,
    )

  const isLoading =
    sessionsQuery.isLoading ||
    tasksQuery.isLoading ||
    projectsQuery.isLoading

  const isError =
    sessionsQuery.isError ||
    tasksQuery.isError ||
    projectsQuery.isError

  const error =
    sessionsQuery.error ??
    tasksQuery.error ??
    projectsQuery.error

  return {
    weeklyData,
    monthlyData,
    totalFocusMinutes,
    totalSessions,
    averageDailyFocusMinutes,
    projectAnalytics,
    topProject,
    isLoading,
    isError,
    error,
  }
}