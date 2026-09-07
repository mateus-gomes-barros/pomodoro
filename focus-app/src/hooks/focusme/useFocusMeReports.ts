import {
  useQuery,
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
  return useQuery({
    queryKey: [
      ...focusMeReportsQueryKey,
      type ?? 'all',
    ],
    queryFn: async () => {
      await finalizeLatestFocusMeReports()

      return getFocusMeReports(type)
    },
  })
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
