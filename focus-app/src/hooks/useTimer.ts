import { useEffect, useRef } from 'react'

import { usePomodoroStore } from '../store/pomodoroStore'
import { useStatsStore } from '../store/statsStore'
import { useTasksStore } from '../store/tasksStore'
import { useProjectsStore } from '../store/projectsStore'

export function useTimer() {
  const {
    status,
    settings,
    tick,
    activeTaskId,
    activeProjectId,
  } = usePomodoroStore()

  const recordFocusSession = useStatsStore(
    s => s.recordFocusSession
  )

  const incrementTaskPomodoro = useTasksStore(
    s => s.incrementTaskPomodoro
  )

  const incrementProjectSession = useProjectsStore(
    s => s.incrementSession
  )

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevStatus = useRef(status)

  useEffect(() => {
    // Detect session completion
    if (
      prevStatus.current === 'running' &&
      status === 'completed'
    ) {
      recordFocusSession(settings.workDuration)

      if (activeTaskId) {
        incrementTaskPomodoro(activeTaskId)
      }

      if (activeProjectId) {
        incrementProjectSession(
          activeProjectId,
          settings.workDuration
        )
      }

      if (settings.soundEnabled) {
        playCompletionSound()
      }
    }

    prevStatus.current = status
  }, [
    status,
    settings,
    activeTaskId,
    activeProjectId,
    recordFocusSession,
    incrementTaskPomodoro,
    incrementProjectSession,
  ])

  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        tick()
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [status, tick])
}

function playCompletionSound() {
  try {
    const ctx = new AudioContext()

    const notes = [
      523.25,
      659.25,
      783.99,
    ]

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.frequency.value = freq
      osc.type = 'sine'

      gain.gain.setValueAtTime(
        0,
        ctx.currentTime + i * 0.18
      )

      gain.gain.linearRampToValueAtTime(
        0.15,
        ctx.currentTime + i * 0.18 + 0.02
      )

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + i * 0.18 + 0.4
      )

      osc.start(ctx.currentTime + i * 0.18)
      osc.stop(ctx.currentTime + i * 0.18 + 0.5)
    })
  } catch {
    // AudioContext unavailable
  }
}