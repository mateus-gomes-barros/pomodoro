import { useEffect, useMemo } from 'react'
import { format, subDays } from 'date-fns'

import { useFocusHomeProfile } from '@/hooks/focusme/useFocusHomeProfile'
import { useGoals } from '@/hooks/goals/useGoals'
import { usePomodoroSessions } from '@/hooks/pomodoro/usePomodoroSessions'
import { useProjects } from '@/hooks/projects/useProjects'
import {
  useCreateTask,
  useTasks,
  useToggleTask,
} from '@/hooks/tasks/useTasks'
import { getStreakBadge } from '@/lib/streakBadges'
import {
  addWearActionListener,
  isFocusPulseAvailable,
  publishFocusPulseSnapshot,
} from '@/services/timerNotificationService'
import { usePomodoroStore } from '@/store/pomodoroStore'

function currentStreak(activeDates: string[]) {
  const dates = new Set(activeDates)
  const today = new Date()
  let cursor = dates.has(format(today, 'yyyy-MM-dd'))
    ? today
    : subDays(today, 1)
  let count = 0
  while (dates.has(format(cursor, 'yyyy-MM-dd'))) {
    count += 1
    cursor = subDays(cursor, 1)
  }
  return count
}

export function useFocusPulseSync() {
  const tasks = useTasks()
  const createTask = useCreateTask()
  const toggleTask = useToggleTask()
  const projects = useProjects()
  const goals = useGoals()
  const sessions = usePomodoroSessions()
  const focusHome = useFocusHomeProfile()
  const settings = usePomodoroStore((state) => state.settings)
  const today = format(new Date(), 'yyyy-MM-dd')

  const snapshot = useMemo(() => {
    const projectMap = new Map(
      (projects.data ?? []).map((project) => [project.id, project]),
    )
    const activeDates = (sessions.data ?? [])
      .filter((session) => session.type === 'work')
      .map((session) => session.date)
    const streak = currentStreak(activeDates)
    const badge = getStreakBadge(streak)
    const todaySessions = (sessions.data ?? []).filter(
      (session) => session.date === today && session.type === 'work',
    )
    const todayTasks = (tasks.data ?? [])
      .filter((task) => task.plannedDate === today && !task.completed)
      .sort((a, b) =>
        (a.dailyPriority ?? 99) - (b.dailyPriority ?? 99) ||
        (a.dailyOrder ?? a.order) - (b.dailyOrder ?? b.order),
      )

    return {
      schemaVersion: 1,
      updatedAt: Date.now(),
      today,
      focusHome: focusHome.data?.focusHome ?? null,
      streak,
      badge: {
        level: badge.minimumDays,
        name: badge.name,
      },
      progress: {
        focusMinutes: todaySessions.reduce(
          (total, session) => total + session.durationMinutes,
          0,
        ),
        sessions: todaySessions.length,
        goalMinutes: settings.dailyFocusGoalMinutes,
      },
      tasks: (tasks.data ?? []).filter((task) => !task.completed).slice(0, 40).map(
        (task) => ({
          id: task.id,
          title: task.title,
          projectId: task.projectId ?? null,
          projectName: task.projectId
            ? projectMap.get(task.projectId)?.name ?? null
            : null,
          projectColor: task.projectId
            ? projectMap.get(task.projectId)?.color ?? null
            : null,
          category: task.category,
          priority: task.priority,
          plannedDate: task.plannedDate ?? null,
          dailyPriority: task.dailyPriority ?? null,
          estimatedPomodoros: task.estimatedPomodoros,
          completedPomodoros: task.completedPomodoros,
        }),
      ),
      todayTaskIds: todayTasks.map((task) => task.id),
      goals: (goals.data ?? []).map((goal) => ({
        id: goal.id,
        title: goal.title,
        completed: goal.completed,
      })),
    }
  }, [
    focusHome.data?.focusHome,
    goals.data,
    projects.data,
    sessions.data,
    settings.dailyFocusGoalMinutes,
    tasks.data,
    today,
  ])

  useEffect(() => {
    const listener = addWearActionListener((action) => {
      if (action.type === 'create_task' && action.title?.trim()) {
        void createTask.mutateAsync({
          title: action.title.trim(),
          priority: 'medium',
          category: 'planned',
          estimatedPomodoros: 1,
          plannedDate: today,
        })
      }
      if (action.type === 'select_task' && action.taskId) {
        const task = tasks.data?.find((item) => item.id === action.taskId)
        if (task) {
          usePomodoroStore.getState().setActiveTask(task.id)
          usePomodoroStore.getState().setActiveProject(task.projectId ?? null)
        }
      }
      if (action.type === 'complete_task' && action.taskId) {
        const task = tasks.data?.find((item) => item.id === action.taskId)
        if (task && !task.completed) void toggleTask.mutateAsync(task)
      }
    })
    return () => {
      if ('then' in listener) {
        void listener.then((handle) => handle.remove())
      } else {
        listener.remove()
      }
    }
  }, [createTask, tasks.data, today, toggleTask])

  useEffect(() => {
    if (!isFocusPulseAvailable()) return
    void publishFocusPulseSnapshot(snapshot).catch((error: unknown) => {
      console.error('Failed to sync Focus 6 with Focus Pulse:', error)
    })
  }, [snapshot])
}
