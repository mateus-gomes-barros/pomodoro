import {
  History,
  LoaderCircle,
  Sparkles,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'

import {
  FocusHomeSymbol,
  type FocusHomeKey,
} from '@/components/focusme/FocusHomeSymbol'
import {
  useFocusHomeAssessments,
  useFocusHomeProfile,
} from '@/hooks/focusme/useFocusHomeProfile'
import type {
  FocusHomeTrait,
} from '@/services/focusHomeClassifier'

const FOCUS_HOME_KEYS:
  FocusHomeKey[] = [
    'aster',
    'atlas',
    'forge',
    'pulse',
    'loom',
    'orbit',
    'tide',
    'ember',
    'nova',
    'prism',
    'vanguard',
    'verdant',
  ]

function isFocusHomeKey(
  value?: string,
): value is FocusHomeKey {
  return Boolean(
    value &&
      FOCUS_HOME_KEYS.includes(
        value as FocusHomeKey,
      ),
  )
}

interface FocusHomeReportIdentityProps {
  reportId: string
  storedFocusHomeKey?: string
  storedTraits?: string[]
}

export function FocusHomeReportIdentity({
  reportId,
  storedFocusHomeKey,
  storedTraits = [],
}: FocusHomeReportIdentityProps) {
  const { t } = useTranslation()

  const profileQuery =
    useFocusHomeProfile()

  const assessmentsQuery =
    useFocusHomeAssessments()

  if (
    profileQuery.isLoading ||
    assessmentsQuery.isLoading
  ) {
    return (
      <section className="card flex items-center justify-center py-10">
        <LoaderCircle
          size={24}
          className="animate-spin text-accent-green"
        />
      </section>
    )
  }

  const assessment =
    assessmentsQuery.data?.find(
      (item) =>
        item.reportId === reportId,
    )

  const focusHome =
    assessment?.focusHome ??
    (
      isFocusHomeKey(
        storedFocusHomeKey,
      )
        ? storedFocusHomeKey
        : undefined
    )

  if (!focusHome) {
    return null
  }

  const traits =
    assessment?.traits ??
    storedTraits as FocusHomeTrait[]

  const isCurrent =
    assessment?.id ===
    profileQuery.data
      ?.currentAssessmentId

  return (
    <section className="card relative overflow-hidden p-5 sm:p-7">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent-green/[0.07] blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex shrink-0 justify-center sm:justify-start">
          <FocusHomeSymbol
            type={focusHome}
            size={138}
          />
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-green">
              {t(
                'focusMeReportPage.focusHome.eyebrow',
              )}
            </p>

            <span
              className={
                isCurrent
                  ? 'rounded-full border border-accent-green/25 bg-accent-green/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-accent-green'
                  : 'rounded-full border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 text-[9px] font-medium text-accent-subtle'
              }
            >
              {t(
                isCurrent
                  ? 'focusMeReportPage.focusHome.current'
                  : 'focusMeReportPage.focusHome.historical',
              )}
            </span>
          </div>

          <h2 className="mt-3 text-3xl font-bold capitalize tracking-tight text-accent-white">
            {focusHome}
          </h2>

          {assessment && (
            <p className="mt-2 text-sm text-accent-subtle">
              {t(
                `focusHomeIdentity.archetypes.${assessment.archetype}`,
              )}
              {' · '}
              {t(
                `focusHomeIdentity.temporal.${assessment.temporalExpression}`,
              )}
            </p>
          )}

          <div className="mt-4 flex items-start justify-center gap-2 text-xs leading-relaxed text-accent-subtle sm:justify-start">
            {isCurrent ? (
              <Sparkles
                size={15}
                className="mt-0.5 shrink-0 text-accent-green"
              />
            ) : (
              <History
                size={15}
                className="mt-0.5 shrink-0 text-accent-green"
              />
            )}

            <p>
              {t(
                isCurrent
                  ? 'focusMeReportPage.focusHome.currentDescription'
                  : 'focusMeReportPage.focusHome.historicalDescription',
              )}
            </p>
          </div>

          {traits.length > 0 && (
            <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
              {traits.map(
                (trait) => (
                  <span
                    key={trait}
                    className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[10px] font-medium text-accent-subtle"
                  >
                    {t(
                      `focusMePage.monthlyReport.traits.${trait}`,
                      {
                        defaultValue:
                          trait
                            .replaceAll(
                              '_',
                              ' ',
                            ),
                      },
                    )}
                  </span>
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
