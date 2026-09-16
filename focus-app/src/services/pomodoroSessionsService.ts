import { supabase } from '@/lib/supabase'
import { formatLocalDate } from '@/utils'

import type {
  PomodoroSession,
  SessionType,
} from '@/types'

interface PomodoroSessionRow {
  id: string
  type: SessionType
  project_id: string | null
  task_id: string | null
  duration_minutes: number
  completed_at: string
  session_date: string
}

export interface CreatePomodoroSessionInput {
  id: string
  type: SessionType
  projectId?: string
  taskId?: string
  durationMinutes: number
  completedAt?: string
  date?: string
}

const POMODORO_SESSION_SELECT = `
  id,
  type,
  project_id,
  task_id,
  duration_minutes,
  completed_at,
  session_date
`

function mapPomodoroSessionRow(
  row: PomodoroSessionRow,
): PomodoroSession {
  return {
    id: row.id,
    type: row.type,
    projectId: row.project_id ?? undefined,
    taskId: row.task_id ?? undefined,
    durationMinutes: row.duration_minutes,
    completedAt: row.completed_at,
    date: row.session_date,
  }
}

export async function getPomodoroSessions(): Promise<
  PomodoroSession[]
> {
  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select(POMODORO_SESSION_SELECT)
    .order('completed_at', {
      ascending: false,
    })

  if (error) {
    throw error
  }

  return (data as PomodoroSessionRow[]).map(
    mapPomodoroSessionRow,
  )
}

export interface CreatePomodoroSessionResult {
  session: PomodoroSession
  created: boolean
}

export async function createPomodoroSession(
  input: CreatePomodoroSessionInput,
): Promise<CreatePomodoroSessionResult> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (!user) {
    throw new Error(
      'You must be authenticated to create a pomodoro session.',
    )
  }

  const completedAt =
    input.completedAt ?? new Date().toISOString()

  const date =
    input.date ??
    formatLocalDate(
      new Date(completedAt),
    )

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert({
      id: input.id,
      user_id: user.id,
      type: input.type,
      project_id: input.projectId || null,
      task_id: input.taskId || null,
      duration_minutes:
        input.durationMinutes,
      completed_at: completedAt,
      session_date: date,
    })
    .select(POMODORO_SESSION_SELECT)
    .single()

  if (error) {
    if (error.code === '23505') {
      const {
        data: existingData,
        error: existingError,
      } = await supabase
        .from('pomodoro_sessions')
        .select(POMODORO_SESSION_SELECT)
        .eq('id', input.id)
        .single()

      if (existingError) {
        throw existingError
      }

      return {
        session: mapPomodoroSessionRow(
          existingData as PomodoroSessionRow,
        ),
        created: false,
      }
    }

    throw error
  }

  return {
    session: mapPomodoroSessionRow(
      data as PomodoroSessionRow,
    ),
    created: true,
  }
}

export async function deletePomodoroSession(
  sessionId: string,
): Promise<void> {
  const { error } = await supabase
    .from('pomodoro_sessions')
    .delete()
    .eq('id', sessionId)

  if (error) {
    throw error
  }
}