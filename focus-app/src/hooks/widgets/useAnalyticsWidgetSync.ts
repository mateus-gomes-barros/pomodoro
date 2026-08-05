import { useEffect } from 'react'

import {
  usePomodoroSessions,
} from '@/hooks/pomodoro/usePomodoroSessions'
import {
  useProjects,
} from '@/hooks/projects/useProjects'
import {
  saveAnalyticsWidgetSnapshot,
} from '@/services/analyticsWidgetService'

export function useAnalyticsWidgetSync() {
  const sessionsQuery =
    usePomodoroSessions()

  const projectsQuery =
    useProjects()

  useEffect(() => {
    if (
      !sessionsQuery.isSuccess ||
      !projectsQuery.isSuccess
    ) {
      return
    }

    void saveAnalyticsWidgetSnapshot(
      sessionsQuery.data,
      projectsQuery.data,
    )
  }, [
    projectsQuery.data,
    projectsQuery.isSuccess,
    sessionsQuery.data,
    sessionsQuery.isSuccess,
  ])
}