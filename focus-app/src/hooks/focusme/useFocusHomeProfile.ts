import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  assessFocusHome,
  getFocusHomeAssessmentReportId,
  getFocusHomeAssessments,
  getFocusHomeProfile,
  type FocusHomeAssessmentType,
} from '@/services/focusHomeService'
import {
  focusMeReportsQueryKey,
} from '@/hooks/focusme/useFocusMeReports'
import type {
  FocusMeStoredReport,
} from '@/services/focusMeReportsService'

export const focusHomeProfileQueryKey = [
  'focusme',
  'focushome',
  'profile',
]

export const focusHomeAssessmentsQueryKey = [
  'focusme',
  'focushome',
  'assessments',
]

export function useFocusHomeAssessments() {
  return useQuery({
    queryKey:
      focusHomeAssessmentsQueryKey,
    queryFn:
      getFocusHomeAssessments,
  })
}

export function useFocusHomeProfile() {
  return useQuery({
    queryKey:
      focusHomeProfileQueryKey,
    queryFn:
      getFocusHomeProfile,
  })
}

export function useAssessFocusHome() {
  const queryClient =
    useQueryClient()

  return useMutation({
    mutationFn: ({
      report,
      assessmentType,
    }: {
      report: FocusMeStoredReport
      assessmentType:
        FocusHomeAssessmentType
    }) =>
      assessFocusHome(
        report,
        assessmentType,
      ),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey:
            focusHomeProfileQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey:
            focusMeReportsQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey:
            focusHomeAssessmentsQueryKey,
        }),
      ])
    },
  })
}


export function useFocusHomeAssessmentReportId(
  assessmentId?: string,
) {
  return useQuery({
    queryKey: [
      ...focusHomeProfileQueryKey,
      'assessment-report',
      assessmentId,
    ],
    queryFn: () =>
      getFocusHomeAssessmentReportId(
        assessmentId as string,
      ),
    enabled: Boolean(assessmentId),
  })
}
