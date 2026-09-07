import {
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'
import {
  useNavigate,
} from 'react-router-dom'

import {
  useFocusHomeAssessmentReportId,
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

export function FocusHomeRetestControl() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const profileQuery =
    useFocusHomeProfile()

  const reportsQuery =
    useFocusMeReports()

  const profile =
    profileQuery.data

  const assessmentReportQuery =
    useFocusHomeAssessmentReportId(
      profile?.currentAssessmentId,
    )

  const loading =
    profileQuery.isLoading ||
    reportsQuery.isLoading ||
    (
      Boolean(profile) &&
      assessmentReportQuery.isLoading
    )

  const reports =
    reportsQuery.data ?? []

  const currentReport =
    reports.find(
      (report) =>
        report.id ===
        assessmentReportQuery.data,
    )

  const newerReports =
    reports.filter(
      (report) =>
        report.type === 'monthly' &&
        report.schemaVersion >= 2 &&
        (
          !currentReport ||
          report.periodStart >
            currentReport.periodStart
        ),
    )

  const eligibleReport =
    newerReports.find(
      (report) => {
        const metrics =
          report.metrics as
            FocusMeMonthlyReport

        return evaluateFocusHomeEligibility(
          metrics.current,
          true,
        ).eligible
      },
    )

  let state:
    | 'loading'
    | 'first'
    | 'waiting'
    | 'available'

  if (loading) {
    state = 'loading'
  } else if (!profile) {
    state = 'first'
  } else if (eligibleReport) {
    state = 'available'
  } else {
    state = 'waiting'
  }

  return (
    <section className="rounded-2xl border border-accent-green/30 bg-accent-green/[0.025] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green">
          {state === 'loading' ? (
            <LoaderCircle
              size={19}
              className="animate-spin"
            />
          ) : (
            <RefreshCw size={19} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-accent-white">
            {t(
              'focusHomeRetest.title',
            )}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-accent-subtle">
            {t(
              `focusHomeRetest.states.${state}`,
            )}
          </p>

          <button
            type="button"
            disabled={
              state !== 'available'
            }
            onClick={() => {
              if (eligibleReport) {
                navigate(
                  `/focusme/retest/${eligibleReport.id}`,
                )
              }
            }}
            className="mt-5 rounded-xl border border-accent-green/60 px-4 py-2.5 text-xs font-semibold text-accent-green transition hover:bg-accent-green/10 disabled:cursor-not-allowed disabled:border-white/[0.08] disabled:text-accent-subtle disabled:opacity-60"
          >
            {t(
              'focusHomeRetest.action',
            )}
          </button>
        </div>
      </div>
    </section>
  )
}
