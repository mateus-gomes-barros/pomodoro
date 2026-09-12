import { useQuery } from '@tanstack/react-query'

import { useInvalidateQuery } from '@/hooks/useInvalidateQuery'

import {
  closeDailyPlan,
  createTask,
  deleteTask,
  deleteTaskPermanently,
  getTasks,
  getTrashTasks,
  incrementTaskPomodoro,
  reorderDailyPlan,
  reorderTasks,
  setDailyTaskPriority,
  restoreTask,
  toggleTask,
  updateTask,
  type CreateTaskInput,
  type DailyPlanDecision,
  type UpdateTaskInput,
} from '@/services/tasksService'

import type { Task } from '@/types'

export const tasksQueryKey = ['tasks']
export const activeTasksQueryKey = [
  ...tasksQueryKey,
  'active',
]
export const trashTasksQueryKey = [
  ...tasksQueryKey,
  'trash',
]

export function useTasks() {
  return useQuery({
    queryKey: activeTasksQueryKey,
    queryFn: getTasks,
  })
}

export function useTrashTasks() {
  return useQuery({
    queryKey: trashTasksQueryKey,
    queryFn: getTrashTasks,
  })
}

export function useCreateTask() {
  return useInvalidateQuery(
    tasksQueryKey,
    {
      mutationFn: (
        input: CreateTaskInput,
      ) => createTask(input),
    },
  )
}

interface UpdateTaskVariables {
  taskId: string
  input: UpdateTaskInput
}

export function useUpdateTask() {
  return useInvalidateQuery(
    tasksQueryKey,
    {
      mutationFn: ({
        taskId,
        input,
      }: UpdateTaskVariables) =>
        updateTask(taskId, input),
    },
  )
}

export function useDeleteTask() {
  return useInvalidateQuery(
    tasksQueryKey,
    {
      mutationFn: (
        taskId: string,
      ) => deleteTask(taskId),
    },
  )
}

export function useRestoreTask() {
  return useInvalidateQuery(
    tasksQueryKey,
    {
      mutationFn: (
        taskId: string,
      ) => restoreTask(taskId),
    },
  )
}

export function useDeleteTaskPermanently() {
  return useInvalidateQuery(
    tasksQueryKey,
    {
      mutationFn: (
        taskId: string,
      ) =>
        deleteTaskPermanently(taskId),
    },
  )
}

export function useToggleTask() {
  return useInvalidateQuery(
    tasksQueryKey,
    {
      mutationFn: (
        task: Task,
      ) => toggleTask(task),
    },
  )
}

export function useIncrementTaskPomodoro() {
  return useInvalidateQuery(
    tasksQueryKey,
    {
      mutationFn: (
        task: Task,
      ) =>
        incrementTaskPomodoro(task),
    },
  )
}

export function useReorderTasks() {
  return useInvalidateQuery(
    tasksQueryKey,
    {
      mutationFn: (
        tasks: Task[],
      ) => reorderTasks(tasks),
    },
  )
}


export function useReorderDailyPlan() {
  return useInvalidateQuery(
    tasksQueryKey,
    {
      mutationFn: (
        tasks: Task[],
      ) => reorderDailyPlan(tasks),
    },
  )
}

interface SetDailyTaskPriorityVariables {
  task: Task
  priority: 1 | 2 | 3 | null
}

export function useSetDailyTaskPriority() {
  return useInvalidateQuery(
    tasksQueryKey,
    {
      mutationFn: ({
        task,
        priority,
      }: SetDailyTaskPriorityVariables) =>
        setDailyTaskPriority(
          task,
          priority,
        ),
    },
  )
}


interface CloseDailyPlanVariables {
  decisions: DailyPlanDecision[]
  tomorrowDate: string
}

export function useCloseDailyPlan() {
  return useInvalidateQuery(
    tasksQueryKey,
    {
      mutationFn: ({
        decisions,
        tomorrowDate,
      }: CloseDailyPlanVariables) =>
        closeDailyPlan(
          decisions,
          tomorrowDate,
        ),
    },
  )
}
