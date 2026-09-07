import { supabase } from '@/lib/supabase'

import type {
  TaskCategory,
} from '@/types'

export type TimeBlock =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'late_night'

interface ActivityEventRow {
  event_type: string
  entity_id: string | null
  occurred_at: string
  local_date: string
  local_hour: number
  metadata: Record<string, unknown>
}

interface SessionRow {
  id: string
  type:
    | 'work'
    | 'short_break'
    | 'long_break'
  project_id: string | null
  duration_minutes: number
  completed_at: string
}

interface TaskCreatedRow {
  id: string
  category: TaskCategory
  created_at: string
}

interface TaskCompletedRow {
  id: string
  category: TaskCategory
  completed_at: string
}

interface ProjectRow {
  id: string
  name: string
  emoji: string
  color: string | null
  created_at: string
  completed_at: string | null
}

interface GoalRow {
  id: string
  created_at: string
  completed_at: string | null
}

interface MonthlySourceData {
  events: ActivityEventRow[]
  sessions: SessionRow[]
  createdTasks: TaskCreatedRow[]
  completedTasks: TaskCompletedRow[]
  projects: ProjectRow[]
  goals: GoalRow[]
}

export interface FocusMeMonthlyCategory {
  category: TaskCategory
  created: number
  completed: number
}

export interface FocusMeMonthlyWeek {
  week: number
  focusMinutes: number
  sessions: number
}

export interface FocusMeMonthlyTopProject {
  id: string
  name: string
  emoji: string
  color: string
  focusMinutes: number
  sessions: number
}

export interface FocusMeBehaviorSignals {
  planningTimeBlocks: Record<
    TimeBlock,
    number
  >
  executionTimeBlocks: Record<
    TimeBlock,
    number
  >
  taskCreationTimeBlocks: Record<
    TimeBlock,
    number
  >
  taskCompletionTimeBlocks: Record<
    TimeBlock,
    number
  >
  projectCreationTimeBlocks: Record<
    TimeBlock,
    number
  >
  goalCreationTimeBlocks: Record<
    TimeBlock,
    number
  >
  categoryDiversity: number
  focusTimeDiversity: number
  projectFocusShare: number
  strongestWeekShare: number
  completionBalance: number
  abandonmentRate: number
  recoveryActions: number
}

export interface FocusMeMonthlyMetrics {
  focusMinutes: number
  completedSessions: number
  activeDays: number
  averageMinutesPerActiveDay: number
  weeks: FocusMeMonthlyWeek[]

  timeBlocks: Record<
    TimeBlock,
    number
  >

  dominantTimeBlock:
    TimeBlock | null

  tasks: {
    created: number
    completed: number
    reopened: number
    deleted: number
    restored: number
    categories:
      FocusMeMonthlyCategory[]
  }

  projects: {
    created: number
    completed: number
    reopened: number
    topProjects:
      FocusMeMonthlyTopProject[]
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
  }

  behavior:
    FocusMeBehaviorSignals

  coverage: {
    meaningfulActions: number
    featureAreasUsed: number
    activityEvents: number
  }
}

export interface FocusMeMonthlyReport {
  period: {
    start: string
    end: string
    month: number
    year: number
  }

  current:
    FocusMeMonthlyMetrics

  previous:
    FocusMeMonthlyMetrics

  comparison: {
    focusMinutesPercent:
      number | null
    sessionsPercent:
      number | null
    tasksCompletedPercent:
      number | null
    activeDaysPercent:
      number | null
  }
}

const CATEGORIES:
  TaskCategory[] = [
    'quick',
    'planned',
    'urgent',
    'long_term',
  ]

const TIME_BLOCKS:
  TimeBlock[] = [
    'morning',
    'afternoon',
    'evening',
    'late_night',
  ]

function pad(
  value: number,
): string {
  return String(value).padStart(2, '0')
}

function localDate(
  date: Date,
): string {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-')
}

function inPeriod(
  value: string,
  start: Date,
  end: Date,
): boolean {
  const timestamp =
    new Date(value).getTime()

  return (
    timestamp >= start.getTime() &&
    timestamp < end.getTime()
  )
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

function eventCategory(
  event: ActivityEventRow,
): TaskCategory | null {
  const category =
    event.metadata.category

  return (
    typeof category === 'string' &&
    CATEGORIES.includes(
      category as TaskCategory,
    )
  )
    ? category as TaskCategory
    : null
}

function emptyTimeBlocks(): Record<
  TimeBlock,
  number
> {
  return {
    morning: 0,
    afternoon: 0,
    evening: 0,
    late_night: 0,
  }
}

function countEventTimeBlocks(
  events: ActivityEventRow[],
  eventTypes: string[],
): Record<TimeBlock, number> {
  const result =
    emptyTimeBlocks()

  events
    .filter(
      (event) =>
        eventTypes.includes(
          event.event_type,
        ),
    )
    .forEach((event) => {
      const block =
        getTimeBlock(
          event.local_hour,
        )

      result[block] += 1
    })

  return result
}

function getTimeBlock(
  hour: number,
): TimeBlock {
  if (hour >= 5 && hour < 12) {
    return 'morning'
  }

  if (hour >= 12 && hour < 18) {
    return 'afternoon'
  }

  if (hour >= 18 && hour < 23) {
    return 'evening'
  }

  return 'late_night'
}

function percentageChange(
  current: number,
  previous: number,
): number | null {
  if (previous === 0) {
    return null
  }

  return Math.round(
    (
      (current - previous) /
      previous
    ) * 100,
  )
}

function calculateMetrics(
  source: MonthlySourceData,
  start: Date,
  end: Date,
): FocusMeMonthlyMetrics {
  const events =
    source.events.filter(
      (event) =>
        inPeriod(
          event.occurred_at,
          start,
          end,
        ),
    )

  const sessions =
    source.sessions.filter(
      (session) =>
        inPeriod(
          session.completed_at,
          start,
          end,
        ),
    )

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

  const activeDates =
    new Set<string>()

  const weeks = new Map<
    number,
    FocusMeMonthlyWeek
  >()

  const timeBlocks =
    emptyTimeBlocks()

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

    const date =
      event?.local_date ??
      localDate(completedDate)

    const hour =
      event?.local_hour ??
      completedDate.getHours()

    activeDates.add(date)

    const dayOfMonth =
      Number(date.slice(8, 10))

    const weekNumber =
      Math.floor(
        (dayOfMonth - 1) / 7,
      ) + 1

    const week =
      weeks.get(weekNumber) ?? {
        week: weekNumber,
        focusMinutes: 0,
        sessions: 0,
      }

    week.focusMinutes +=
      session.duration_minutes
    week.sessions += 1

    weeks.set(
      weekNumber,
      week,
    )

    const block =
      getTimeBlock(hour)

    timeBlocks[block] +=
      session.duration_minutes

    if (session.project_id) {
      const project =
        projectTotals.get(
          session.project_id,
        ) ?? {
          focusMinutes: 0,
          sessions: 0,
        }

      project.focusMinutes +=
        session.duration_minutes
      project.sessions += 1

      projectTotals.set(
        session.project_id,
        project,
      )
    }
  })

  const createdTaskMap = new Map<
    string,
    TaskCategory
  >()

  source.createdTasks
    .filter(
      (task) =>
        inPeriod(
          task.created_at,
          start,
          end,
        ),
    )
    .forEach((task) => {
      createdTaskMap.set(
        task.id,
        task.category,
      )
    })

  const completedTaskMap = new Map<
    string,
    TaskCategory
  >()

  source.completedTasks
    .filter(
      (task) =>
        inPeriod(
          task.completed_at,
          start,
          end,
        ),
    )
    .forEach((task) => {
      completedTaskMap.set(
        task.id,
        task.category,
      )
    })

  events.forEach((event) => {
    if (!event.entity_id) {
      return
    }

    const category =
      eventCategory(event)

    if (
      category &&
      event.event_type ===
        'task_created'
    ) {
      createdTaskMap.set(
        event.entity_id,
        category,
      )
    }

    if (
      category &&
      event.event_type ===
        'task_completed'
    ) {
      completedTaskMap.set(
        event.entity_id,
        category,
      )
    }
  })

  const categories =
    CATEGORIES.map(
      (category) => ({
        category,
        created: [
          ...createdTaskMap.values(),
        ].filter(
          (value) =>
            value === category,
        ).length,
        completed: [
          ...completedTaskMap.values(),
        ].filter(
          (value) =>
            value === category,
        ).length,
      }),
    )

  const createdProjects =
    new Set(
      source.projects
        .filter(
          (project) =>
            inPeriod(
              project.created_at,
              start,
              end,
            ),
        )
        .map(
          (project) => project.id,
        ),
    )

  const completedProjects =
    new Set(
      source.projects
        .filter(
          (project) =>
            project.completed_at &&
            inPeriod(
              project.completed_at,
              start,
              end,
            ),
        )
        .map(
          (project) => project.id,
        ),
    )

  const createdGoals =
    new Set(
      source.goals
        .filter(
          (goal) =>
            inPeriod(
              goal.created_at,
              start,
              end,
            ),
        )
        .map((goal) => goal.id),
    )

  const completedGoals =
    new Set(
      source.goals
        .filter(
          (goal) =>
            goal.completed_at &&
            inPeriod(
              goal.completed_at,
              start,
              end,
            ),
        )
        .map((goal) => goal.id),
    )

  events.forEach((event) => {
    if (!event.entity_id) {
      return
    }

    if (
      event.event_type ===
      'project_created'
    ) {
      createdProjects.add(
        event.entity_id,
      )
    }

    if (
      event.event_type ===
      'project_completed'
    ) {
      completedProjects.add(
        event.entity_id,
      )
    }

    if (
      event.event_type ===
      'goal_created'
    ) {
      createdGoals.add(
        event.entity_id,
      )
    }

    if (
      event.event_type ===
      'goal_completed'
    ) {
      completedGoals.add(
        event.entity_id,
      )
    }
  })

  const topProjects =
    [...projectTotals.entries()]
      .sort(
        (first, second) =>
          second[1].focusMinutes -
          first[1].focusMinutes,
      )
      .slice(0, 3)
      .flatMap(
        ([
          projectId,
          totals,
        ]) => {
          const project =
            source.projects.find(
              (item) =>
                item.id ===
                projectId,
            )

          return project
            ? [{
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
              }]
            : []
        },
      )

  const focusMinutes =
    workSessions.reduce(
      (total, session) =>
        total +
        session.duration_minutes,
      0,
    )

  const dominantTimeBlock =
    focusMinutes > 0
      ? TIME_BLOCKS.reduce(
          (dominant, block) =>
            timeBlocks[block] >
            timeBlocks[dominant]
              ? block
              : dominant,
          TIME_BLOCKS[0],
        )
      : null

  const featureAreas = [
    workSessions.length > 0,
    createdTaskMap.size > 0 ||
      completedTaskMap.size > 0,
    createdProjects.size > 0 ||
      completedProjects.size > 0 ||
      projectTotals.size > 0,
    createdGoals.size > 0 ||
      completedGoals.size > 0,
  ].filter(Boolean).length

  const meaningfulActions =
    workSessions.length +
    completedTaskMap.size +
    completedProjects.size +
    completedGoals.size

  const planningTimeBlocks =
    countEventTimeBlocks(
      events,
      [
        'task_created',
        'project_created',
        'goal_created',
      ],
    )

  const executionTimeBlocks =
    countEventTimeBlocks(
      events,
      [
        'task_completed',
        'project_completed',
        'goal_completed',
      ],
    )

  const taskCreationTimeBlocks =
    countEventTimeBlocks(
      events,
      ['task_created'],
    )

  const taskCompletionTimeBlocks =
    countEventTimeBlocks(
      events,
      ['task_completed'],
    )

  const projectCreationTimeBlocks =
    countEventTimeBlocks(
      events,
      ['project_created'],
    )

  const goalCreationTimeBlocks =
    countEventTimeBlocks(
      events,
      ['goal_created'],
    )

  const categoryDiversity =
    categories.filter(
      (category) =>
        category.created > 0 ||
        category.completed > 0,
    ).length

  const focusTimeDiversity =
    TIME_BLOCKS.filter(
      (block) =>
        timeBlocks[block] > 0,
    ).length

  const topProjectMinutes =
    topProjects[0]
      ?.focusMinutes ?? 0

  const projectFocusShare =
    focusMinutes > 0
      ? Math.round(
          (
            topProjectMinutes /
            focusMinutes
          ) * 100,
        )
      : 0

  const strongestWeekMinutes =
    Math.max(
      ...[...weeks.values()].map(
        (week) =>
          week.focusMinutes,
      ),
      0,
    )

  const strongestWeekShare =
    focusMinutes > 0
      ? Math.round(
          (
            strongestWeekMinutes /
            focusMinutes
          ) * 100,
        )
      : 0

  const completionBalance =
    createdTaskMap.size > 0
      ? Math.round(
          (
            completedTaskMap.size /
            createdTaskMap.size
          ) * 100,
        )
      : completedTaskMap.size > 0
        ? 100
        : 0

  const starts =
    countEvent(
      events,
      'pomodoro_started',
    )

  const abandoned =
    countEvent(
      events,
      'pomodoro_abandoned',
    )

  const abandonmentRate =
    starts > 0
      ? Math.min(
          100,
          Math.round(
            (
              abandoned /
              starts
            ) * 100,
          ),
        )
      : 0

  const recoveryActions =
    countEvent(
      events,
      'pomodoro_resumed',
    ) +
    countEvent(
      events,
      'task_restored',
    ) +
    countEvent(
      events,
      'task_reopened',
    ) +
    countEvent(
      events,
      'project_reopened',
    ) +
    countEvent(
      events,
      'goal_reopened',
    )

  return {
    focusMinutes,
    completedSessions:
      workSessions.length,
    activeDays:
      activeDates.size,
    averageMinutesPerActiveDay:
      activeDates.size > 0
        ? Math.round(
            focusMinutes /
            activeDates.size,
          )
        : 0,
    weeks: [...weeks.values()]
      .sort(
        (first, second) =>
          first.week -
          second.week,
      ),
    timeBlocks,
    dominantTimeBlock,

    tasks: {
      created:
        createdTaskMap.size,
      completed:
        completedTaskMap.size,
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
        createdProjects.size,
      completed:
        completedProjects.size,
      reopened: countEvent(
        events,
        'project_reopened',
      ),
      topProjects,
    },

    goals: {
      created:
        createdGoals.size,
      completed:
        completedGoals.size,
      reopened: countEvent(
        events,
        'goal_reopened',
      ),
    },

    rhythm: {
      starts: countEvent(
        events,
        'pomodoro_started',
      ),
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
    },

    behavior: {
      planningTimeBlocks,
      executionTimeBlocks,
      taskCreationTimeBlocks,
      taskCompletionTimeBlocks,
      projectCreationTimeBlocks,
      goalCreationTimeBlocks,
      categoryDiversity,
      focusTimeDiversity,
      projectFocusShare,
      strongestWeekShare,
      completionBalance,
      abandonmentRate,
      recoveryActions,
    },

    coverage: {
      meaningfulActions,
      featureAreasUsed:
        featureAreas,
      activityEvents:
        events.length,
    },
  }
}

export async function getFocusMeMonthlyReport(
  referenceDate = new Date(),
): Promise<FocusMeMonthlyReport> {
  const currentStart =
    new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1,
    )

  const currentEnd =
    new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() + 1,
      1,
    )

  const previousStart =
    new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth() - 1,
      1,
    )

  const firstIso =
    previousStart.toISOString()

  const finalIso =
    currentEnd.toISOString()

  const [
    eventsResult,
    sessionsResult,
    createdTasksResult,
    completedTasksResult,
    projectsResult,
    goalsResult,
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
      .gte('occurred_at', firstIso)
      .lt('occurred_at', finalIso)
      .order('occurred_at', {
        ascending: true,
      })
      .limit(10000),

    supabase
      .from('pomodoro_sessions')
      .select(`
        id,
        type,
        project_id,
        duration_minutes,
        completed_at
      `)
      .gte('completed_at', firstIso)
      .lt('completed_at', finalIso),

    supabase
      .from('tasks')
      .select(`
        id,
        category,
        created_at
      `)
      .gte('created_at', firstIso)
      .lt('created_at', finalIso),

    supabase
      .from('tasks')
      .select(`
        id,
        category,
        completed_at
      `)
      .gte('completed_at', firstIso)
      .lt('completed_at', finalIso),

    supabase
      .from('projects')
      .select(`
        id,
        name,
        emoji,
        color,
        created_at,
        completed_at
      `),

    supabase
      .from('goals')
      .select(`
        id,
        created_at,
        completed_at
      `),
  ])

  const results = [
    eventsResult,
    sessionsResult,
    createdTasksResult,
    completedTasksResult,
    projectsResult,
    goalsResult,
  ]

  const failed =
    results.find(
      (result) => result.error,
    )

  if (failed?.error) {
    throw failed.error
  }

  const source: MonthlySourceData = {
    events:
      (eventsResult.data ??
        []) as ActivityEventRow[],
    sessions:
      (sessionsResult.data ??
        []) as SessionRow[],
    createdTasks:
      (createdTasksResult.data ??
        []) as TaskCreatedRow[],
    completedTasks:
      (completedTasksResult.data ??
        []) as TaskCompletedRow[],
    projects:
      (projectsResult.data ??
        []) as ProjectRow[],
    goals:
      (goalsResult.data ??
        []) as GoalRow[],
  }

  const current =
    calculateMetrics(
      source,
      currentStart,
      currentEnd,
    )

  const previous =
    calculateMetrics(
      source,
      previousStart,
      currentStart,
    )

  return {
    period: {
      start:
        localDate(currentStart),
      end:
        localDate(currentEnd),
      month:
        currentStart.getMonth() + 1,
      year:
        currentStart.getFullYear(),
    },

    current,
    previous,

    comparison: {
      focusMinutesPercent:
        percentageChange(
          current.focusMinutes,
          previous.focusMinutes,
        ),
      sessionsPercent:
        percentageChange(
          current.completedSessions,
          previous.completedSessions,
        ),
      tasksCompletedPercent:
        percentageChange(
          current.tasks.completed,
          previous.tasks.completed,
        ),
      activeDaysPercent:
        percentageChange(
          current.activeDays,
          previous.activeDays,
        ),
    },
  }
}
