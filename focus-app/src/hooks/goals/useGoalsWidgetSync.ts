import { useEffect } from 'react'

import { saveGoalsWidgetSnapshot } from '@/services/goalsWidgetService'

import type { Goal } from '@/types'

interface UseGoalsWidgetSyncOptions {
  goals: Goal[]
  year: number
  enabled: boolean
}

export function useGoalsWidgetSync({
  goals,
  year,
  enabled,
}: UseGoalsWidgetSyncOptions) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    void saveGoalsWidgetSnapshot(
      goals,
      year,
    )
  }, [
    goals,
    year,
    enabled,
  ])
}