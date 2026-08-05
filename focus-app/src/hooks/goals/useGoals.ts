import { useQuery } from '@tanstack/react-query'

import { useInvalidateQuery } from '@/hooks/useInvalidateQuery'

import {
  createGoal,
  deleteGoal,
  getGoals,
  reorderGoals,
  toggleGoal,
  updateGoal,
  type CreateGoalInput,
  type UpdateGoalInput,
} from '@/services/goalsService'

import type { Goal } from '@/types'

export function goalsQueryKey(
  year: number,
) {
  return ['goals', year]
}

export function useGoals(
  year = new Date().getFullYear(),
) {
  return useQuery({
    queryKey: goalsQueryKey(year),
    queryFn: () => getGoals(year),
  })
}

export function useCreateGoal(
  year = new Date().getFullYear(),
) {
  return useInvalidateQuery(
    goalsQueryKey(year),
    {
      mutationFn: (
        input: CreateGoalInput,
      ) =>
        createGoal({
          ...input,
          year: input.year ?? year,
        }),
    },
  )
}

interface UpdateGoalVariables {
  goalId: string
  input: UpdateGoalInput
}

export function useUpdateGoal(
  year = new Date().getFullYear(),
) {
  return useInvalidateQuery(
    goalsQueryKey(year),
    {
      mutationFn: ({
        goalId,
        input,
      }: UpdateGoalVariables) =>
        updateGoal(goalId, input),
    },
  )
}

export function useDeleteGoal(
  year = new Date().getFullYear(),
) {
  return useInvalidateQuery(
    goalsQueryKey(year),
    {
      mutationFn: (
        goalId: string,
      ) => deleteGoal(goalId),
    },
  )
}

export function useToggleGoal(
  year = new Date().getFullYear(),
) {
  return useInvalidateQuery(
    goalsQueryKey(year),
    {
      mutationFn: (
        goal: Goal,
      ) => toggleGoal(goal),
    },
  )
}

export function useReorderGoals(
  year = new Date().getFullYear(),
) {
  return useInvalidateQuery(
    goalsQueryKey(year),
    {
      mutationFn: (
        goals: Goal[],
      ) => reorderGoals(goals),
    },
  )
}