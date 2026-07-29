import { supabase } from '@/lib/supabase'

import type {
  Task,
  TaskPriority,
} from '@/types'

interface TaskRow {
  id: string
  title: string
  completed: boolean
  project_id: string | null
  priority: TaskPriority
  estimated_pomodoros: number
  completed_pomodoros: number
  created_at: string
  completed_at: string | null
  task_order: number
}

export interface CreateTaskInput {
  title: string
  projectId?: string
  priority: TaskPriority
  estimatedPomodoros: number
}

export interface UpdateTaskInput {
  title?: string
  completed?: boolean
  projectId?: string
  priority?: TaskPriority
  estimatedPomodoros?: number
  completedPomodoros?: number
  completedAt?: string
  order?: number
}

const TASK_SELECT = `
  id,
  title,
  completed,
  project_id,
  priority,
  estimated_pomodoros,
  completed_pomodoros,
  created_at,
  completed_at,
  task_order
`

function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    projectId: row.project_id ?? undefined,
    priority: row.priority,
    estimatedPomodoros: row.estimated_pomodoros,
    completedPomodoros: row.completed_pomodoros,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
    order: row.task_order,
  }
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(TASK_SELECT)
    .order('task_order', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return (data as TaskRow[]).map(mapTaskRow)
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

  if (countError) {
    throw countError
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      project_id: input.projectId || null,
      priority: input.priority,
      estimated_pomodoros:
        input.estimatedPomodoros,
      task_order: count ?? 0,
    })
    .select(TASK_SELECT)
    .single()

  if (error) {
    throw error
  }

  return mapTaskRow(data as TaskRow)
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
): Promise<Task> {
  const updates: Record<string, unknown> = {}

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

  if (
    input.estimatedPomodoros !== undefined
  ) {
    updates.estimated_pomodoros =
      input.estimatedPomodoros
  }

  if (
    input.completedPomodoros !== undefined
  ) {
    updates.completed_pomodoros =
      input.completedPomodoros
  }

  if (input.completedAt !== undefined) {
    updates.completed_at =
      input.completedAt || null
  }

  if (input.order !== undefined) {
    updates.task_order = input.order
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select(TASK_SELECT)
    .single()

  if (error) {
    throw error
  }

  return mapTaskRow(data as TaskRow)
}

export async function deleteTask(
  taskId: string,
): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    throw error
  }
}

export async function toggleTask(
  task: Task,
): Promise<Task> {
  const nextCompleted = !task.completed

  return updateTask(task.id, {
    completed: nextCompleted,
    completedAt: nextCompleted
      ? new Date().toISOString()
      : '',
  })
}

export async function incrementTaskPomodoro(
  task: Task,
): Promise<Task> {
  return updateTask(task.id, {
    completedPomodoros:
      task.completedPomodoros + 1,
  })
}

export async function reorderTasks(
  tasks: Task[],
): Promise<void> {
  const updates = tasks.map(
    (task, index) => ({
      id: task.id,
      task_order: index,
    }),
  )

  const results = await Promise.all(
    updates.map(({ id, task_order }) =>
      supabase
        .from('tasks')
        .update({
          task_order,
        })
        .eq('id', id),
    ),
  )

  const failedResult = results.find(
    ({ error }) => error,
  )

  if (failedResult?.error) {
    throw failedResult.error
  }
}