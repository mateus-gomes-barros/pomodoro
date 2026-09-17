import {
  useEffect,
  useRef,
} from 'react'

import {
  useTasks,
} from '@/hooks/tasks/useTasks'
import {
  sendDesktopNotification,
  isTauriDesktop,
} from '@/services/desktopNotificationService'
import {
  usePomodoroStore,
} from '@/store/pomodoroStore'
import type {
  TimerStatus,
} from '@/types'

const DEADLINE_CHECK_INTERVAL =
  60 * 60 * 1000

function localDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')
  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function calendarDaysUntil(
  dueAt: string,
) {
  const dueDate = new Date(dueAt)

  if (Number.isNaN(dueDate.getTime())) {
    return null
  }

  const today = new Date()
  const localToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
  const localDueDate = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate(),
  )

  return Math.round(
    (
      localDueDate.getTime() -
      localToday.getTime()
    ) /
      86_400_000,
  )
}

function isQuietTime() {
  const hour = new Date().getHours()
  return hour >= 21 || hour < 8
}

export function DesktopNotificationDriver() {
  const status = usePomodoroStore(
    (state) => state.status,
  )
  const sessionType = usePomodoroStore(
    (state) => state.sessionType,
  )
  const activeTaskId = usePomodoroStore(
    (state) => state.activeTaskId,
  )
  const tasksQuery = useTasks()
  const previousStatusRef =
    useRef<TimerStatus>(status)

  useEffect(() => {
    const previousStatus =
      previousStatusRef.current
    previousStatusRef.current = status

    if (
      !isTauriDesktop() ||
      status !== 'completed' ||
      (
        previousStatus !== 'running' &&
        previousStatus !== 'paused'
      )
    ) {
      return
    }

    const activeTask =
      tasksQuery.data?.find(
        (task) =>
          task.id === activeTaskId,
      )

    const isFocus =
      sessionType === 'work'

    void sendDesktopNotification({
      title: isFocus
        ? 'Sessão concluída'
        : 'Pausa concluída',
      body: isFocus
        ? activeTask
          ? `Você concluiu uma sessão em “${activeTask.title}”. Respire um pouco antes de continuar.`
          : 'Você concluiu sua sessão. Respire um pouco antes de continuar.'
        : 'Quando estiver pronto, seu próximo momento de foco pode começar.',
    })
  }, [
    activeTaskId,
    sessionType,
    status,
    tasksQuery.data,
  ])

  useEffect(() => {
    if (
      !isTauriDesktop() ||
      !tasksQuery.data
    ) {
      return
    }

    const checkDeadlines = () => {
      if (
        isQuietTime() ||
        globalThis.localStorage?.getItem(
          'focus-horizon-deadline-reminders-enabled',
        ) === 'false'
      ) {
        return
      }

      const todayKey =
        localDateKey(new Date())
      const countKey =
        `focus-horizon-deadline-count:${todayKey}`
      let sentToday = Number(
        globalThis.localStorage?.getItem(
          countKey,
        ) ?? '0',
      )

      if (sentToday >= 2) {
        return
      }

      const candidates =
        tasksQuery.data
          .filter(
            (task) =>
              !task.completed &&
              Boolean(task.dueAt),
          )
          .map((task) => ({
            task,
            days:
              calendarDaysUntil(
                task.dueAt!,
              ),
          }))
          .filter(
            ({ days }) =>
              days === 3 ||
              days === 1 ||
              days === 0,
          )
          .sort(
            (a, b) =>
              (a.days ?? 99) -
              (b.days ?? 99),
          )

      for (const {
        task,
        days,
      } of candidates) {
        if (sentToday >= 2) {
          break
        }

        const reminderKey =
          `focus-horizon-deadline:${task.id}:${days}:${todayKey}`

        if (
          globalThis.localStorage?.getItem(
            reminderKey,
          )
        ) {
          continue
        }

        const body =
          days === 0
            ? `Hoje é o prazo de “${task.title}”. Ainda dá tempo de encaixá-la no seu ritmo.`
            : days === 1
              ? `“${task.title}” termina amanhã. Um pequeno avanço hoje pode deixar tudo mais leve.`
              : `Só para você se organizar: “${task.title}” termina em 3 dias.`

        void sendDesktopNotification({
          title: 'Um lembrete tranquilo',
          body,
        })

        globalThis.localStorage?.setItem(
          reminderKey,
          'sent',
        )
        sentToday += 1
        globalThis.localStorage?.setItem(
          countKey,
          String(sentToday),
        )
      }
    }

    checkDeadlines()

    const intervalId =
      globalThis.setInterval(
        checkDeadlines,
        DEADLINE_CHECK_INTERVAL,
      )

    return () => {
      globalThis.clearInterval(
        intervalId,
      )
    }
  }, [tasksQuery.data])

  return null
}
