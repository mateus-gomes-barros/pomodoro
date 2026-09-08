import {
  ArrowRight,
  LoaderCircle,
  Sparkles,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'
import {
  useNavigate,
} from 'react-router-dom'

import {
  FocusHomeSymbol,
} from '@/components/focusme/FocusHomeSymbol'
import {
  useFocusHomeAssessments,
  useFocusHomeProfile,
} from '@/hooks/focusme/useFocusHomeProfile'

export function FocusHomeJourney() {
  const {
    t,
    i18n,
  } = useTranslation()

  const navigate = useNavigate()

  const profileQuery =
    useFocusHomeProfile()

  const assessmentsQuery =
    useFocusHomeAssessments()

  const assessments =
    assessmentsQuery.data ?? []

  const locale =
    i18n.resolvedLanguage === 'pt-BR'
      ? 'pt-BR'
      : 'en-US'

  function formatMonth(
    periodStart?: string,
  ): string {
    if (!periodStart) {
      return ''
    }

    return new Intl.DateTimeFormat(
      locale,
      {
        month: 'long',
        year: 'numeric',
      },
    ).format(
      new Date(
        `${periodStart}T12:00:00`,
      ),
    )
  }

  if (
    profileQuery.isLoading ||
    assessmentsQuery.isLoading
  ) {
    return (
      <div className="card mb-5 flex items-center justify-center py-10">
        <LoaderCircle
          size={24}
          className="animate-spin text-accent-green"
        />
      </div>
    )
  }

  if (
    assessmentsQuery.isError ||
    profileQuery.isError ||
    assessments.length === 0
  ) {
    return null
  }

  const currentAssessmentId =
    profileQuery.data
      ?.currentAssessmentId

  return (
    <section className="card mb-5 overflow-hidden p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green">
          <Sparkles size={18} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-accent-white">
            {t(
              'focusMeHistoryPage.journey.title',
            )}
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-accent-subtle">
            {t(
              'focusMeHistoryPage.journey.description',
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {assessments.map(
          (
            assessment,
            index,
          ) => {
            const isCurrent =
              assessment.id ===
              currentAssessmentId

            const previous =
              assessments[index + 1]

            const changed =
              previous &&
              previous.focusHome !==
                assessment.focusHome

            return (
              <button
                key={assessment.id}
                type="button"
                onClick={() =>
                  navigate(
                    `/focusme/reports/${assessment.reportId}`,
                  )
                }
                className="group flex w-full items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left transition hover:border-accent-green/25 hover:bg-accent-green/[0.025]"
              >
                <div className="shrink-0">
                  <FocusHomeSymbol
                    type={
                      assessment.focusHome
                    }
                    size={60}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm font-semibold capitalize text-accent-white">
                      {
                        assessment.focusHome
                      }
                    </strong>

                    {isCurrent && (
                      <span className="rounded-full border border-accent-green/25 bg-accent-green/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-accent-green">
                        {t(
                          'focusMeHistoryPage.journey.current',
                        )}
                      </span>
                    )}

                    <span className="rounded-full border border-white/[0.06] px-2 py-0.5 text-[9px] font-medium text-accent-subtle">
                      {t(
                        `focusMeHistoryPage.journey.assessmentTypes.${assessment.assessmentType}`,
                      )}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-accent-subtle">
                    {t(
                      `focusHomeIdentity.archetypes.${assessment.archetype}`,
                    )}
                    {' · '}
                    {t(
                      `focusHomeIdentity.temporal.${assessment.temporalExpression}`,
                    )}
                  </p>

                  {assessment.periodStart && (
                    <p className="mt-1 text-[10px] capitalize text-white/35">
                      {formatMonth(
                        assessment.periodStart,
                      )}
                    </p>
                  )}

                  {previous && (
                    <p
                      className={
                        changed
                          ? 'mt-2 text-[10px] text-accent-green'
                          : 'mt-2 text-[10px] text-accent-subtle'
                      }
                    >
                      {t(
                        changed
                          ? 'focusMeHistoryPage.journey.changed'
                          : 'focusMeHistoryPage.journey.remained',
                        changed
                          ? {
                              previous:
                                previous.focusHome,
                              current:
                                assessment.focusHome,
                            }
                          : {
                              name:
                                assessment.focusHome,
                            },
                      )}
                    </p>
                  )}
                </div>

                <ArrowRight
                  size={17}
                  className="shrink-0 text-accent-subtle transition group-hover:translate-x-0.5 group-hover:text-accent-green"
                />
              </button>
            )
          },
        )}
      </div>
    </section>
  )
}
