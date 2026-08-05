import { useEffect } from 'react'

import {
  usePomodoroSessions,
} from '@/hooks/pomodoro/usePomodoroSessions'
import {
  saveWeeklyActivityWidgetSnapshot,
} from '@/services/weeklyActivityWidgetService'

export function useWeeklyActivityWidgetSync() {
  const sessionsQuery =
    usePomodoroSessions()

  useEffect(() => {
    if (!sessionsQuery.isSuccess) {
      return
    }

    void saveWeeklyActivityWidgetSnapshot(
      sessionsQuery.data,
    )
  }, [
    sessionsQuery.data,
    sessionsQuery.isSuccess,
  ])
}