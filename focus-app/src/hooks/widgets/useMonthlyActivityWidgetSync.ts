import { useEffect } from 'react'

import {
  usePomodoroSessions,
} from '@/hooks/pomodoro/usePomodoroSessions'
import {
  saveMonthlyActivityWidgetSnapshot,
} from '@/services/monthlyActivityWidgetService'

export function useMonthlyActivityWidgetSync() {
  const sessionsQuery =
    usePomodoroSessions()

  useEffect(() => {
    if (!sessionsQuery.isSuccess) {
      return
    }

    void saveMonthlyActivityWidgetSnapshot(
      sessionsQuery.data,
    )
  }, [
    sessionsQuery.data,
    sessionsQuery.isSuccess,
  ])
}