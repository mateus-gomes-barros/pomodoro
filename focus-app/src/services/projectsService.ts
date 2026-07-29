import { supabase } from '@/lib/supabase'

import type { Project } from '@/types'

interface ProjectRow {
  id: string
  name: string
  description: string | null
  color: string | null
  emoji: string
  total_sessions: number
  completed_sessions: number
  total_focus_minutes: number
  created_at: string
  updated_at: string
}

export interface CreateProjectInput {
  name: string
  description: string
  color: string
  emoji: string
}

function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    color: row.color ?? '#10b981',
    emoji: row.emoji,
    totalSessions: row.total_sessions,
    completedSessions: row.completed_sessions,
    totalFocusMinutes: row.total_focus_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      description,
      color,
      emoji,
      total_sessions,
      completed_sessions,
      total_focus_minutes,
      created_at,
      updated_at
    `)
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return (data as ProjectRow[]).map(mapProjectRow)
}

export async function createProject(
  input: CreateProjectInput,
): Promise<Project> {
  const {
    data: {
      user,
    },
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
        input.description.trim() || null,
      color: input.color,
      emoji: input.emoji,
    })
    .select(`
      id,
      name,
      description,
      color,
      emoji,
      total_sessions,
      completed_sessions,
      total_focus_minutes,
      created_at,
      updated_at
    `)
    .single()

  if (error) {
    throw error
  }

  return mapProjectRow(data as ProjectRow)
}