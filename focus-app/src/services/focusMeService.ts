import { supabase } from '@/lib/supabase'

import type {
  TaskCategory,
} from '@/types'

interface ActivityEventRow {
  event_type: string
  entity_id: string | null
  occurred_at: string
  local_date: string
  local_hour: number
  metadata: Record<string, unknown>
}

interface TaskMetricRow {
  id: string
  category: TaskCategory
}

interface ProjectMetricRow {
  id: string
  name: string
  emoji: string
  color: string | null
}

interface PomodoroMetricRow {
  id: string
  type:
    | 'work'
    | 'short_break'
    | 'long_break'
  project_id: string | null
  duration_minutes: number
  completed_at: string
}

export interface FocusMeDayMetric {
  date: string
  weekday: number
  focusMinutes: number
  sessions: number
}

export interface FocusMeCategoryMetric {
  category: TaskCategory
  created: number
  completed: number
}

export interface FocusMeTopProject {
  id: string
  name: string
  emoji: string
  color: string
  focusMinutes: number
  sessions: number
}

export interface FocusMeWeeklyReport {
  period: {
    start: string
    end: string
  }

  focus: {
    totalMinutes: number
    completedSessions: number
    activeDays: number
    averageMinutesPerActiveDay: number
    bestDay: FocusMeDayMetric | null
    leastFocusedActiveDay:
      FocusMeDayMetric | null
    days: FocusMeDayMetric[]
    morningMinutes: number
    afternoonMinutes: number
    eveningMinutes: number
    lateNightMinutes: number
  }

  tasks: {
    created: number
    completed: number
    reopened: number
    deleted: number
    restored: number
    categories:
      FocusMeCategoryMetric[]
  }

  projects: {
    created: number
    completed: number
    reopened: number
    topProject:
      FocusMeTopProject | null
  }

  goals: {
    created: number
    completed: number
    reopened: number
  }

  rhythm: {
    starts: number
    pauses: number
    resumes: number
    abandoned: number
    completionRate: number
  }

  activityEvents: number
}

const TASK_CATEGORIES:
  TaskCategory[] = [
    'quick',
    'planned',
    'urgent',
    'long_term',
  ]

function pad(
  value: number,
): string {
  return String(value).padStart(2, '0')
}

function toLocalDate(
  date: Date,
): string {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-')
}

function getWeekRange(
  referenceDate = new Date(),
) {
  const start =
    new Date(referenceDate)

  start.setHours(0, 0, 0, 0)

  const daysSinceMonday =
    (start.getDay() + 6) % 7

  start.setDate(
    start.getDate() -
      daysSinceMonday,
  )

  const end = new Date(start)
  end.setDate(end.getDate() + 7)

  return {
    start,
    end,
    startDate:
      toLocalDate(start),
    endDate: toLocalDate(end),
  }
}

function countEvent(
  events: ActivityEventRow[],
  eventType: string,
): number {
  return events.filter(
    (event) =>
      event.event_type === eventType,
  ).length
}

function getEventMetadataString(
  event: ActivityEventRow,
  key: string,
): string | null {
  const value =
    event.metadata[key]

  return typeof value === 'string'
    ? value
    : null
}

function mergeEntityCategories(
  rows: TaskMetricRow[],
  events: ActivityEventRow[],
  eventType: string,
): Map<string, TaskCategory> {
  const result = new Map<
    string,
    TaskCategory
  >()

  rows.forEach((row) => {
    result.set(row.id, row.category)
  })

  events
    .filter(
      (event) =>
        event.event_type ===
          eventType &&
        event.entity_id,
    )
    .forEach((event) => {
      const category =
        getEventMetadataString(
          event,
          'category',
        )

      if (
        category &&
        TASK_CATEGORIES.includes(
          category as TaskCategory,
        )
      ) {
        result.set(
          event.entity_id as string,
          category as TaskCategory,
        )
      }
    })

  return result
}

export async function getFocusMeWeeklyReport(
  referenceDate = new Date(),
): Promise<FocusMeWeeklyReport> {
  const {
    start,
    end,
    startDate,
    endDate,
  } = getWeekRange(referenceDate)

  const startIso =
    start.toISOString()
  const endIso =
    end.toISOString()

  const [
    eventsResult,
    sessionsResult,
    createdTasksResult,
    completedTasksResult,
    createdProjectsResult,
    completedProjectsResult,
    projectsResult,
    createdGoalsResult,
    completedGoalsResult,
  ] = await Promise.all([
    supabase
      .from('activity_events')
      .select(`
        event_type,
        entity_id,
        occurred_at,
        local_date,
        local_hour,
        metadata
      `)
      .gte('occurred_at', startIso)
      .lt('occurred_at', endIso)
      .order('occurred_at', {
        ascending: true,
      })
      .limit(5000),

    supabase
      .from('pomodoro_sessions')
      .select(`
        id,
        type,
        project_id,
        duration_minutes,
        completed_at
      `)
      .gte('completed_at', startIso)
      .lt('completed_at', endIso)
      .order('completed_at', {
        ascending: true,
      }),

    supabase
      .from('tasks')
      .select('id, category')
      .gte('created_at', startIso)
      .lt('created_at', endIso),

    supabase
      .from('tasks')
      .select('id, category')
      .gte('completed_at', startIso)
      .lt('completed_at', endIso),

    supabase
      .from('projects')
      .select('id')
      .gte('created_at', startIso)
      .lt('created_at', endIso),

    supabase
      .from('projects')
      .select('id')
      .gte('completed_at', startIso)
      .lt('completed_at', endIso),

    supabase
      .from('projects')
      .select(`
        id,
        name,
        emoji,
        color
      `),

    supabase
      .from('goals')
      .select('id')
      .gte('created_at', startIso)
      .lt('created_at', endIso),

    supabase
      .from('goals')
      .select('id')
      .gte('completed_at', startIso)
      .lt('completed_at', endIso),
  ])

  const results = [
    eventsResult,
    sessionsResult,
    createdTasksResult,
    completedTasksResult,
    createdProjectsResult,
    completedProjectsResult,
    projectsResult,
    createdGoalsResult,
    completedGoalsResult,
  ]

  const failedResult =
    results.find(
      (result) => result.error,
    )

  if (failedResult?.error) {
    throw failedResult.error
  }

  const events =
    (eventsResult.data ??
      []) as ActivityEventRow[]

  const sessions =
    (sessionsResult.data ??
      []) as PomodoroMetricRow[]

  const createdTasks =
    (createdTasksResult.data ??
      []) as TaskMetricRow[]

  const completedTasks =
    (completedTasksResult.data ??
      []) as TaskMetricRow[]

  const projects =
    (projectsResult.data ??
      []) as ProjectMetricRow[]

  const workSessions =
    sessions.filter(
      (session) =>
        session.type === 'work',
    )

  const completionEvents =
    new Map(
      events
        .filter(
          (event) =>
            event.event_type ===
              'pomodoro_completed' &&
            event.entity_id,
        )
        .map((event) => [
          event.entity_id as string,
          event,
        ]),
    )

  const dayMap = new Map<
    string,
    FocusMeDayMetric
  >()

  for (
    let index = 0;
    index < 7;
    index += 1
  ) {
    const date = new Date(start)
    date.setDate(
      start.getDate() + index,
    )

    const localDate =
      toLocalDate(date)

    dayMap.set(localDate, {
      date: localDate,
      weekday: date.getDay(),
      focusMinutes: 0,
      sessions: 0,
    })
  }

  let morningMinutes = 0
  let afternoonMinutes = 0
  let eveningMinutes = 0
  let lateNightMinutes = 0

  const projectTotals = new Map<
    string,
    {
      focusMinutes: number
      sessions: number
    }
  >()

  workSessions.forEach((session) => {
    const event =
      completionEvents.get(session.id)

    const completedDate =
      new Date(session.completed_at)

    const localDate =
      event?.local_date ??
      toLocalDate(completedDate)

    const localHour =
      event?.local_hour ??
      completedDate.getHours()

    const day =
      dayMap.get(localDate)

    if (day) {
      day.focusMinutes +=
        session.duration_minutes
      day.sessions += 1
    }

    if (
      localHour >= 5 &&
      localHour < 12
    ) {
      morningMinutes +=
        session.duration_minutes
    } else if (
      localHour >= 12 &&
      localHour < 18
    ) {
      afternoonMinutes +=
        session.duration_minutes
    } else if (
      localHour >= 18 &&
      localHour < 23
    ) {
      eveningMinutes +=
        session.duration_minutes
    } else {
      lateNightMinutes +=
        session.duration_minutes
    }

    if (session.project_id) {
      const current =
        projectTotals.get(
          session.project_id,
        ) ?? {
          focusMinutes: 0,
          sessions: 0,
        }

      current.focusMinutes +=
        session.duration_minutes
      current.sessions += 1

      projectTotals.set(
        session.project_id,
        current,
      )
    }
  })

  const days = [
    ...dayMap.values(),
  ]

  const activeDays =
    days.filter(
      (day) => day.focusMinutes > 0,
    )

  const bestDay =
    activeDays.length > 0
      ? [...activeDays].sort(
          (first, second) =>
            second.focusMinutes -
            first.focusMinutes,
        )[0]
      : null

  const leastFocusedActiveDay =
    activeDays.length > 0
      ? [...activeDays].sort(
          (first, second) =>
            first.focusMinutes -
            second.focusMinutes,
        )[0]
      : null

  const totalMinutes =
    workSessions.reduce(
      (total, session) =>
        total +
        session.duration_minutes,
      0,
    )

  const createdCategoryMap =
    mergeEntityCategories(
      createdTasks,
      events,
      'task_created',
    )

  const completedCategoryMap =
    mergeEntityCategories(
      completedTasks,
      events,
      'task_completed',
    )

  const categories =
    TASK_CATEGORIES.map(
      (category) => ({
        category,
        created: [
          ...createdCategoryMap.values(),
        ].filter(
          (value) =>
            value === category,
        ).length,
        completed: [
          ...completedCategoryMap.values(),
        ].filter(
          (value) =>
            value === category,
        ).length,
      }),
    )

  const createdProjectIds =
    new Set(
      (
        createdProjectsResult.data ??
        []
      ).map((project) => project.id),
    )

  const completedProjectIds =
    new Set(
      (
        completedProjectsResult.data ??
        []
      ).map((project) => project.id),
    )

  const createdGoalIds =
    new Set(
      (
        createdGoalsResult.data ??
        []
      ).map((goal) => goal.id),
    )

  const completedGoalIds =
    new Set(
      (
        completedGoalsResult.data ??
        []
      ).map((goal) => goal.id),
    )

  events.forEach((event) => {
    if (!event.entity_id) {
      return
    }

    if (
      event.event_type ===
      'project_created'
    ) {
      createdProjectIds.add(
        event.entity_id,
      )
    }

    if (
      event.event_type ===
      'project_completed'
    ) {
      completedProjectIds.add(
        event.entity_id,
      )
    }

    if (
      event.event_type ===
      'goal_created'
    ) {
      createdGoalIds.add(
        event.entity_id,
      )
    }

    if (
      event.event_type ===
      'goal_completed'
    ) {
      completedGoalIds.add(
        event.entity_id,
      )
    }
  })

  const rankedProjects = [
    ...projectTotals.entries(),
  ].sort(
    (first, second) =>
      second[1].focusMinutes -
      first[1].focusMinutes,
  )

  let topProject:
    FocusMeTopProject | null = null

  const topProjectEntry =
    rankedProjects[0]

  if (topProjectEntry) {
    const [
      projectId,
      totals,
    ] = topProjectEntry

    const project =
      projects.find(
        (item) =>
          item.id === projectId,
      )

    if (project) {
      topProject = {
        id: project.id,
        name: project.name,
        emoji: project.emoji,
        color:
          project.color ??
          '#10b981',
        focusMinutes:
          totals.focusMinutes,
        sessions:
          totals.sessions,
      }
    }
  }

  const starts = countEvent(
    events,
    'pomodoro_started',
  )

  const completedSessions =
    workSessions.length

  return {
    period: {
      start: startDate,
      end: endDate,
    },

    focus: {
      totalMinutes,
      completedSessions,
      activeDays:
        activeDays.length,
      averageMinutesPerActiveDay:
        activeDays.length > 0
          ? Math.round(
              totalMinutes /
                activeDays.length,
            )
          : 0,
      bestDay,
      leastFocusedActiveDay,
      days,
      morningMinutes,
      afternoonMinutes,
      eveningMinutes,
      lateNightMinutes,
    },

    tasks: {
      created:
        createdCategoryMap.size,
      completed:
        completedCategoryMap.size,
      reopened: countEvent(
        events,
        'task_reopened',
      ),
      deleted: countEvent(
        events,
        'task_deleted',
      ),
      restored: countEvent(
        events,
        'task_restored',
      ),
      categories,
    },

    projects: {
      created:
        createdProjectIds.size,
      completed:
        completedProjectIds.size,
      reopened: countEvent(
        events,
        'project_reopened',
      ),
      topProject,
    },

    goals: {
      created:
        createdGoalIds.size,
      completed:
        completedGoalIds.size,
      reopened: countEvent(
        events,
        'goal_reopened',
      ),
    },

    rhythm: {
      starts,
      pauses: countEvent(
        events,
        'pomodoro_paused',
      ),
      resumes: countEvent(
        events,
        'pomodoro_resumed',
      ),
      abandoned: countEvent(
        events,
        'pomodoro_abandoned',
      ),
      completionRate:
        starts > 0
          ? Math.min(
              100,
              Math.round(
                (
                  completedSessions /
                  starts
                ) * 100,
              ),
            )
          : 0,
    },

    activityEvents:
      events.length,
  }
}
