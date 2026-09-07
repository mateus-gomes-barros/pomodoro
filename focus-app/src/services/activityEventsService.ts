import {
  Capacitor,
} from '@capacitor/core'

import { supabase } from '@/lib/supabase'

export type ActivityEntityType =
  | 'task'
  | 'project'
  | 'goal'
  | 'pomodoro'

export type ActivityEventType =
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_reopened'
  | 'task_deleted'
  | 'task_restored'
  | 'task_permanently_deleted'
  | 'project_created'
  | 'project_updated'
  | 'project_completed'
  | 'project_reopened'
  | 'project_deleted'
  | 'goal_created'
  | 'goal_updated'
  | 'goal_completed'
  | 'goal_reopened'
  | 'goal_deleted'
  | 'pomodoro_started'
  | 'pomodoro_resumed'
  | 'pomodoro_paused'
  | 'pomodoro_abandoned'
  | 'pomodoro_completed'

type ActivityMetadataValue =
  | string
  | number
  | boolean
  | null

export type ActivityMetadata = Record<
  string,
  ActivityMetadataValue
>

export interface TrackActivityEventInput {
  eventType: ActivityEventType
  entityType: ActivityEntityType
  entityId?: string
  metadata?: ActivityMetadata
  occurredAt?: string
}

function padDatePart(
  value: number,
): string {
  return String(value).padStart(2, '0')
}

function getLocalDate(
  date: Date,
): string {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join('-')
}

function getTimezone(): string {
  try {
    return (
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone || 'UTC'
    )
  } catch {
    return 'UTC'
  }
}

function getPlatform():
  | 'web'
  | 'ios'
  | 'android' {
  const platform =
    Capacitor.getPlatform()

  if (
    platform === 'ios' ||
    platform === 'android'
  ) {
    return platform
  }

  return 'web'
}

export async function trackActivityEvent(
  input: TrackActivityEventInput,
): Promise<void> {
  try {
    const {
      data: {
        session,
      },
      error: sessionError,
    } =
      await supabase.auth.getSession()

    if (sessionError) {
      throw sessionError
    }

    if (!session?.user) {
      return
    }

    const occurredAt =
      input.occurredAt
        ? new Date(input.occurredAt)
        : new Date()

    const { error } = await supabase
      .from('activity_events')
      .insert({
        user_id:
          session.user.id,
        event_type:
          input.eventType,
        entity_type:
          input.entityType,
        entity_id:
          input.entityId ?? null,
        occurred_at:
          occurredAt.toISOString(),
        local_date:
          getLocalDate(occurredAt),
        local_hour:
          occurredAt.getHours(),
        local_weekday:
          occurredAt.getDay(),
        timezone:
          getTimezone(),
        utc_offset_minutes:
          -occurredAt.getTimezoneOffset(),
        platform:
          getPlatform(),
        metadata:
          input.metadata ?? {},
      })

    if (error) {
      throw error
    }
  } catch (error) {
    /*
     * O FocusMe nunca deve impedir
     * uma ação principal do usuário.
     */
    console.error(
      'Failed to record FocusMe activity:',
      error,
    )
  }
}
