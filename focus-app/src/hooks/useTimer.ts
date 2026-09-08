import {
  useEffect,
  useMemo,
  useRef,
} from 'react'
import {
  format,
  subDays,
} from 'date-fns'

import {
  useCreatePomodoroSession,
  usePomodoroSessions,
} from '@/hooks/pomodoro/usePomodoroSessions'
import {
  useIncrementProjectSession,
  useProjects,
} from '@/hooks/projects/useProjects'
import {
  useIncrementTaskPomodoro,
  useTasks,
} from '@/hooks/tasks/useTasks'
import { getStreakBadge } from '@/lib/streakBadges'
import {
  endFocusLiveActivity,
  startFocusLiveActivity,
} from '@/services/focusLiveActivityService'
import {
  clearTimerNotification,
  showTimerNotification,
  addNotificationActionListener,
} from '@/services/timerNotificationService'
import { usePomodoroStore } from '@/store/pomodoroStore'

function getLiveActivityRemainingSeconds(
  endsAt: number | null,
  secondsLeft: number,
): number {
  if (endsAt === null) {
    return secondsLeft
  }
  return Math.max(
    0,
    Math.ceil((endsAt - Date.now()) / 1000),
  )
}

function calculateCurrentStreak(activeDates: string[]): number {
  const uniqueDates = new Set(activeDates)
  const today = new Date()
  const todayString = format(today, 'yyyy-MM-dd')
  const yesterday = subDays(today, 1)
  const yesterdayString = format(yesterday, 'yyyy-MM-dd')

  let currentDate: Date | null =
    uniqueDates.has(todayString)
      ? today
      : uniqueDates.has(yesterdayString)
        ? yesterday
        : null

  let currentStreak = 0
  while (currentDate) {
    const dateString = format(currentDate, 'yyyy-MM-dd')
    if (!uniqueDates.has(dateString)) break
    currentStreak += 1
    currentDate = subDays(currentDate, 1)
  }
  return currentStreak
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
    sessions: localSessions,
  } = usePomodoroStore()

  const tasksQuery = useTasks()
  const projectsQuery = useProjects()
  const sessionsQuery = usePomodoroSessions()

  const createPomodoroSessionMutation = useCreatePomodoroSession()
  const incrementTaskPomodoroMutation = useIncrementTaskPomodoro()
  const incrementProjectSessionMutation = useIncrementProjectSession()

  const currentBadge = useMemo(() => {
    const workSessionDates = (sessionsQuery.data ?? [])
      .filter((session) => session.type === 'work')
      .map((session) => session.date)

    const currentStreak = calculateCurrentStreak(workSessionDates)
    return getStreakBadge(currentStreak)
  }, [sessionsQuery.data])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSavedSessionIdRef =
    useRef<string | null>(
      localSessions.at(-1)?.id ??
      null,
    )
  const liveActivityStateRef = useRef<string | null>(null)
  const hasSyncedLiveActivityRef = useRef(false)

  // 1. Salva cada sessão adicionada ao histórico local.
  // Funciona também quando a próxima sessão inicia automaticamente.
  useEffect(() => {
    const completedSession =
      localSessions.at(-1)

    if (
      !completedSession ||
      completedSession.id ===
        lastSavedSessionIdRef.current
    ) {
      return
    }

    lastSavedSessionIdRef.current =
      completedSession.id

    void createPomodoroSessionMutation
      .mutateAsync({
        type:
          completedSession.type,
        projectId:
          completedSession.projectId,
        taskId:
          completedSession.taskId,
        durationMinutes:
          completedSession.durationMinutes,
        completedAt:
          completedSession.completedAt,
        date:
          completedSession.date,
      })
      .catch((error: unknown) => {
        console.error(
          'Failed to save pomodoro session:',
          error,
        )

        lastSavedSessionIdRef.current =
          null
      })

    if (
      completedSession.type ===
      'work'
    ) {
      if (completedSession.taskId) {
        const activeTask =
          tasksQuery.data?.find(
            (task) =>
              task.id ===
              completedSession.taskId,
          )

        if (activeTask) {
          void incrementTaskPomodoroMutation
            .mutateAsync(activeTask)
            .catch(console.error)
        }
      }

      if (
        completedSession.projectId
      ) {
        const activeProject =
          projectsQuery.data?.find(
            (project) =>
              project.id ===
              completedSession.projectId,
          )

        if (activeProject) {
          void incrementProjectSessionMutation
            .mutateAsync({
              project:
                activeProject,
              minutes:
                completedSession
                  .durationMinutes,
            })
            .catch(console.error)
        }
      }
    }

    if (settings.soundEnabled) {
      playCompletionSound()
    }
  }, [
    localSessions,
    settings.soundEnabled,
    tasksQuery.data,
    projectsQuery.data,
    createPomodoroSessionMutation,
    incrementTaskPomodoroMutation,
    incrementProjectSessionMutation,
  ])

  // 2. Hook para sincronizar atividades nativas (Live Activity iOS + Notification Android)
  useEffect(() => {
    if (status !== 'running' && status !== 'paused') {
      const needsToEndActivity =
        !hasSyncedLiveActivityRef.current || liveActivityStateRef.current !== null

      if (needsToEndActivity) {
        hasSyncedLiveActivityRef.current = true
        liveActivityStateRef.current = null
        
        // Limpa estado nativo em ambas as plataformas
        void endFocusLiveActivity()
        void clearTimerNotification()
      }
      return
    }

    const activeTask = tasksQuery.data?.find((t) => t.id === activeTaskId)
    const resolvedProjectId = activeProjectId ?? activeTask?.projectId ?? null
    const activeProject = projectsQuery.data?.find((p) => p.id === resolvedProjectId)

    const remainingSeconds = getLiveActivityRemainingSeconds(
      status === 'running' ? endsAt : null,
      secondsLeft,
    )

    const activityStateSignature = [
      status,
      sessionType,
      endsAt ?? 'no-end-date',
      status === 'paused' ? remainingSeconds : 'countdown',
      activeProject?.name ?? '',
      activeTask?.title ?? '',
      currentBadge.icon,
    ].join('|')

    const stateHasNotChanged =
      hasSyncedLiveActivityRef.current &&
      liveActivityStateRef.current === activityStateSignature

    if (stateHasNotChanged) {
      return
    }

    hasSyncedLiveActivityRef.current = true
    liveActivityStateRef.current = activityStateSignature

    // Atualiza Live Activity (iOS)
    void startFocusLiveActivity({
      sessionType,
      status,
      endDate: status === 'running' ? endsAt : null,
      remainingSeconds,
      projectName: activeProject?.name,
      taskName: activeTask?.title,
      badgeIcon: currentBadge.icon,
    })

    // Atualiza Notificação Fixa / Now Bar (Android)
    // O cronômetro é controlado nativamente pelo Android através do endTime.
    // Não enviamos o tempo como texto para evitar que ele fique duplicado/estático.

    const focusEmoji = activeProject?.emoji ?? '⏱️'

const focusName =
  activeTask?.title ??
  activeProject?.name ??
  (sessionType === 'work'
    ? 'Foco'
    : sessionType === 'short_break'
      ? 'Pausa Curta'
      : 'Pausa Longa')

const notificationTitle = `${focusEmoji} ${focusName}`

const notificationBody =
  activeTask?.title && activeProject?.name
    ? activeProject.name
    : ''

void showTimerNotification(
  notificationTitle,
  notificationBody,
  status === 'running' ? (endsAt ?? 0) : 0,
  currentBadge.icon,
)
  }, [
    status,
    sessionType,
    secondsLeft,
    endsAt,
    activeTaskId,
    activeProjectId,
    tasksQuery.data,
    projectsQuery.data,
    currentBadge.icon,
  ])

  // 3. Hook para ouvir ações da notificação (Android)
  useEffect(() => {
    const handleAction = (action: string) => {
      const { status, start, pause, reset } = usePomodoroStore.getState()
      console.log('⚡ [useTimer] Ação recebida da notificação:', action)

      if (action === 'com.mateusgomes.focusapp.ACTION_PAUSE') {
        if (status === 'running') {
          pause()
        } else {
          start()
        }
      } else if (action === 'com.mateusgomes.focusapp.ACTION_STOP') {
        reset()
      }
    }

    const listener = addNotificationActionListener(handleAction)

    return () => {
      if (listener && 'then' in listener) {
        void (listener as any).then((h: any) => h.remove())
      }
    }
  }, [])

  // 4. Hook para o Ticking interval
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = setInterval(() => {
        tick()
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [status, tick])
}

function playCompletionSound() {
  try {
    const context = new AudioContext()
    const notes = [523.25, 659.25, 783.99]
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      gain.gain.setValueAtTime(0, context.currentTime + index * 0.18)
      gain.gain.linearRampToValueAtTime(0.15, context.currentTime + index * 0.18 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + index * 0.18 + 0.4)
      oscillator.start(context.currentTime + index * 0.18)
      oscillator.stop(context.currentTime + index * 0.18 + 0.5)
    })
  } catch {
    // AudioContext unavailable
  }
}
