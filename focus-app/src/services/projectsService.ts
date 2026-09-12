import { supabase } from '@/lib/supabase'

import type {
  Project,
  ProjectStatus,
} from '@/types'

interface ProjectRow {
  id: string
  name: string
  description: string | null
  color: string | null
  emoji: string
  goal_id: string | null
  total_sessions: number
  completed_sessions: number
  total_focus_minutes: number
  status: ProjectStatus
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateProjectInput {
  name: string
  description: string
  color: string
  emoji: string
  goalId?: string
}

export interface UpdateProjectInput {
  name?: string
  description?: string
  color?: string
  emoji?: string
  goalId?: string | null
  totalSessions?: number
  completedSessions?: number
  totalFocusMinutes?: number
  status?: ProjectStatus
  completedAt?: string
}

const PROJECT_SELECT = `
  id,
  name,
  description,
  color,
  emoji,
  goal_id,
  total_sessions,
  completed_sessions,
  total_focus_minutes,
  status,
  completed_at,
  created_at,
  updated_at
`

function mapProjectRow(
  row: ProjectRow,
): Project {
  return {
    id: row.id,
    name: row.name,
    description:
      row.description ?? '',
    color:
      row.color ?? '#10b981',
    emoji: row.emoji,
    goalId: row.goal_id ?? undefined,
    totalSessions:
      row.total_sessions,
    completedSessions:
      row.completed_sessions,
    totalFocusMinutes:
      row.total_focus_minutes,
    status: row.status,
    completedAt:
      row.completed_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getProjects(): Promise<
  Project[]
> {
  const { data, error } = await supabase
    .from('projects')
    .select(PROJECT_SELECT)
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return (data as ProjectRow[]).map(
    mapProjectRow,
  )
}

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'You must be authenticated to create a project.',
    )
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: input.name.trim(),
      description:
        input.description.trim() ||
        null,
      color: input.color,
      emoji: input.emoji,
      goal_id: input.goalId || null,
      status: 'active',
      completed_at: null,
    })
    .select(PROJECT_SELECT)
    .single()

  if (error) {
    throw error
  }

  return mapProjectRow(
    data as ProjectRow,
  )
}

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const updates: Record<
    string,
    unknown
  > = {}

  if (input.name !== undefined) {
    updates.name = input.name.trim()
  }

  if (
    input.description !== undefined
  ) {
    updates.description =
      input.description.trim() ||
      null
  }

  if (input.color !== undefined) {
    updates.color = input.color
  }

  if (input.emoji !== undefined) {
    updates.emoji = input.emoji
  }

  if (input.goalId !== undefined) {
    updates.goal_id = input.goalId || null
  }

  if (
    input.totalSessions !== undefined
  ) {
    updates.total_sessions =
      input.totalSessions
  }

  if (
    input.completedSessions !==
    undefined
  ) {
    updates.completed_sessions =
      input.completedSessions
  }

  if (
    input.totalFocusMinutes !==
    undefined
  ) {
    updates.total_focus_minutes =
      input.totalFocusMinutes
  }

  if (input.status !== undefined) {
    updates.status = input.status
  }

  if (
    input.completedAt !== undefined
  ) {
    updates.completed_at =
      input.completedAt || null
  }

  updates.updated_at =
    new Date().toISOString()

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select(PROJECT_SELECT)
    .single()

  if (error) {
    throw error
  }

  return mapProjectRow(
    data as ProjectRow,
  )
}

export async function completeProject(
  projectId: string,
): Promise<Project> {
  return updateProject(projectId, {
    status: 'completed',
    completedAt:
      new Date().toISOString(),
  })
}

export async function reopenProject(
  projectId: string,
): Promise<Project> {
  return updateProject(projectId, {
    status: 'active',
    completedAt: '',
  })
}

export async function toggleProjectStatus(
  project: Project,
): Promise<Project> {
  return project.status === 'completed'
    ? reopenProject(project.id)
    : completeProject(project.id)
}

export async function deleteProject(
  projectId: string,
): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    throw error
  }
}

export async function incrementProjectSession(
  project: Project,
  minutes: number,
): Promise<Project> {
  return updateProject(project.id, {
    totalSessions:
      project.totalSessions + 1,
    completedSessions:
      project.completedSessions + 1,
    totalFocusMinutes:
      project.totalFocusMinutes +
      minutes,
  })
}
