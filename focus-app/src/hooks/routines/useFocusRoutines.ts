import {
  useQuery,
} from '@tanstack/react-query'

import { useInvalidateQuery } from '@/hooks/useInvalidateQuery'
import {
  createFocusRoutine,
  deleteFocusRoutine,
  getFocusRoutines,
  updateFocusRoutine,
  type CreateFocusRoutineInput,
  type UpdateFocusRoutineInput,
} from '@/services/focusRoutinesService'

export const focusRoutinesQueryKey = [
  'focus-routines',
]

export function useFocusRoutines() {
  return useQuery({
    queryKey: focusRoutinesQueryKey,
    queryFn: getFocusRoutines,
  })
}

export function useCreateFocusRoutine() {
  return useInvalidateQuery(
    focusRoutinesQueryKey,
    {
      mutationFn: (
        input: CreateFocusRoutineInput,
      ) => createFocusRoutine(input),
    },
  )
}

interface UpdateFocusRoutineVariables {
  routineId: string
  input: UpdateFocusRoutineInput
}

export function useUpdateFocusRoutine() {
  return useInvalidateQuery(
    focusRoutinesQueryKey,
    {
      mutationFn: ({
        routineId,
        input,
      }: UpdateFocusRoutineVariables) =>
        updateFocusRoutine(
          routineId,
          input,
        ),
    },
  )
}

export function useDeleteFocusRoutine() {
  return useInvalidateQuery(
    focusRoutinesQueryKey,
    {
      mutationFn: (
        routineId: string,
      ) =>
        deleteFocusRoutine(routineId),
    },
  )
}
