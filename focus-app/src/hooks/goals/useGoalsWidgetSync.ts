import {
    App as CapacitorApp,
  } from '@capacitor/app'
  import {
    Capacitor,
    type PluginListenerHandle,
  } from '@capacitor/core'
  import {
    useQueryClient,
  } from '@tanstack/react-query'
  import {
    useCallback,
    useEffect,
  } from 'react'
  
  import {
    goalsQueryKey,
  } from '@/hooks/goals/useGoals'
  import {
    saveGoalsWidgetSnapshot,
    syncPendingGoalCompletions,
  } from '@/services/goalsWidgetService'
  
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
    const queryClient =
      useQueryClient()
  
    const synchronize =
      useCallback(async () => {
        if (!enabled) {
          return
        }
  
        const synchronizedCount =
          await syncPendingGoalCompletions()
  
        if (synchronizedCount > 0) {
          await queryClient
            .invalidateQueries({
              queryKey:
                goalsQueryKey(year),
            })
  
          return
        }
  
        await saveGoalsWidgetSnapshot(
          goals,
          year,
        )
      }, [
        enabled,
        goals,
        queryClient,
        year,
      ])
  
    useEffect(() => {
      void synchronize()
    }, [synchronize])
  
    useEffect(() => {
      const isIOS =
        Capacitor.isNativePlatform() &&
        Capacitor.getPlatform() ===
          'ios'
  
      if (!isIOS) {
        return
      }
  
      let disposed = false
  
      let listener:
        PluginListenerHandle | null =
          null
  
      void CapacitorApp.addListener(
        'appStateChange',
        ({ isActive }) => {
          if (isActive) {
            void synchronize()
          }
        },
      ).then((handle) => {
        if (disposed) {
          void handle.remove()
  
          return
        }
  
        listener = handle
      })
  
      return () => {
        disposed = true
  
        if (listener) {
          void listener.remove()
        }
      }
    }, [synchronize])
  }