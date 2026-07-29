import {
    useMutation,
    useQuery,
    useQueryClient,
  } from '@tanstack/react-query'
  
  import {
    createProject,
    getProjects,
    type CreateProjectInput,
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