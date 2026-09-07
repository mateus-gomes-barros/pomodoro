import {
  useQuery,
} from '@tanstack/react-query'

import {
  getFocusMeMonthlyReport,
} from '@/services/focusMeMonthlyService'

export const focusMeMonthlyQueryKey = [
  'focusme',
  'monthly',
]

export function useFocusMeMonthlyReport(
  referenceDate?: Date,
) {
  const referenceKey =
    referenceDate
      ? referenceDate
          .toISOString()
          .slice(0, 7)
      : new Date()
          .toISOString()
          .slice(0, 7)

  return useQuery({
    queryKey: [
      ...focusMeMonthlyQueryKey,
      referenceKey,
    ],
    queryFn: () =>
      getFocusMeMonthlyReport(
        referenceDate,
      ),
  })
}
