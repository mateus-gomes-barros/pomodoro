import { useQuery } from '@tanstack/react-query'

import { useInvalidateQuery } from '@/hooks/useInvalidateQuery'

import {
  createTask,
  deleteTask,
  getTasks,
  incrementTaskPomodoro,
  reorderTasks,
  toggleTask,
  updateTask,
  type CreateTaskInput,
  type UpdateTaskInput,
} from '@/services/tasksService'

import type { Task } from '@/types'

export const tasksQueryKey = ['tasks']

export function useTasks() {
  return useQuery({
    queryKey: tasksQueryKey,
    queryFn: getTasks,
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
      ) => incrementTaskPomodoro(task),
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