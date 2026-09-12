import { supabase } from '@/lib/supabase'

import {
  trackActivityEvent,
  type ActivityEventType,
} from '@/services/activityEventsService'

import type {
  Task,
  TaskCategory,
  TaskPriority,
} from '@/types'

interface TaskRow {
  id: string
  title: string
  completed: boolean
  project_id: string | null
  priority: TaskPriority
  category: TaskCategory
  estimated_pomodoros: number
  completed_pomodoros: number
  created_at: string
  completed_at: string | null
  deleted_at: string | null
  scheduled_deletion_at: string | null
  planned_date: string | null
  due_at: string | null
  daily_order: number | null
  daily_priority: 1 | 2 | 3 | null
  task_order: number
}

export interface CreateTaskInput {
  title: string
  projectId?: string
  priority: TaskPriority
  category?: TaskCategory
  estimatedPomodoros: number
  plannedDate?: string | null
  dueAt?: string | null
  dailyOrder?: number | null
  dailyPriority?: 1 | 2 | 3 | null
}

export interface UpdateTaskInput {
  title?: string
  completed?: boolean
  projectId?: string
  priority?: TaskPriority
  category?: TaskCategory
  estimatedPomodoros?: number
  completedPomodoros?: number
  completedAt?: string
  plannedDate?: string | null
  dueAt?: string | null
  dailyOrder?: number | null
  dailyPriority?: 1 | 2 | 3 | null
  order?: number
}

const TASK_SELECT = `
  id,
  title,
  completed,
  project_id,
  priority,
  category,
  estimated_pomodoros,
  completed_pomodoros,
  created_at,
  completed_at,
  deleted_at,
  scheduled_deletion_at,
  planned_date,
  due_at,
  daily_order,
  daily_priority,
  task_order
`

function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    projectId:
      row.project_id ?? undefined,
    priority: row.priority,
    category: row.category,
    estimatedPomodoros:
      row.estimated_pomodoros,
    completedPomodoros:
      row.completed_pomodoros,
    createdAt: row.created_at,
    completedAt:
      row.completed_at ?? undefined,
    deletedAt:
      row.deleted_at ?? undefined,
    scheduledDeletionAt:
      row.scheduled_deletion_at ??
      undefined,
    plannedDate:
      row.planned_date ?? undefined,
    dueAt:
      row.due_at ?? undefined,
    dailyOrder:
      row.daily_order ?? undefined,
    dailyPriority:
      row.daily_priority ?? undefined,
    order: row.task_order,
  }
}

export async function purgeExpiredTasks(): Promise<void> {
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .not('deleted_at', 'is', null)
    .lte('scheduled_deletion_at', now)

  if (error) {
    throw error
  }
}

export async function getTasks(): Promise<Task[]> {
  await purgeExpiredTasks()

  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_SELECT)
    .is('deleted_at', null)
    .order('task_order', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return (data as TaskRow[]).map(
    mapTaskRow,
  )
}

export async function getTrashTasks(): Promise<
  Task[]
> {
  await purgeExpiredTasks()

  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_SELECT)
    .not('deleted_at', 'is', null)
    .order('deleted_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return (data as TaskRow[]).map(
    mapTaskRow,
  )
}

export async function createTask(
  input: CreateTaskInput,
): Promise<Task> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'You must be authenticated to create a task.',
    )
  }

  const { count, error: countError } =
    await supabase
      .from('tasks')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .is('deleted_at', null)

  if (countError) {
    throw countError
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      project_id:
        input.projectId || null,
      priority: input.priority,
      category:
        input.category ?? 'planned',
      estimated_pomodoros:
        input.estimatedPomodoros,
      planned_date:
        input.plannedDate ?? null,
      due_at:
        input.dueAt ?? null,
      daily_order:
        input.dailyOrder ?? null,
      daily_priority:
        input.dailyPriority ?? null,
      task_order: count ?? 0,
    })
    .select(TASK_SELECT)
    .single()

  if (error) {
    throw error
  }

  const task =
    mapTaskRow(data as TaskRow)

  void trackActivityEvent({
    eventType: 'task_created',
    entityType: 'task',
    entityId: task.id,
    metadata: {
      category: task.category,
      priority: task.priority,
      estimated_pomodoros:
        task.estimatedPomodoros,
      has_project:
        Boolean(task.projectId),
    },
  })

  return task
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
  eventType:
    ActivityEventType | null =
      'task_updated',
): Promise<Task> {
  const updates: Record<
    string,
    unknown
  > = {}

  if (input.title !== undefined) {
    updates.title = input.title.trim()
  }

  if (input.completed !== undefined) {
    updates.completed = input.completed
  }

  if (input.projectId !== undefined) {
    updates.project_id =
      input.projectId || null
  }

  if (input.priority !== undefined) {
    updates.priority = input.priority
  }

  if (input.category !== undefined) {
    updates.category = input.category
  }

  if (
    input.estimatedPomodoros !==
    undefined
  ) {
    updates.estimated_pomodoros =
      input.estimatedPomodoros
  }

  if (
    input.completedPomodoros !==
    undefined
  ) {
    updates.completed_pomodoros =
      input.completedPomodoros
  }

  if (input.completedAt !== undefined) {
    updates.completed_at =
      input.completedAt || null
  }

  if (input.plannedDate !== undefined) {
    updates.planned_date =
      input.plannedDate
  }

  if (input.dueAt !== undefined) {
    updates.due_at = input.dueAt
  }

  if (input.dailyOrder !== undefined) {
    updates.daily_order =
      input.dailyOrder
  }

  if (input.dailyPriority !== undefined) {
    updates.daily_priority =
      input.dailyPriority
  }

  if (input.order !== undefined) {
    updates.task_order = input.order
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .is('deleted_at', null)
    .select(TASK_SELECT)
    .single()

  if (error) {
    throw error
  }

  const task =
    mapTaskRow(data as TaskRow)

  if (eventType) {
    void trackActivityEvent({
      eventType,
      entityType: 'task',
      entityId: task.id,
      metadata: {
        category: task.category,
        priority: task.priority,
        estimated_pomodoros:
          task.estimatedPomodoros,
        completed_pomodoros:
          task.completedPomodoros,
        completed: task.completed,
        has_project:
          Boolean(task.projectId),
        changed_title:
          input.title !== undefined,
        changed_category:
          input.category !== undefined,
        changed_priority:
          input.priority !== undefined,
        changed_project:
          input.projectId !== undefined,
        changed_estimate:
          input.estimatedPomodoros !==
          undefined,
      },
    })
  }

  return task
}

export async function deleteTask(
  taskId: string,
): Promise<Task> {
  const deletedAt = new Date()
  const scheduledDeletionAt =
    new Date(deletedAt)

  scheduledDeletionAt.setUTCDate(
    scheduledDeletionAt.getUTCDate() + 30,
  )

  const { data, error } = await supabase
    .from('tasks')
    .update({
      deleted_at:
        deletedAt.toISOString(),
      scheduled_deletion_at:
        scheduledDeletionAt.toISOString(),
    })
    .eq('id', taskId)
    .is('deleted_at', null)
    .select(TASK_SELECT)
    .single()

  if (error) {
    throw error
  }

  const task =
    mapTaskRow(data as TaskRow)

  void trackActivityEvent({
    eventType: 'task_deleted',
    entityType: 'task',
    entityId: task.id,
    metadata: {
      category: task.category,
      priority: task.priority,
      completed: task.completed,
      has_project:
        Boolean(task.projectId),
    },
  })

  return task
}

export async function restoreTask(
  taskId: string,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      deleted_at: null,
      scheduled_deletion_at: null,
    })
    .eq('id', taskId)
    .not('deleted_at', 'is', null)
    .select(TASK_SELECT)
    .single()

  if (error) {
    throw error
  }

  const task =
    mapTaskRow(data as TaskRow)

  void trackActivityEvent({
    eventType: 'task_restored',
    entityType: 'task',
    entityId: task.id,
    metadata: {
      category: task.category,
      priority: task.priority,
      completed: task.completed,
      has_project:
        Boolean(task.projectId),
    },
  })

  return task
}

export async function deleteTaskPermanently(
  taskId: string,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .not('deleted_at', 'is', null)

  if (error) {
    throw error
  }

  void trackActivityEvent({
    eventType:
      'task_permanently_deleted',
    entityType: 'task',
    entityId: taskId,
  })
}

export async function toggleTask(
  task: Task,
): Promise<Task> {
  const nextCompleted = !task.completed

  return updateTask(
    task.id,
    {
      completed: nextCompleted,
      completedAt: nextCompleted
        ? new Date().toISOString()
        : '',
    },
    nextCompleted
      ? 'task_completed'
      : 'task_reopened',
  )
}

export async function incrementTaskPomodoro(
  task: Task,
): Promise<Task> {
  return updateTask(
    task.id,
    {
      completedPomodoros:
        task.completedPomodoros + 1,
    },
    null,
  )
}

export async function reorderTasks(
  tasks: Task[],
): Promise<void> {
  const activeTasks = tasks.filter(
    (task) => !task.deletedAt,
  )

  const results = await Promise.all(
    activeTasks.map((task, index) =>
      supabase
        .from('tasks')
        .update({
          task_order: index,
        })
        .eq('id', task.id)
        .is('deleted_at', null),
    ),
  )

  const failedResult = results.find(
    ({ error }) => error,
  )

  if (failedResult?.error) {
    throw failedResult.error
  }
}


export async function reorderDailyPlan(
  tasks: Task[],
): Promise<void> {
  const results = await Promise.all(
    tasks.map((task, index) =>
      supabase
        .from('tasks')
        .update({
          daily_order: index,
        })
        .eq('id', task.id)
        .is('deleted_at', null),
    ),
  )

  const failedResult = results.find(
    ({ error }) => error,
  )

  if (failedResult?.error) {
    throw failedResult.error
  }
}

export async function setDailyTaskPriority(
  task: Task,
  priority: 1 | 2 | 3 | null,
): Promise<void> {
  if (!task.plannedDate) {
    return
  }

  if (priority !== null) {
    const { error: clearError } =
      await supabase
        .from('tasks')
        .update({
          daily_priority: null,
        })
        .eq(
          'planned_date',
          task.plannedDate,
        )
        .eq(
          'daily_priority',
          priority,
        )
        .neq('id', task.id)
        .is('deleted_at', null)

    if (clearError) {
      throw clearError
    }
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      daily_priority: priority,
    })
    .eq('id', task.id)
    .is('deleted_at', null)

  if (error) {
    throw error
  }
}
