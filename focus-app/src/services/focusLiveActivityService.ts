import {
    Capacitor,
    registerPlugin,
  } from '@capacitor/core'
  
  import type {
    SessionType,
  } from '@/types'
  
  type LiveActivityStatus =
    | 'running'
    | 'paused'
  
  export interface FocusLiveActivityState {
    sessionId?: string
    sessionType: SessionType
    status: LiveActivityStatus
    endDate: number | null
    remainingSeconds: number
    projectName?: string
    taskName?: string
    badgeIcon?: string
  }
  
  interface StartResult {
    activityId: string
    created: boolean
  }
  
  interface UpdateResult {
    updated: boolean
  }
  
  interface EndResult {
    ended: boolean
  }
  
  interface FocusLiveActivityPlugin {
    start(
      options: FocusLiveActivityState,
    ): Promise<StartResult>
  
    update(
      options: FocusLiveActivityState,
    ): Promise<UpdateResult>
  
    end(
      options: Partial<
        FocusLiveActivityState
      >,
    ): Promise<EndResult>
  }
  
  const nativePlugin =
    registerPlugin<FocusLiveActivityPlugin>(
      'FocusLiveActivity',
    )
  
  function isAvailable(): boolean {
    return (
      Capacitor.isNativePlatform() &&
      Capacitor.getPlatform() === 'ios'
    )
  }
  
  export async function startFocusLiveActivity(
    state: FocusLiveActivityState,
  ): Promise<void> {
    if (!isAvailable()) {
      return
    }
  
    try {
      await nativePlugin.start(state)
    } catch (error) {
      console.error(
        'Failed to start Focus Live Activity:',
        error,
      )
    }
  }
  
  export async function updateFocusLiveActivity(
    state: FocusLiveActivityState,
  ): Promise<void> {
    if (!isAvailable()) {
      return
    }
  
    try {
      await nativePlugin.update(state)
    } catch (error) {
      console.error(
        'Failed to update Focus Live Activity:',
        error,
      )
    }
  }
  
  export async function endFocusLiveActivity(): Promise<void> {
    if (!isAvailable()) {
      return
    }
  
    try {
      await nativePlugin.end({})
    } catch (error) {
      console.error(
        'Failed to end Focus Live Activity:',
        error,
      )
    }
  }