import {
  useQuery,
} from '@tanstack/react-query'

import {
  getFocusMeWeeklyReport,
} from '@/services/focusMeService'

export const focusMeWeeklyQueryKey = [
  'focusme',
  'weekly',
]

export function useFocusMeWeeklyReport(
  referenceDate?: Date,
) {
  const referenceKey =
    referenceDate
      ? referenceDate
          .toISOString()
          .split('T')[0]
      : new Date()
          .toISOString()
          .split('T')[0]

  return useQuery({
    queryKey: [
      ...focusMeWeeklyQueryKey,
      referenceKey,
    ],
    queryFn: () =>
      getFocusMeWeeklyReport(
        referenceDate,
      ),
  })
}
