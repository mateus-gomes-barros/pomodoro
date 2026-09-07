import { motion } from 'framer-motion'
import {
  ArrowLeft,
  LoaderCircle,
  RefreshCw,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'
import {
  useNavigate,
  useParams,
} from 'react-router-dom'

import {
  FocusHomeSymbol,
} from '@/components/focusme/FocusHomeSymbol'
import {
  useAssessFocusHome,
  useFocusHomeProfile,
} from '@/hooks/focusme/useFocusHomeProfile'
import {
  useFocusMeReport,
} from '@/hooks/focusme/useFocusMeReports'
import {
  evaluateFocusHomeEligibility,
} from '@/services/focusMeEligibility'
import type {
  FocusMeMonthlyReport,
} from '@/services/focusMeMonthlyService'

export function FocusHomeRetestPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    reportId,
  } = useParams<{
    reportId: string
  }>()

  const profileQuery =
    useFocusHomeProfile()

  const reportQuery =
    useFocusMeReport(reportId)

  const assessment =
    useAssessFocusHome()

  const profile =
    profileQuery.data

  const report =
    reportQuery.data

  const result =
    assessment.data
      ?.classification

  const eligible =
    report &&
    report.type === 'monthly' &&
    report.schemaVersion >= 2
      ? evaluateFocusHomeEligibility(
          (
            report.metrics as
              FocusMeMonthlyReport
          ).current,
          true,
        ).eligible
      : false

  if (
    profileQuery.isLoading ||
    reportQuery.isLoading
  ) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoaderCircle
          size={30}
          className="animate-spin text-accent-green"
        />
      </div>
    )
  }

  if (
    !profile ||
    !report ||
    !eligible
  ) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-12 lg:px-10">
        <button
          type="button"
          onClick={() =>
            navigate(
              '/settings/focusme',
            )
          }
          className="mb-5 flex items-center gap-2 text-sm text-accent-subtle"
        >
          <ArrowLeft size={17} />

          {t(
            'focusHomeRetest.back',
          )}
        </button>

        <div className="card p-6 text-sm text-accent-subtle">
          {t(
            'focusHomeRetest.unavailable',
          )}
        </div>
      </div>
    )
  }

  async function runRetest() {
    if (
      !report ||
      assessment.isPending
    ) {
      return
    }

    await assessment.mutateAsync({
      report,
      assessmentType: 'retest',
    })
  }

  if (result) {
    const remained =
      result.focusHome ===
      profile.focusHome

    return (
      <div className="mx-auto max-w-3xl px-6 pb-12 text-center lg:px-10">
        <motion.section
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="card relative overflow-hidden p-7 sm:p-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.08),transparent_62%)]" />

          <div className="relative">
            <FocusHomeSymbol
              type={result.focusHome}
              size={168}
              className="mx-auto"
            />

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-green">
              FocushoMe
            </p>

            <h1 className="mt-3 text-4xl font-semibold capitalize text-accent-white">
              {result.focusHome}
            </h1>

            <h2 className="mt-4 text-base font-semibold text-accent-white">
              {t(
                remained
                  ? 'focusHomeRetest.result.remained'
                  : 'focusHomeRetest.result.changed',
              )}
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-accent-subtle">
              {t(
                remained
                  ? 'focusHomeRetest.result.remainedDescription'
                  : 'focusHomeRetest.result.changedDescription',
              )}
            </p>

            <p className="mt-4 text-sm text-accent-subtle">
              {t(
                `focusHomeIdentity.archetypes.${result.archetype}`,
              )}
              {' · '}
              {t(
                `focusHomeIdentity.temporal.${result.temporalExpression}`,
              )}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/focusme')
              }
              className="btn-primary mt-7"
            >
              {t(
                'focusHomeRetest.result.finish',
              )}
            </button>
          </div>
        </motion.section>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pb-12 lg:px-10">
      <button
        type="button"
        onClick={() =>
          navigate(
            '/settings/focusme',
          )
        }
        className="mb-5 flex items-center gap-2 text-sm text-accent-subtle transition hover:text-accent-white"
      >
        <ArrowLeft size={17} />

        {t(
          'focusHomeRetest.back',
        )}
      </button>

      <section className="card p-7 text-center sm:p-10">
        <div className="mx-auto flex items-center justify-center gap-5">
          <FocusHomeSymbol
            type={profile.focusHome}
            size={100}
          />

          <RefreshCw
            size={24}
            className="text-accent-green"
          />
        </div>

        <h1 className="mt-6 text-3xl font-semibold text-accent-white">
          {t(
            'focusHomeRetest.confirm.title',
          )}
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-accent-subtle">
          {t(
            'focusHomeRetest.confirm.description',
          )}
        </p>

        <p className="mx-auto mt-3 max-w-lg text-xs leading-relaxed text-accent-subtle">
          {t(
            'focusHomeRetest.confirm.warning',
          )}
        </p>

        {assessment.isError && (
          <p className="mt-5 rounded-xl bg-red-400/[0.05] p-4 text-sm text-red-300">
            {t(
              'focusHomeRetest.error',
            )}
          </p>
        )}

        <button
          type="button"
          onClick={() =>
            void runRetest()
          }
          disabled={
            assessment.isPending
          }
          className="btn-primary mt-7 inline-flex items-center gap-2 disabled:opacity-50"
        >
          {assessment.isPending ? (
            <LoaderCircle
              size={17}
              className="animate-spin"
            />
          ) : (
            <RefreshCw size={17} />
          )}

          {assessment.isPending
            ? t(
                'focusHomeRetest.analyzing',
              )
            : t(
                'focusHomeRetest.action',
              )}
        </button>
      </section>
    </div>
  )
}
