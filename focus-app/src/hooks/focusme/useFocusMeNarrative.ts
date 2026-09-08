import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  generateFocusMeReportNarrative,
  getFocusMeReportNarrative,
  type FocusMeNarrativeLocale,
} from '@/services/focusMeNarrativesService'

export const focusMeNarrativeQueryKey = [
  'focusme',
  'narratives',
]

export function useFocusMeNarrative(
  reportId: string | undefined,
  locale: FocusMeNarrativeLocale,
  enabled = true,
) {
  return useQuery({
    queryKey: [
      ...focusMeNarrativeQueryKey,
      reportId,
      locale,
    ],
    queryFn: () =>
      getFocusMeReportNarrative(
        reportId as string,
        locale,
      ),
    enabled:
      enabled &&
      Boolean(reportId),
    refetchInterval: (query) =>
      query.state.data?.status ===
        'pending'
        ? 2500
        : false,
  })
}

export function useGenerateFocusMeNarrative() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      reportId,
      locale,
    }: {
      reportId: string
      locale:
        FocusMeNarrativeLocale
    }) =>
      generateFocusMeReportNarrative(
        reportId,
        locale,
      ),

    onSuccess: async (
      _result,
      variables,
    ) => {
      await queryClient
        .invalidateQueries({
          queryKey: [
            ...focusMeNarrativeQueryKey,
            variables.reportId,
            variables.locale,
          ],
        })
    },
  })
}
