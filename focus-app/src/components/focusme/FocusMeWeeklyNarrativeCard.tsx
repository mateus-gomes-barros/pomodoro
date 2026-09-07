import {
  BookOpenText,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'

import {
  createFocusMeWeeklyNarrative,
} from '@/services/focusMeWeeklyNarrative'
import type {
  FocusMeWeeklyReport,
} from '@/services/focusMeService'

interface FocusMeWeeklyNarrativeCardProps {
  report: FocusMeWeeklyReport
}

export function FocusMeWeeklyNarrativeCard({
  report,
}: FocusMeWeeklyNarrativeCardProps) {
  const {
    t,
    i18n,
  } = useTranslation()

  const locale =
    i18n.resolvedLanguage === 'pt-BR'
      ? 'pt-BR'
      : 'en-US'

  const narrative =
    createFocusMeWeeklyNarrative(
      report,
      locale,
    )

  return (
    <section className="card relative overflow-hidden p-5 sm:p-6">
      <div className="absolute -left-20 -top-20 h-44 w-44 rounded-full bg-accent-green/[0.05] blur-3xl" />

      <div className="relative">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green">
            <BookOpenText size={18} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-green">
              {t(
                'focusMePage.weeklyReport.narrativeTitle',
              )}
            </p>

            <p className="mt-1 text-xs text-accent-subtle">
              {t(
                'focusMePage.weeklyReport.narrativeDescription',
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
