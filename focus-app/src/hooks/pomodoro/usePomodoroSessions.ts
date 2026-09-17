import { useQuery } from '@tanstack/react-query'

import { useInvalidateQuery } from '@/hooks/useInvalidateQuery'

import {
  createPomodoroSession,
  deletePomodoroSession,
  getPomodoroSessions,
  type CreatePomodoroSessionInput,
} from '@/services/pomodoroSessionsService'

export const pomodoroSessionsQueryKey = [
  'pomodoro-sessions',
]

export function usePomodoroSessions() {
  return useQuery({
    queryKey: pomodoroSessionsQueryKey,
    queryFn: getPomodoroSessions,
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })
}

export function useCreatePomodoroSession() {
  return useInvalidateQuery(
    pomodoroSessionsQueryKey,
    {
      mutationFn: (
        input: CreatePomodoroSessionInput,
      ) => createPomodoroSession(input),
    },
  )
}

export function useDeletePomodoroSession() {
  return useInvalidateQuery(
    pomodoroSessionsQueryKey,
    {
      mutationFn: (sessionId: string) =>
        deletePomodoroSession(sessionId),
    },
  )
}
