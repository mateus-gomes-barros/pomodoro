import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
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
  FocusMeIcon,
} from '@/components/icons/FocusMeIcon'
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

export function FocusHomeRevealPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    reportId,
  } = useParams<{
    reportId: string
  }>()

  const reportQuery =
    useFocusMeReport(reportId)

  const profileQuery =
    useFocusHomeProfile()

  const assessment =
    useAssessFocusHome()

  const report =
    reportQuery.data

  const existingProfile =
    profileQuery.data

  const classification =
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
    reportQuery.isLoading ||
    profileQuery.isLoading
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
    reportQuery.isError ||
    !report ||
    !eligible
  ) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-12 lg:px-10">
        <button
          type="button"
          onClick={() =>
            navigate('/focusme')
          }
          className="mb-5 flex items-center gap-2 text-sm text-accent-subtle"
        >
          <ArrowLeft size={17} />

          {t(
            'focusHomeReveal.back',
          )}
        </button>

        <div className="card p-6 text-sm text-accent-subtle">
          {t(
            'focusHomeReveal.unavailable',
          )}
        </div>
      </div>
    )
  }

  if (
    existingProfile &&
    !classification
  ) {
    return (
      <div className="mx-auto max-w-2xl px-6 pb-12 text-center lg:px-10">
        <div className="card p-7">
          <FocusHomeSymbol
            type={
              existingProfile.focusHome
            }
            size={128}
            className="mx-auto"
          />

          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-accent-subtle">
            {t(
              'focusHomeReveal.alreadyRevealed',
            )}
          </p>

          <h1 className="mt-2 text-3xl font-semibold capitalize text-accent-white">
            {existingProfile.focusHome}
          </h1>

          <button
            type="button"
            onClick={() =>
              navigate('/focusme')
            }
            className="btn-primary mt-7"
          >
            {t(
              'focusHomeReveal.goToFocusMe',
            )}
          </button>
        </div>
      </div>
    )
  }

  async function reveal() {
    if (
      !report ||
      assessment.isPending
    ) {
      return
    }

    await assessment.mutateAsync({
      report,
      assessmentType: 'initial',
    })
  }

  if (classification) {
    return (
      <div className="mx-auto max-w-3xl px-6 pb-12 text-center lg:px-10 lg:pb-16">
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.94,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 0.55,
          }}
          className="card relative overflow-hidden p-7 sm:p-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.08),transparent_62%)]" />

          <div className="relative">
            <motion.div
              initial={{
                opacity: 0,
                rotate: -18,
                scale: 0.65,
              }}
              animate={{
                opacity: 1,
                rotate: 0,
                scale: 1,
              }}
              transition={{
                delay: 0.18,
                type: 'spring',
                stiffness: 170,
                damping: 18,
              }}
            >
              <FocusHomeSymbol
                type={
                  classification.focusHome
                }
                size={176}
                className="mx-auto"
              />
            </motion.div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.22em] text-accent-green">
              {t(
                'focusHomeReveal.result.eyebrow',
              )}
            </p>

            <h1 className="mt-3 text-4xl font-semibold capitalize text-accent-white sm:text-5xl">
              {classification.focusHome}
            </h1>

            <p className="mt-3 text-base font-medium text-accent-white">
              {t(
                `focusHomeIdentity.archetypes.${classification.archetype}`,
              )}
            </p>

            <p className="mt-2 text-sm text-accent-subtle">
              {t(
                'focusHomeReveal.result.influence',
                {
                  archetype: t(
                    `focusHomeIdentity.archetypes.${classification.secondaryArchetype}`,
                  ),
                },
              )}
            </p>

            <p className="mt-1 text-sm text-accent-subtle">
              {t(
                'focusHomeReveal.result.expression',
                {
                  expression: t(
                    `focusHomeIdentity.temporal.${classification.temporalExpression}`,
                  ),
                },
              )}
            </p>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-accent-subtle">
              {t(
                `focusMePage.symbols.items.${classification.focusHome}.description`,
              )}
            </p>

            {classification.traits.length > 0 && (
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {classification.traits.map(
                  (trait) => (
                    <span
                      key={trait}
                      className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-accent-subtle"
                    >
                      {t(
                        `focusHomeReveal.traits.${trait}`,
                      )}
                    </span>
                  ),
                )}
              </div>
            )}

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-accent-green">
              <CheckCircle2 size={16} />

              {t(
                'focusHomeReveal.result.permanent',
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/focusme')
              }
              className="btn-primary mt-7"
            >
              {t(
                'focusHomeReveal.goToFocusMe',
              )}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 pb-12 lg:px-10 lg:pb-16">
      <button
        type="button"
        onClick={() =>
          navigate('/focusme')
        }
        className="mb-5 flex items-center gap-2 text-sm text-accent-subtle transition hover:text-accent-white"
      >
        <ArrowLeft size={17} />

        {t(
          'focusHomeReveal.back',
        )}
      </button>

      <div className="card relative overflow-hidden p-7 text-center sm:p-10">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-accent-green/[0.08] blur-3xl" />

        <div className="relative">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.02] text-white/25">
            <FocusMeIcon size={82} />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-accent-green">
            FocushoMe
          </p>

          <h1 className="mt-3 text-3xl font-semibold text-accent-white">
            {t(
              'focusHomeReveal.title',
            )}
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-accent-subtle">
            {t(
              'focusHomeReveal.description',
            )}
          </p>

          {assessment.isError && (
            <p className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.05] p-4 text-sm text-red-300">
              {t(
                'focusHomeReveal.error',
              )}
            </p>
          )}

          <button
            type="button"
            onClick={() =>
              void reveal()
            }
            disabled={
              assessment.isPending
            }
            className="btn-primary mt-7 inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {assessment.isPending ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Sparkles size={17} />
            )}

            {assessment.isPending
              ? t(
                  'focusHomeReveal.analyzing',
                )
              : t(
                  'focusHomeReveal.action',
                )}
          </button>
        </div>
      </div>
    </div>
  )
}
