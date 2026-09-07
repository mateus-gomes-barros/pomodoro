import { motion } from 'framer-motion'
import {
  ArrowLeft,
  CalendarDays,
  History,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'
import {
  useNavigate,
} from 'react-router-dom'

import {
  PageHeader,
} from '@/components/ui/PageHeader'

export function FocusMeHistoryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-5xl px-6 pb-12 lg:px-10 lg:pb-16">
      <button
        type="button"
        onClick={() =>
          navigate('/focusme')
        }
        className="mb-5 flex items-center gap-2 text-sm text-accent-subtle transition-colors hover:text-accent-white"
      >
        <ArrowLeft size={17} />

        {t(
          'focusMeHistoryPage.back',
        )}
      </button>

      <PageHeader
        title={t(
          'focusMeHistoryPage.title',
        )}
        subtitle={t(
          'focusMeHistoryPage.subtitle',
        )}
      />

      <div
        className="card mb-5 grid grid-cols-3 gap-1 p-1"
        role="group"
      >
        {[
          'all',
          'weekly',
          'monthly',
        ].map((filter, index) => (
          <button
            key={filter}
            type="button"
            className={
              index === 0
                ? 'rounded-xl bg-white/[0.08] px-3 py-2.5 text-xs font-medium text-accent-white'
                : 'rounded-xl px-3 py-2.5 text-xs font-medium text-accent-subtle'
            }
          >
            {t(
              `focusMeHistoryPage.filters.${filter}`,
            )}
          </button>
        ))}
      </div>

      <motion.div
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="card flex flex-col items-center px-6 py-14 text-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
          <History size={24} />
        </div>

        <h2 className="mt-5 text-base font-semibold text-accent-white">
          {t(
            'focusMeHistoryPage.empty.title',
          )}
        </h2>

        <p className="mt-2 max-w-md text-sm leading-relaxed text-accent-subtle">
          {t(
            'focusMeHistoryPage.empty.description',
          )}
        </p>

        <div className="mt-5 inline-flex items-center gap-2 text-xs text-accent-green">
          <CalendarDays size={15} />

          {t(
            'focusMeHistoryPage.empty.schedule',
          )}
        </div>
      </motion.div>
    </div>
  )
}
