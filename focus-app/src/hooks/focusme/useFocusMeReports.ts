import {
  useEffect,
  useRef,
} from 'react'
import {
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  finalizeLatestFocusMeReports,
  getFocusMeReport,
  getFocusMeReports,
  type FocusMeReportType,
} from '@/services/focusMeReportsService'

export const focusMeReportsQueryKey = [
  'focusme',
  'reports',
]

export function useFocusMeReports(
  type?: FocusMeReportType,
) {
  const queryClient =
    useQueryClient()

  const backfillStarted =
    useRef(false)

  const query = useQuery({
    queryKey: [
      ...focusMeReportsQueryKey,
      type ?? 'all',
    ],
    queryFn: () =>
      getFocusMeReports(type),
  })

  useEffect(() => {
    if (backfillStarted.current) {
      return
    }

    backfillStarted.current = true

    void finalizeLatestFocusMeReports()
      .then(async () => {
        await queryClient
          .invalidateQueries({
            queryKey:
              focusMeReportsQueryKey,
          })
      })
      .catch((error) => {
        console.error(
          'FocusMe report backfill failed:',
          error,
        )
      })
  }, [queryClient])

  return query
}

export function useFocusMeReport(
  reportId?: string,
) {
  return useQuery({
    queryKey: [
      ...focusMeReportsQueryKey,
      'detail',
      reportId,
    ],
    queryFn: () =>
      getFocusMeReport(
        reportId as string,
      ),
    enabled: Boolean(reportId),
  })
}
