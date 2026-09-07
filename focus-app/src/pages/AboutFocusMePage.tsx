import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Home,
  Lock,
  Share2,
  Sparkles,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'
import {
  useNavigate,
} from 'react-router-dom'

import {
  FocusHomeSymbolGallery,
} from '@/components/focusme/FocusHomeSymbolGallery'
import {
  PageHeader,
} from '@/components/ui/PageHeader'

const previewCards = [
  {
    key: 'weekly',
    icon: CalendarDays,
  },
  {
    key: 'monthly',
    icon: BarChart3,
  },
  {
    key: 'focusHome',
    icon: Home,
  },
  {
    key: 'sharing',
    icon: Share2,
  },
]

const privacyItems = [
  'location',
  'apps',
  'device',
]

export function AboutFocusMePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-3xl px-6 pb-12 lg:px-10 lg:pb-16">
      <button
        type="button"
        onClick={() =>
          navigate('/settings')
        }
        className="mb-5 flex items-center gap-2 text-sm text-accent-subtle transition-colors hover:text-accent-white"
      >
        <ArrowLeft size={17} />

        {t('focusMePage.back')}
      </button>

      <PageHeader
        title="FocusMe"
        subtitle={t(
          'focusMePage.subtitle',
        )}
      />

      <div className="space-y-8">
        <motion.section
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="card relative overflow-hidden p-6 sm:p-8"
        >
          <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-accent-green/[0.07] blur-3xl" />

          <div className="relative">
            <span className="inline-flex rounded-full border border-accent-green/40 bg-accent-green/10 px-3 py-1 text-xs font-semibold text-accent-green">
              {t(
                'focusMePage.coming',
              )}
            </span>

            <div className="mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-green/10 text-accent-green">
              <Sparkles size={23} />
            </div>

            <h2 className="mt-5 max-w-xl text-2xl font-semibold leading-tight text-accent-white sm:text-3xl">
              {t(
                'focusMePage.hero.title',
              )}
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-accent-subtle">
              {t(
                'focusMePage.hero.description',
              )}
            </p>
          </div>
        </motion.section>

        <section>
          <div className="mb-4">
            <h2 className="font-semibold text-accent-white">
              {t(
                'focusMePage.experience.title',
              )}
            </h2>

            <p className="mt-1 text-sm text-accent-subtle">
              {t(
                'focusMePage.experience.subtitle',
              )}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {previewCards.map(
              ({
                key,
                icon: Icon,
              }, index) => (
                <motion.article
                  key={key}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.04,
                  }}
                  className="card p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.045] text-accent-green">
                    <Icon size={18} />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-accent-white">
                    {t(
                      `focusMePage.experience.items.${key}.title`,
                    )}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-accent-subtle">
                    {t(
                      `focusMePage.experience.items.${key}.description`,
                    )}
                  </p>
                </motion.article>
              ),
            )}
          </div>
        </section>

        <motion.section
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="card p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-green/10 text-accent-green">
              <Home size={20} />
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-green">
                FocushoMe
              </span>

              <h2 className="mt-2 text-lg font-semibold text-accent-white">
                {t(
                  'focusMePage.focusHome.title',
                )}
              </h2>

              <p className="mt-3 text-sm leading-7 text-accent-subtle">
                {t(
                  'focusMePage.focusHome.description',
                )}
              </p>

              <div className="mt-5 space-y-3">
                {[
                  'rare',
                  'complete',
                  'permanent',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5"
                  >
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-accent-green"
                    />

                    <span className="text-sm leading-relaxed text-accent-muted">
                      {t(
                        `focusMePage.focusHome.items.${item}`,
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="card p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.045] text-accent-white">
              <Lock size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-semibold text-accent-white">
                {t(
                  'focusMePage.privacy.title',
                )}
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-accent-subtle">
                {t(
                  'focusMePage.privacy.description',
                )}
              </p>

              <div className="mt-4 space-y-2.5">
                {privacyItems.map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2.5"
                    >
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-accent-green"
                      />

                      <span className="text-sm text-accent-muted">
                        {t(
                          `focusMePage.privacy.items.${item}`,
                        )}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <FocusHomeSymbolGallery />

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-2xl border border-accent-green/20 bg-accent-green/[0.04] p-5 text-center"
        >
          <Clock3
            size={20}
            className="mx-auto text-accent-green"
          />

          <h2 className="mt-3 text-sm font-semibold text-accent-white">
            {t(
              'focusMePage.development.title',
            )}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-accent-subtle">
            {t(
              'focusMePage.development.description',
            )}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
