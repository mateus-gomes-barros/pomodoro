import { supabase } from '@/lib/supabase'

import type {
  FocusRoutine,
  FocusRoutineTemplate,
} from '@/types'

interface FocusRoutineRow {
  id: string
  name: string
  template_key: FocusRoutineTemplate | null
  icon: string
  color: string
  work_duration: number
  short_break_duration: number
  long_break_duration: number
  sessions_until_long_break: number
  default_project_id: string | null
  sound_enabled: boolean
  auto_start_breaks: boolean
  auto_start_work: boolean
  do_not_disturb: boolean
  is_default: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CreateFocusRoutineInput {
  name: string
  icon?: string
  color?: string
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  defaultProjectId?: string
  soundEnabled: boolean
  autoStartBreaks: boolean
  autoStartWork: boolean
  doNotDisturb: boolean
}

export type UpdateFocusRoutineInput =
  Partial<CreateFocusRoutineInput>

const ROUTINE_SELECT = `
  id,
  name,
  template_key,
  icon,
  color,
  work_duration,
  short_break_duration,
  long_break_duration,
  sessions_until_long_break,
  default_project_id,
  sound_enabled,
  auto_start_breaks,
  auto_start_work,
  do_not_disturb,
  is_default,
  sort_order,
  created_at,
  updated_at
`

const BUILT_IN_ROUTINES = [
  {
    name: 'Work',
    template_key: 'work',
    icon: 'briefcase',
    color: '#34d399',
    work_duration: 25,
    short_break_duration: 5,
    long_break_duration: 15,
    sessions_until_long_break: 4,
    sort_order: 0,
  },
  {
    name: 'Study',
    template_key: 'study',
    icon: 'graduation-cap',
    color: '#60a5fa',
    work_duration: 50,
    short_break_duration: 10,
    long_break_duration: 20,
    sessions_until_long_break: 3,
    sort_order: 1,
  },
  {
    name: 'Reading',
    template_key: 'reading',
    icon: 'book-open',
    color: '#c084fc',
    work_duration: 30,
    short_break_duration: 5,
    long_break_duration: 15,
    sessions_until_long_break: 2,
    sort_order: 2,
  },
] as const

function mapFocusRoutine(
  row: FocusRoutineRow,
): FocusRoutine {
  return {
    id: row.id,
    name: row.name,
    templateKey:
      row.template_key ?? undefined,
    icon: row.icon,
    color: row.color,
    workDuration:
      row.work_duration,
    shortBreakDuration:
      row.short_break_duration,
    longBreakDuration:
      row.long_break_duration,
    sessionsUntilLongBreak:
      row.sessions_until_long_break,
    defaultProjectId:
      row.default_project_id ??
      undefined,
    soundEnabled:
      row.sound_enabled,
    autoStartBreaks:
      row.auto_start_breaks,
    autoStartWork:
      row.auto_start_work,
    doNotDisturb:
      row.do_not_disturb,
    isDefault: row.is_default,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getAuthenticatedUserId():
  Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error(
      'You must be authenticated to use focus routines.',
    )
  }

  return user.id
}

async function fetchFocusRoutines():
  Promise<FocusRoutineRow[]> {
  const { data, error } = await supabase
    .from('focus_routines')
    .select(ROUTINE_SELECT)
    .order('sort_order', {
      ascending: true,
    })
    .order('created_at', {
      ascending: true,
    })

  if (error) {
    throw error
  }

  return data as FocusRoutineRow[]
}

export async function getFocusRoutines():
  Promise<FocusRoutine[]> {
  const userId =
    await getAuthenticatedUserId()
  const existing =
    await fetchFocusRoutines()
  const existingTemplates = new Set(
    existing
      .map((routine) =>
        routine.template_key,
      )
      .filter(Boolean),
  )
  const missing =
    BUILT_IN_ROUTINES.filter(
      (routine) =>
        !existingTemplates.has(
          routine.template_key,
        ),
    )

  if (missing.length > 0) {
    const hasDefault = existing.some(
      (routine) =>
        routine.is_default,
    )

    const { error } = await supabase
      .from('focus_routines')
      .upsert(
        missing.map(
          (routine, index) => ({
            user_id: userId,
            ...routine,
            is_default:
              !hasDefault &&
              routine.template_key ===
                'work' &&
              index === 0,
          }),
        ),
        {
          onConflict:
            'user_id,template_key',
          ignoreDuplicates: true,
        },
      )

    if (error) {
      throw error
    }
  }

  const routines =
    missing.length > 0
      ? await fetchFocusRoutines()
      : existing

  return routines.map(mapFocusRoutine)
}

export async function createFocusRoutine(
  input: CreateFocusRoutineInput,
): Promise<FocusRoutine> {
  const userId =
    await getAuthenticatedUserId()
  const { count, error: countError } =
    await supabase
      .from('focus_routines')
      .select('id', {
        count: 'exact',
        head: true,
      })

  if (countError) {
    throw countError
  }

  const { data, error } = await supabase
    .from('focus_routines')
    .insert({
      user_id: userId,
      name: input.name.trim(),
      template_key: null,
      icon: input.icon ?? 'timer',
      color: input.color ?? '#34d399',
      work_duration:
        input.workDuration,
      short_break_duration:
        input.shortBreakDuration,
      long_break_duration:
        input.longBreakDuration,
      sessions_until_long_break:
        input.sessionsUntilLongBreak,
      default_project_id:
        input.defaultProjectId ?? null,
      sound_enabled:
        input.soundEnabled,
      auto_start_breaks:
        input.autoStartBreaks,
      auto_start_work:
        input.autoStartWork,
      do_not_disturb:
        input.doNotDisturb,
      is_default: false,
      sort_order: count ?? 0,
    })
    .select(ROUTINE_SELECT)
    .single()

  if (error) {
    throw error
  }

  return mapFocusRoutine(
    data as FocusRoutineRow,
  )
}

export async function updateFocusRoutine(
  routineId: string,
  input: UpdateFocusRoutineInput,
): Promise<FocusRoutine> {
  const updates: Record<
    string,
    unknown
  > = {
    updated_at:
      new Date().toISOString(),
  }

  if (input.name !== undefined) {
    updates.name = input.name.trim()
  }

  if (input.icon !== undefined) {
    updates.icon = input.icon
  }

  if (input.color !== undefined) {
    updates.color = input.color
  }

  if (
    input.workDuration !== undefined
  ) {
    updates.work_duration =
      input.workDuration
  }

  if (
    input.shortBreakDuration !==
    undefined
  ) {
    updates.short_break_duration =
      input.shortBreakDuration
  }

  if (
    input.longBreakDuration !==
    undefined
  ) {
    updates.long_break_duration =
      input.longBreakDuration
  }

  if (
    input.sessionsUntilLongBreak !==
    undefined
  ) {
    updates.sessions_until_long_break =
      input.sessionsUntilLongBreak
  }

  if (
    input.defaultProjectId !==
    undefined
  ) {
    updates.default_project_id =
      input.defaultProjectId || null
  }

  if (
    input.soundEnabled !== undefined
  ) {
    updates.sound_enabled =
      input.soundEnabled
  }

  if (
    input.autoStartBreaks !==
    undefined
  ) {
    updates.auto_start_breaks =
      input.autoStartBreaks
  }

  if (
    input.autoStartWork !== undefined
  ) {
    updates.auto_start_work =
      input.autoStartWork
  }

  if (
    input.doNotDisturb !== undefined
  ) {
    updates.do_not_disturb =
      input.doNotDisturb
  }

  const { data, error } = await supabase
    .from('focus_routines')
    .update(updates)
    .eq('id', routineId)
    .select(ROUTINE_SELECT)
    .single()

  if (error) {
    throw error
  }

  return mapFocusRoutine(
    data as FocusRoutineRow,
  )
}

export async function deleteFocusRoutine(
  routineId: string,
): Promise<void> {
  const { error } = await supabase
    .from('focus_routines')
    .delete()
    .eq('id', routineId)
    .is('template_key', null)

  if (error) {
    throw error
  }
}
