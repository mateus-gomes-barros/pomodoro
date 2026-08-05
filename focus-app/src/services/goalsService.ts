import { supabase } from '@/lib/supabase'

import type { Goal } from '@/types'

interface GoalRow {
  id: string
  title: string
  year: number
  completed: boolean
  completed_at: string | null
  goal_order: number
  created_at: string
  updated_at: string
}

export interface CreateGoalInput {
  title: string
  year?: number
}

export interface UpdateGoalInput {
  title?: string
  year?: number
  completed?: boolean
  completedAt?: string | null
  order?: number
}

const GOAL_SELECT = `
  id,
  title,
  year,
  completed,
  completed_at,
  goal_order,
  created_at,
  updated_at
`

function mapGoalRow(
  row: GoalRow,
): Goal {
  return {
    id: row.id,
    title: row.title,
    year: row.year,
    completed: row.completed,
    completedAt:
      row.completed_at ?? undefined,
    order: row.goal_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getGoals(
  year = new Date().getFullYear(),
): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select(GOAL_SELECT)
    .eq('year', year)
    .order('goal_order', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return (data as GoalRow[]).map(
    mapGoalRow,
  )
}

export async function createGoal(
  input: CreateGoalInput,
): Promise<Goal> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'You must be authenticated to create a goal.',
    )
  }

  const year =
    input.year ??
    new Date().getFullYear()

  const { count, error: countError } =
    await supabase
      .from('goals')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('year', year)

  if (countError) {
    throw countError
  }

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      title: input.title.trim(),
      year,
      completed: false,
      goal_order: count ?? 0,
    })
    .select(GOAL_SELECT)
    .single()

  if (error) {
    throw error
  }

  return mapGoalRow(
    data as GoalRow,
  )
}

export async function updateGoal(
  goalId: string,
  input: UpdateGoalInput,
): Promise<Goal> {
  const updates: Record<
    string,
    unknown
  > = {
    updated_at:
      new Date().toISOString(),
  }

  if (input.title !== undefined) {
    updates.title = input.title.trim()
  }

  if (input.year !== undefined) {
    updates.year = input.year
  }

  if (input.completed !== undefined) {
    updates.completed =
      input.completed
  }

  if (input.completedAt !== undefined) {
    updates.completed_at =
      input.completedAt
  }

  if (input.order !== undefined) {
    updates.goal_order = input.order
  }

  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select(GOAL_SELECT)
    .single()

  if (error) {
    throw error
  }

  return mapGoalRow(
    data as GoalRow,
  )
}

export async function deleteGoal(
  goalId: string,
): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)

  if (error) {
    throw error
  }
}

export async function toggleGoal(
  goal: Goal,
): Promise<Goal> {
  const nextCompleted =
    !goal.completed

  return updateGoal(goal.id, {
    completed: nextCompleted,
    completedAt: nextCompleted
      ? new Date().toISOString()
      : null,
  })
}

export async function reorderGoals(
  goals: Goal[],
): Promise<void> {
  const results = await Promise.all(
    goals.map((goal, index) =>
      supabase
        .from('goals')
        .update({
          goal_order: index,
          updated_at:
            new Date().toISOString(),
        })
        .eq('id', goal.id),
    ),
  )

  const failedResult =
    results.find(
      ({ error }) => error,
    )

  if (failedResult?.error) {
    throw failedResult.error
  }
}