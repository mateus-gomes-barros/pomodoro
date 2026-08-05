import {
    Capacitor,
    registerPlugin,
  } from '@capacitor/core'
  
  import {
    updateGoal,
  } from '@/services/goalsService'
  
  import type { Goal } from '@/types'
  
  interface GoalsWidgetPlugin {
    saveSnapshot(
      options: {
        payload: string
      },
    ): Promise<{
      saved: boolean
    }>
  
    getPendingCompletions(): Promise<{
      goalIDs: string[]
    }>
  
    removePendingCompletions(
      options: {
        goalIDs: string[]
      },
    ): Promise<{
      removed: boolean
    }>
  }
  
  interface GoalsWidgetItem {
    id: string
    title: string
    completed: boolean
  }
  
  interface GoalsWidgetSnapshot {
    year: number
    completedCount: number
    totalCount: number
    goals: GoalsWidgetItem[]
    updatedAt: string
  }
  
  const goalsWidgetPlugin =
    registerPlugin<GoalsWidgetPlugin>(
      'GoalsWidget',
    )
  
  let pendingSyncPromise:
    Promise<number> | null = null
  
  function isAvailable(): boolean {
    return (
      Capacitor.isNativePlatform() &&
      Capacitor.getPlatform() === 'ios'
    )
  }
  
  export async function saveGoalsWidgetSnapshot(
    goals: Goal[],
    year: number,
  ): Promise<void> {
    if (!isAvailable()) {
      return
    }
  
    const sortedGoals = [...goals].sort(
      (firstGoal, secondGoal) => {
        if (
          firstGoal.completed ===
          secondGoal.completed
        ) {
          return (
            firstGoal.order -
            secondGoal.order
          )
        }
  
        return firstGoal.completed
          ? 1
          : -1
      },
    )
  
    const snapshot: GoalsWidgetSnapshot = {
      year,
      completedCount:
        goals.filter(
          (goal) => goal.completed,
        ).length,
      totalCount: goals.length,
      goals: sortedGoals
        .slice(0, 3)
        .map((goal) => ({
          id: goal.id,
          title: goal.title,
          completed: goal.completed,
        })),
      updatedAt:
        new Date().toISOString(),
    }
  
    try {
      await goalsWidgetPlugin.saveSnapshot({
        payload: JSON.stringify(
          snapshot,
        ),
      })
    } catch (error) {
      console.error(
        'Failed to update Goals widget:',
        error,
      )
    }
  }
  
  async function performPendingSync():
    Promise<number> {
    if (!isAvailable()) {
      return 0
    }
  
    try {
      const {
        goalIDs,
      } =
        await goalsWidgetPlugin
          .getPendingCompletions()
  
      const uniqueGoalIDs = [
        ...new Set(goalIDs),
      ]
  
      if (uniqueGoalIDs.length === 0) {
        return 0
      }
  
      const synchronizedGoalIDs:
        string[] = []
  
      for (
        const goalID of uniqueGoalIDs
      ) {
        try {
          await updateGoal(goalID, {
            completed: true,
            completedAt:
              new Date().toISOString(),
          })
  
          synchronizedGoalIDs.push(
            goalID,
          )
        } catch (error) {
          console.error(
            `Failed to complete goal ${goalID}:`,
            error,
          )
        }
      }
  
      if (
        synchronizedGoalIDs.length > 0
      ) {
        await goalsWidgetPlugin
          .removePendingCompletions({
            goalIDs:
              synchronizedGoalIDs,
          })
      }
  
      return synchronizedGoalIDs.length
    } catch (error) {
      console.error(
        'Failed to synchronize Goals widget completions:',
        error,
      )
  
      return 0
    }
  }
  
  export function syncPendingGoalCompletions():
    Promise<number> {
    if (pendingSyncPromise) {
      return pendingSyncPromise
    }
  
    pendingSyncPromise =
      performPendingSync().finally(() => {
        pendingSyncPromise = null
      })
  
    return pendingSyncPromise
  }