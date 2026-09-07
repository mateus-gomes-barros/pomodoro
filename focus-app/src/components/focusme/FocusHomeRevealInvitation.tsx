import {
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'
import {
  useNavigate,
} from 'react-router-dom'

import {
  useFocusHomeProfile,
} from '@/hooks/focusme/useFocusHomeProfile'
import {
  useFocusMeReports,
} from '@/hooks/focusme/useFocusMeReports'
import {
  evaluateFocusHomeEligibility,
} from '@/services/focusMeEligibility'
import type {
  FocusMeMonthlyReport,
} from '@/services/focusMeMonthlyService'

export function FocusHomeRevealInvitation() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const profileQuery =
    useFocusHomeProfile()

  const reportsQuery =
    useFocusMeReports()

  if (
    profileQuery.isLoading ||
    reportsQuery.isLoading ||
    profileQuery.data
  ) {
    return null
  }

  const eligibleReport =
    reportsQuery.data?.find(
      (report) => {
        if (
          report.type !== 'monthly' ||
          report.schemaVersion < 2
        ) {
          return false
        }

        const metrics =
          report.metrics as
            FocusMeMonthlyReport

        return evaluateFocusHomeEligibility(
          metrics.current,
          true,
        ).eligible
      },
    )

  if (!eligibleReport) {
    return null
  }

  return (
    <button
      type="button"
      onClick={() =>
        navigate(
          `/focusme/reveal/${eligibleReport.id}`,
        )
      }
      className="card relative mb-5 flex w-full items-center gap-4 overflow-hidden p-5 text-left transition hover:border-accent-green/30 hover:bg-accent-green/[0.035]"
    >
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-accent-green/10 blur-3xl" />

      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
        <Sparkles size={21} />
      </div>

      <div className="relative min-w-0 flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-green">
          FocushoMe
        </span>

        <h2 className="mt-1 text-sm font-semibold text-accent-white">
          {t(
            'focusHomeReveal.invitation.title',
          )}
        </h2>

        <p className="mt-1 text-xs leading-relaxed text-accent-subtle">
          {t(
            'focusHomeReveal.invitation.description',
          )}
        </p>
      </div>

      <ChevronRight
        size={18}
        className="relative shrink-0 text-accent-green"
      />
    </button>
  )
}
