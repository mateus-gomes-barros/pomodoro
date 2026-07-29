import {
    useMutation,
    useQueryClient,
    type QueryKey,
    type UseMutationOptions,
  } from '@tanstack/react-query'
  
  export function useInvalidateQuery<
    TData,
    TError = Error,
    TVariables = void,
    TOnMutateResult = unknown,
  >(
    queryKey: QueryKey,
    options: UseMutationOptions<
      TData,
      TError,
      TVariables,
      TOnMutateResult
    >,
  ) {
    const queryClient = useQueryClient()
  
    return useMutation({
      ...options,
  
      onSuccess: async (
        data,
        variables,
        onMutateResult,
        context,
      ) => {
        await queryClient.invalidateQueries({
          queryKey,
        })
  
        await options.onSuccess?.(
          data,
          variables,
          onMutateResult,
          context,
        )
      },
    })
  }