import { useQuery } from '@tanstack/react-query'

import { useInvalidateQuery } from '@/hooks/useInvalidateQuery'

import {
  createProject,
  deleteProject,
  getProjects,
  incrementProjectSession,
  updateProject,
  type CreateProjectInput,
  type UpdateProjectInput,
} from '@/services/projectsService'

import type { Project } from '@/types'

export const projectsQueryKey = ['projects']

export function useProjects() {
  return useQuery({
    queryKey: projectsQueryKey,
    queryFn: getProjects,
  })
}

export function useCreateProject() {
  return useInvalidateQuery(
    projectsQueryKey,
    {
      mutationFn: (
        input: CreateProjectInput,
      ) => createProject(input),
    },
  )
}

interface UpdateProjectVariables {
  projectId: string
  input: UpdateProjectInput
}

export function useUpdateProject() {
  return useInvalidateQuery(
    projectsQueryKey,
    {
      mutationFn: ({
        projectId,
        input,
      }: UpdateProjectVariables) =>
        updateProject(projectId, input),
    },
  )
}

export function useDeleteProject() {
  return useInvalidateQuery(
    projectsQueryKey,
    {
      mutationFn: (
        projectId: string,
      ) => deleteProject(projectId),
    },
  )
}

interface IncrementProjectSessionVariables {
  project: Project
  minutes: number
}

export function useIncrementProjectSession() {
  return useInvalidateQuery(
    projectsQueryKey,
    {
      mutationFn: ({
        project,
        minutes,
      }: IncrementProjectSessionVariables) =>
        incrementProjectSession(
          project,
          minutes,
        ),
    },
  )
}