import { useEffect, useRef } from 'react'

import { useCreatePomodoroSession } from '@/hooks/pomodoro/usePomodoroSessions'
import {
  useIncrementProjectSession,
  useProjects,
} from '@/hooks/projects/useProjects'
import {
  useIncrementTaskPomodoro,
  useTasks,
} from '@/hooks/tasks/useTasks'
import {
  endFocusLiveActivity,
  startFocusLiveActivity,
} from '@/services/focusLiveActivityService'
import { usePomodoroStore } from '@/store/pomodoroStore'

import type {
  SessionType,
  TimerSettings,
} from '@/types'

function getSessionDuration(
  type: SessionType,
  settings: TimerSettings,
): number {
  switch (type) {
    case 'work':
      return settings.workDuration

    case 'short_break':
      return settings.shortBreakDuration

    case 'long_break':
      return settings.longBreakDuration
  }
}

function getLiveActivityRemainingSeconds(
  endsAt: number | null,
  secondsLeft: number,
): number {
  if (endsAt === null) {
    return secondsLeft
  }

  return Math.max(
    0,
    Math.ceil(
      (endsAt - Date.now()) / 1000,
    ),
  )
}

export function useTimer() {
  const {
    status,
    sessionType,
    settings,
    secondsLeft,
    endsAt,
    tick,
    activeTaskId,
    activeProjectId,
  } = usePomodoroStore()

  const tasksQuery = useTasks()
  const projectsQuery = useProjects()

  const createPomodoroSessionMutation =
    useCreatePomodoroSession()

  const incrementTaskPomodoroMutation =
    useIncrementTaskPomodoro()

  const incrementProjectSessionMutation =
    useIncrementProjectSession()

  const intervalRef =
    useRef<ReturnType<
      typeof setInterval
    > | null>(null)

  const previousStatusRef =
    useRef(status)

  const previousSessionTypeRef =
    useRef(sessionType)

  const previousSettingsRef =
    useRef(settings)

  const liveActivityStateRef =
    useRef<string | null>(null)

  const hasSyncedLiveActivityRef =
    useRef(false)

  useEffect(() => {
    const previousStatus =
      previousStatusRef.current

    const completedSessionType =
      previousSessionTypeRef.current

    const completedSessionSettings =
      previousSettingsRef.current

    const sessionWasCompleted =
      previousStatus === 'running' &&
      status === 'completed'

    if (sessionWasCompleted) {
      const durationMinutes =
        getSessionDuration(
          completedSessionType,
          completedSessionSettings,
        )

      const completedAt =
        new Date().toISOString()

      void createPomodoroSessionMutation
        .mutateAsync({
          type: completedSessionType,
          projectId:
            activeProjectId ?? undefined,
          taskId:
            activeTaskId ?? undefined,
          durationMinutes,
          completedAt,
          date: completedAt.split('T')[0],
        })
        .catch((error: unknown) => {
          console.error(
            'Failed to save pomodoro session:',
            error,
          )
        })

      if (
        completedSessionType === 'work'
      ) {
        if (activeTaskId) {
          const activeTask =
            tasksQuery.data?.find(
              (task) =>
                task.id === activeTaskId,
            )

          if (activeTask) {
            void incrementTaskPomodoroMutation
              .mutateAsync(activeTask)
              .catch((error: unknown) => {
                console.error(
                  'Failed to increment task pomodoro:',
                  error,
                )
              })
          }
        }

        if (activeProjectId) {
          const activeProject =
            projectsQuery.data?.find(
              (project) =>
                project.id ===
                activeProjectId,
            )

          if (activeProject) {
            void incrementProjectSessionMutation
              .mutateAsync({
                project: activeProject,
                minutes: durationMinutes,
              })
              .catch((error: unknown) => {
                console.error(
                  'Failed to increment project session:',
                  error,
                )
              })
          }
        }
      }

      if (
        completedSessionSettings.soundEnabled
      ) {
        playCompletionSound()
      }
    }

    previousStatusRef.current = status
    previousSessionTypeRef.current =
      sessionType
    previousSettingsRef.current =
      settings
  }, [
    status,
    sessionType,
    settings,
    activeTaskId,
    activeProjectId,
    tasksQuery.data,
    projectsQuery.data,
    createPomodoroSessionMutation,
    incrementTaskPomodoroMutation,
    incrementProjectSessionMutation,
  ])

  useEffect(() => {
    if (
      status !== 'running' &&
      status !== 'paused'
    ) {
      const needsToEndActivity =
        !hasSyncedLiveActivityRef.current ||
        liveActivityStateRef.current !==
          null

      if (needsToEndActivity) {
        hasSyncedLiveActivityRef.current =
          true

        liveActivityStateRef.current =
          null

        void endFocusLiveActivity()
      }

      return
    }

    const activeTask =
      tasksQuery.data?.find(
        (task) =>
          task.id === activeTaskId,
      )

    const resolvedProjectId =
      activeProjectId ??
      activeTask?.projectId ??
      null

    const activeProject =
      projectsQuery.data?.find(
        (project) =>
          project.id ===
          resolvedProjectId,
      )

    const remainingSeconds =
      getLiveActivityRemainingSeconds(
        status === 'running'
          ? endsAt
          : null,
        secondsLeft,
      )

    const activityStateSignature = [
      status,
      sessionType,
      endsAt ?? 'no-end-date',
      status === 'paused'
        ? remainingSeconds
        : 'countdown',
      activeProject?.name ?? '',
      activeTask?.title ?? '',
    ].join('|')

    const stateHasNotChanged =
      hasSyncedLiveActivityRef.current &&
      liveActivityStateRef.current ===
        activityStateSignature

    if (stateHasNotChanged) {
      return
    }

    hasSyncedLiveActivityRef.current =
      true

    liveActivityStateRef.current =
      activityStateSignature

    void startFocusLiveActivity({
      sessionType,
      status,
      endDate:
        status === 'running'
          ? endsAt
          : null,
      remainingSeconds,
      projectName:
        activeProject?.name,
      taskName:
        activeTask?.title,
    })
  }, [
    status,
    sessionType,
    secondsLeft,
    endsAt,
    activeTaskId,
    activeProjectId,
    tasksQuery.data,
    projectsQuery.data,
  ])

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current =
        setInterval(() => {
          tick()
        }, 1000)
    } else if (intervalRef.current) {
      clearInterval(
        intervalRef.current,
      )

      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(
          intervalRef.current,
        )

        intervalRef.current = null
      }
    }
  }, [status, tick])
}

function playCompletionSound() {
  try {
    const context =
      new AudioContext()

    const notes = [
      523.25,
      659.25,
      783.99,
    ]

    notes.forEach(
      (frequency, index) => {
        const oscillator =
          context.createOscillator()

        const gain =
          context.createGain()

        oscillator.connect(gain)
        gain.connect(
          context.destination,
        )

        oscillator.frequency.value =
          frequency

        oscillator.type = 'sine'

        gain.gain.setValueAtTime(
          0,
          context.currentTime +
            index * 0.18,
        )

        gain.gain.linearRampToValueAtTime(
          0.15,
          context.currentTime +
            index * 0.18 +
            0.02,
        )

        gain.gain.exponentialRampToValueAtTime(
          0.001,
          context.currentTime +
            index * 0.18 +
            0.4,
        )

        oscillator.start(
          context.currentTime +
            index * 0.18,
        )

        oscillator.stop(
          context.currentTime +
            index * 0.18 +
            0.5,
        )
      },
    )
  } catch {
    // AudioContext unavailable
  }
}