import {
  endOfDay,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from 'date-fns'

import { usePomodoroSessions } from '@/hooks/pomodoro/usePomodoroSessions'
import { useProjects } from '@/hooks/projects/useProjects'
import { useTasks } from '@/hooks/tasks/useTasks'

import type {
  DailyStats,
  PomodoroSession,
  Project,
  Task,
} from '@/types'

export type TrendRange =
  | 'week'
  | 'month'
  | 'year'
  | 'all'

export interface ProjectAnalytics
  extends Project {
  calculatedFocusMinutes: number
  calculatedSessions: number
}

export interface ProjectTrend
  extends Project {
  currentFocusMinutes: number
  previousFocusMinutes: number
  sharePercentage: number
  changePercentage: number | null
  isNew: boolean
}

export interface AnalyticsTrends {
  range: TrendRange
  totalFocusMinutes: number
  previousTotalFocusMinutes: number
  totalChangePercentage: number | null
  activeDays: number
  mostProductiveWeekday: string | null
  topProjects: ProjectTrend[]
}

export interface MonthlyProjectSummary {
  id: string
  name: string
  emoji: string
  color: string
  focusMinutes: number
}

export interface MonthlyFocusHistoryItem {
  key: string
  label: string
  fullLabel: string
  focusMinutes: number
  sessionsCompleted: number
  activeDays: number
  topProject: MonthlyProjectSummary | null
}

export interface MonthlyFocusHistory {
  months: MonthlyFocusHistoryItem[]
  totalFocusMinutes: number
  averageMonthlyFocusMinutes: number
  latestMonthChangePercentage: number | null
  bestMonth: MonthlyFocusHistoryItem | null
  topProject: MonthlyProjectSummary | null
}

interface TrendPeriod {
  currentStart: Date | null
  currentEnd: Date
  previousStart: Date | null
  previousEnd: Date | null
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

function getTrendPeriod(
  range: TrendRange,
): TrendPeriod {
  const today = new Date()

  if (range === 'week') {
    return {
      currentStart: startOfWeek(
        today,
        {
          weekStartsOn: 1,
        },
      ),
      currentEnd: today,
      previousStart: startOfWeek(
        subWeeks(today, 1),
        {
          weekStartsOn: 1,
        },
      ),
      previousEnd: subWeeks(
        today,
        1,
      ),
    }
  }

  if (range === 'month') {
    const previousMonthDate =
      subMonths(today, 1)

    return {
      currentStart:
        startOfMonth(today),
      currentEnd: today,
      previousStart:
        startOfMonth(
          previousMonthDate,
        ),
      previousEnd:
        previousMonthDate,
    }
  }

  if (range === 'year') {
    const previousYearDate =
      subYears(today, 1)

    return {
      currentStart:
        startOfYear(today),
      currentEnd: today,
      previousStart:
        startOfYear(
          previousYearDate,
        ),
      previousEnd:
        previousYearDate,
    }
  }

  return {
    currentStart: null,
    currentEnd: today,
    previousStart: null,
    previousEnd: null,
  }
}

function isSessionInPeriod(
  session: PomodoroSession,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start || !end) {
    return true
  }

  return isWithinInterval(
    parseISO(session.date),
    {
      start: startOfDay(start),
      end: endOfDay(end),
    },
  )
}

function calculateChangePercentage(
  currentValue: number,
  previousValue: number,
): number | null {
  if (previousValue <= 0) {
    return null
  }

  return Math.round(
    ((currentValue -
      previousValue) /
      previousValue) *
      100,
  )
}

function buildAnalyticsTrends(
  projects: Project[],
  workSessions: PomodoroSession[],
  range: TrendRange,
): AnalyticsTrends {
  const period =
    getTrendPeriod(range)

  const currentSessions =
    workSessions.filter((session) =>
      isSessionInPeriod(
        session,
        period.currentStart,
        period.currentEnd,
      ),
    )

  const previousSessions =
    period.previousStart &&
    period.previousEnd
      ? workSessions.filter(
          (session) =>
            isSessionInPeriod(
              session,
              period.previousStart,
              period.previousEnd,
            ),
        )
      : []

  const currentMinutesByProject =
    new Map<string, number>()

  const previousMinutesByProject =
    new Map<string, number>()

  currentSessions.forEach(
    (session) => {
      if (!session.projectId) {
        return
      }

      currentMinutesByProject.set(
        session.projectId,
        (currentMinutesByProject.get(
          session.projectId,
        ) ?? 0) +
          session.durationMinutes,
      )
    },
  )

  previousSessions.forEach(
    (session) => {
      if (!session.projectId) {
        return
      }

      previousMinutesByProject.set(
        session.projectId,
        (previousMinutesByProject.get(
          session.projectId,
        ) ?? 0) +
          session.durationMinutes,
      )
    },
  )

  const totalFocusMinutes =
    currentSessions.reduce(
      (total, session) =>
        total +
        session.durationMinutes,
      0,
    )

  const previousTotalFocusMinutes =
    previousSessions.reduce(
      (total, session) =>
        total +
        session.durationMinutes,
      0,
    )

  const topProjects =
    projects
      .map((project) => {
        const currentFocusMinutes =
          currentMinutesByProject.get(
            project.id,
          ) ?? 0

        const previousFocusMinutes =
          previousMinutesByProject.get(
            project.id,
          ) ?? 0

        return {
          ...project,
          currentFocusMinutes,
          previousFocusMinutes,
          sharePercentage:
            totalFocusMinutes > 0
              ? Math.round(
                  (currentFocusMinutes /
                    totalFocusMinutes) *
                    100,
                )
              : 0,
          changePercentage:
            calculateChangePercentage(
              currentFocusMinutes,
              previousFocusMinutes,
            ),
          isNew:
            currentFocusMinutes > 0 &&
            previousFocusMinutes === 0,
        }
      })
      .filter(
        (project) =>
          project.currentFocusMinutes >
          0,
      )
      .sort(
        (
          firstProject,
          secondProject,
        ) =>
          secondProject.currentFocusMinutes -
          firstProject.currentFocusMinutes,
      )

  const focusMinutesByWeekday =
    new Map<string, number>()

  currentSessions.forEach(
    (session) => {
      const weekday = format(
        parseISO(session.date),
        'EEEE',
      )

      focusMinutesByWeekday.set(
        weekday,
        (focusMinutesByWeekday.get(
          weekday,
        ) ?? 0) +
          session.durationMinutes,
      )
    },
  )

  const mostProductiveWeekday =
    Array.from(
      focusMinutesByWeekday.entries(),
    ).sort(
      (
        firstWeekday,
        secondWeekday,
      ) =>
        secondWeekday[1] -
        firstWeekday[1],
    )[0]?.[0] ?? null

  return {
    range,
    totalFocusMinutes,
    previousTotalFocusMinutes,
    totalChangePercentage:
      range === 'all'
        ? null
        : calculateChangePercentage(
            totalFocusMinutes,
            previousTotalFocusMinutes,
          ),
    activeDays: new Set(
      currentSessions.map(
        (session) =>
          session.date,
      ),
    ).size,
    mostProductiveWeekday,
    topProjects,
  }
}

function buildMonthlyFocusHistory(
  projects: Project[],
  workSessions: PomodoroSession[],
  amount = 6,
): MonthlyFocusHistory {
  const today = new Date()

  const projectById = new Map(
    projects.map((project) => [
      project.id,
      project,
    ]),
  )

  const monthStarts = Array.from(
    {
      length: amount,
    },
    (_, index) =>
      startOfMonth(
        subMonths(
          today,
          amount - 1 - index,
        ),
      ),
  )

  const monthKeys = new Set(
    monthStarts.map((monthStart) =>
      format(
        monthStart,
        'yyyy-MM',
      ),
    ),
  )

  const historySessions =
    workSessions.filter((session) =>
      monthKeys.has(
        session.date.slice(0, 7),
      ),
    )

  const months =
    monthStarts.map(
      (
        monthStart,
      ): MonthlyFocusHistoryItem => {
        const monthKey = format(
          monthStart,
          'yyyy-MM',
        )

        const monthSessions =
          historySessions.filter(
            (session) =>
              session.date.startsWith(
                monthKey,
              ),
          )

        const projectMinutes =
          new Map<string, number>()

        monthSessions.forEach(
          (session) => {
            if (!session.projectId) {
              return
            }

            projectMinutes.set(
              session.projectId,
              (projectMinutes.get(
                session.projectId,
              ) ?? 0) +
                session.durationMinutes,
            )
          },
        )

        const topProjectEntry =
          Array.from(
            projectMinutes.entries(),
          ).sort(
            (
              firstProject,
              secondProject,
            ) =>
              secondProject[1] -
              firstProject[1],
          )[0]

        const topProjectData =
          topProjectEntry
            ? projectById.get(
                topProjectEntry[0],
              )
            : null

        const topProject =
          topProjectEntry &&
          topProjectData
            ? {
                id: topProjectData.id,
                name:
                  topProjectData.name,
                emoji:
                  topProjectData.emoji,
                color:
                  topProjectData.color,
                focusMinutes:
                  topProjectEntry[1],
              }
            : null

        return {
          key: monthKey,
          label: format(
            monthStart,
            'MMM',
          ),
          fullLabel: format(
            monthStart,
            'MMMM yyyy',
          ),
          focusMinutes:
            monthSessions.reduce(
              (
                total,
                session,
              ) =>
                total +
                session.durationMinutes,
              0,
            ),
          sessionsCompleted:
            monthSessions.length,
          activeDays: new Set(
            monthSessions.map(
              (session) =>
                session.date,
            ),
          ).size,
          topProject,
        }
      },
    )

  const totalFocusMinutes =
    months.reduce(
      (total, month) =>
        total +
        month.focusMinutes,
      0,
    )

  const bestMonth =
    [...months]
      .filter(
        (month) =>
          month.focusMinutes > 0,
      )
      .sort(
        (
          firstMonth,
          secondMonth,
        ) =>
          secondMonth.focusMinutes -
          firstMonth.focusMinutes,
      )[0] ?? null

  const overallProjectMinutes =
    new Map<string, number>()

  historySessions.forEach(
    (session) => {
      if (!session.projectId) {
        return
      }

      overallProjectMinutes.set(
        session.projectId,
        (overallProjectMinutes.get(
          session.projectId,
        ) ?? 0) +
          session.durationMinutes,
      )
    },
  )

  const overallTopProjectEntry =
    Array.from(
      overallProjectMinutes.entries(),
    ).sort(
      (
        firstProject,
        secondProject,
      ) =>
        secondProject[1] -
        firstProject[1],
    )[0]

  const overallTopProjectData =
    overallTopProjectEntry
      ? projectById.get(
          overallTopProjectEntry[0],
        )
      : null

  const topProject =
    overallTopProjectEntry &&
    overallTopProjectData
      ? {
          id:
            overallTopProjectData.id,
          name:
            overallTopProjectData.name,
          emoji:
            overallTopProjectData.emoji,
          color:
            overallTopProjectData.color,
          focusMinutes:
            overallTopProjectEntry[1],
        }
      : null

  const latestMonth =
    months[months.length - 1]

  const previousMonth =
    months[months.length - 2]

  return {
    months,
    totalFocusMinutes,
    averageMonthlyFocusMinutes:
      months.length > 0
        ? Math.round(
            totalFocusMinutes /
              months.length,
          )
        : 0,
    latestMonthChangePercentage:
      latestMonth &&
      previousMonth
        ? calculateChangePercentage(
            latestMonth.focusMinutes,
            previousMonth.focusMinutes,
          )
        : null,
    bestMonth,
    topProject,
  }
}

export function useAnalytics(
  trendRange: TrendRange = 'week',
) {
  const sessionsQuery =
    usePomodoroSessions()

  const tasksQuery = useTasks()
  const projectsQuery = useProjects()

  const sessions =
    sessionsQuery.data ?? []

  const tasks =
    tasksQuery.data ?? []

  const projects =
    projectsQuery.data ?? []

  const workSessions =
    sessions.filter(
      (session) =>
        session.type === 'work',
    )

  const weeklyDates =
    getLastDays(7)

  const monthlyDates =
    getLastDays(30)

  const weeklyData =
    buildDailyStats(
      weeklyDates,
      workSessions,
      tasks,
    )

  const monthlyData =
    buildDailyStats(
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
        total +
        day.focusMinutes,
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
      (
        firstProject,
        secondProject,
      ) =>
        secondProject.calculatedFocusMinutes -
        firstProject.calculatedFocusMinutes,
    )

  const topProject =
    projectAnalytics.find(
      (project) =>
        project.calculatedFocusMinutes >
        0,
    )

  const trends =
    buildAnalyticsTrends(
      projects,
      workSessions,
      trendRange,
    )

  const monthlyHistory =
    buildMonthlyFocusHistory(
      projects,
      workSessions,
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
    monthlyHistory,
    totalFocusMinutes,
    totalSessions,
    averageDailyFocusMinutes,
    projectAnalytics,
    topProject,
    trends,
    isLoading,
    isError,
    error,
  }
}