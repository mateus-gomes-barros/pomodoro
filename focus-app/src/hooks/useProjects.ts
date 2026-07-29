import {
    useMutation,
    useQuery,
    useQueryClient,
  } from '@tanstack/react-query'
  
  import {
    createProject,
    deleteProject,
    getProjects,
    updateProject,
    type CreateProjectInput,
    type UpdateProjectInput,
  } from '@/services/projectsService'
  
  export const projectsQueryKey = ['projects']
  
  export function useProjects() {
    return useQuery({
      queryKey: projectsQueryKey,
      queryFn: getProjects,
    })
  }
  
  export function useCreateProject() {
    const queryClient = useQueryClient()
  
    return useMutation({
      mutationFn: (
        input: CreateProjectInput,
      ) => createProject(input),
  
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: projectsQueryKey,
        })
      },
    })
  }
  
  interface UpdateProjectVariables {
    projectId: string
    input: UpdateProjectInput
  }
  
  export function useUpdateProject() {
    const queryClient = useQueryClient()
  
    return useMutation({
      mutationFn: ({
        projectId,
        input,
      }: UpdateProjectVariables) =>
        updateProject(projectId, input),
  
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: projectsQueryKey,
        })
      },
    })
  }
  
  export function useDeleteProject() {
    const queryClient = useQueryClient()
  
    return useMutation({
      mutationFn: (
        projectId: string,
      ) => deleteProject(projectId),
  
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: projectsQueryKey,
        })
      },
    })
  }