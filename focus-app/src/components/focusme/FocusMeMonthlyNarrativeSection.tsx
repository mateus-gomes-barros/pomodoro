import {
  FocusMeMonthlyNarrativeCard,
} from '@/components/focusme/FocusMeMonthlyNarrativeCard'
import type {
  FocusMeMonthlyReport,
} from '@/services/focusMeMonthlyService'
import type {
  FocusMeStoredReport,
} from '@/services/focusMeReportsService'

interface FocusMeMonthlyNarrativeSectionProps {
  storedReport:
    FocusMeStoredReport
  report:
    FocusMeMonthlyReport
}

export function FocusMeMonthlyNarrativeSection({
  storedReport,
  report,
}: FocusMeMonthlyNarrativeSectionProps) {
  if (
    storedReport.schemaVersion < 2
  ) {
    return null
  }

  return (
    <FocusMeMonthlyNarrativeCard
      report={report}
    />
  )
}
