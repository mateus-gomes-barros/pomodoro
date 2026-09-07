import {
  BookHeart,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'

import {
  createFocusMeMonthlyNarrative,
} from '@/services/focusMeMonthlyNarrative'
import type {
  FocusMeMonthlyReport,
} from '@/services/focusMeMonthlyService'

interface FocusMeMonthlyNarrativeCardProps {
  report: FocusMeMonthlyReport
}

export function FocusMeMonthlyNarrativeCard({
  report,
}: FocusMeMonthlyNarrativeCardProps) {
  const {
    t,
    i18n,
  } = useTranslation()

  const locale =
    i18n.resolvedLanguage === 'pt-BR'
      ? 'pt-BR'
      : 'en-US'

  const narrative =
    createFocusMeMonthlyNarrative(
      report,
      locale,
    )

  return (
    <section className="card relative overflow-hidden p-5 sm:p-6">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-accent-green/[0.06] blur-3xl" />

      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green">
            <BookHeart size={18} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-green">
              {t(
                'focusMeReportPage.monthlyNarrativeTitle',
              )}
            </p>

            <p className="mt-1 text-xs text-accent-subtle">
              {t(
                'focusMeReportPage.monthlyNarrativeDescription',
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {narrative.paragraphs.map(
            (paragraph, index) => (
              <p
                key={`${index}-${paragraph}`}
                className="text-sm leading-7 text-accent-subtle"
              >
                {paragraph}
              </p>
            ),
          )}
        </div>
      </div>
    </section>
  )
}
