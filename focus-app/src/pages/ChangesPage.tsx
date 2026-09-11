import { motion } from 'framer-motion'
import {
  Archive,
  ArrowLeft,
  BellRing,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  Home,
  Languages,
  ListTodo,
  Rocket,
  Share2,
  Sparkles,
  TimerReset,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { PageHeader } from '../components/ui/PageHeader'

const recentChanges = [
  {
    key: 'weeklyRecaps',
    icon: CalendarDays,
  },
  {
    key: 'monthlyRecaps',
    icon: Sparkles,
  },
  {
    key: 'focusHome',
    icon: Home,
  },
  {
    key: 'focusMeHistory',
    icon: Archive,
  },
  {
    key: 'sharing',
    icon: Share2,
  },
  {
    key: 'taskCategories',
    icon: ListTodo,
  },
  {
    key: 'taskTrash',
    icon: Trash2,
  },
  {
    key: 'projectLifecycle',
    icon: CheckCircle2,
  },
]

const roadmapItems = [
  {
    key: 'notifications',
    icon: BellRing,
    status: 'planned',
  },
]

const versions = [
  {
    version: '4.0',
    key: 'v4',
    icon: Sparkles,
    current: true,
    items: [
      'taskEditing',
      'taskCategories',
      'taskTrash',
      'projectLifecycle',
      'weeklyRecaps',
      'monthlyRecaps',
      'focusHome',
      'focusMeHistory',
      'sharing',
    ],
  },
  {
    version: '3.0',
    key: 'v3',
    icon: Languages,
    current: false,
    items: [
      'languages',
      'androidWidgets',
      'autoStart',
      'widgetImprovements',
    ],
  },
  {
    version: '2.0',
    key: 'v2',
    icon: BellRing,
    current: false,
    items: [
      'android',
      'liveNotifications',
      'appleExperience',
      'tabletSupport',
    ],
  },
  {
    version: '1.0',
    key: 'v1',
    icon: Rocket,
    current: false,
    items: [
      'pomodoro',
      'organization',
      'progress',
      'accounts',
    ],
  },
]

export function ChangesPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-3xl px-6 pb-10 lg:px-10 lg:pb-14">
      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="mb-5 flex items-center gap-2 text-sm text-accent-subtle transition-colors hover:text-accent-white"
      >
        <ArrowLeft size={17} />

        {t('changesPage.back')}
      </button>

      <PageHeader
        title={t('changesPage.title')}
        subtitle={t('changesPage.subtitle')}
      />

      <div className="space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full border border-accent-green/30 bg-accent-green/10 px-3 py-1 text-xs font-semibold text-accent-green">
                {t('changesPage.currentVersion')}
              </span>

              <h2 className="mt-4 text-xl font-semibold text-accent-white">
                Focus 4.0
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-accent-subtle">
                {t('changesPage.currentDescription')}
              </p>
            </div>

            <div className="rounded-2xl bg-accent-green/10 p-3 text-accent-green">
              <Sparkles size={22} />
            </div>
          </div>
        </motion.section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-accent-green/10 p-2 text-accent-green">
              <Sparkles size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-accent-white">
                {t('changesPage.recent.title')}
              </h2>

              <p className="text-xs text-accent-subtle">
                {t('changesPage.recent.subtitle')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {recentChanges.map(
              ({ key, icon: Icon }, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  className="card flex items-start gap-4 p-5"
                >
                  <div className="rounded-xl bg-white/[0.045] p-2.5 text-accent-green">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-accent-white">
                        {t(
                          `changesPage.recent.items.${key}.title`,
                        )}
                      </h3>

                      <span className="rounded-full border border-accent-green/40 bg-accent-green/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-green">
                        {t('changesPage.new')}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-relaxed text-accent-subtle">
                      {t(
                        `changesPage.recent.items.${key}.description`,
                      )}
                    </p>
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-white/[0.045] p-2 text-accent-white">
              <History size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-accent-white">
                {t('changesPage.history.title')}
              </h2>

              <p className="text-xs text-accent-subtle">
                {t('changesPage.history.subtitle')}
              </p>
            </div>
          </div>

          <div className="relative space-y-4 before:absolute before:bottom-7 before:left-[27px] before:top-7 before:w-px before:bg-white/10">
            {versions.map(
              (
                {
                  version,
                  key,
                  icon: Icon,
                  current,
                  items,
                },
                index,
              ) => (
                <motion.article
                  key={version}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="card relative p-5"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`relative z-10 rounded-xl p-2.5 ${
                        current
                          ? 'bg-accent-green text-black'
                          : 'glass-control text-accent-subtle'
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-accent-white">
                          Focus {version}
                        </h3>

                        {current && (
                          <span className="rounded-full border border-accent-green/30 bg-accent-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-green">
                            {t(
                              'changesPage.history.current',
                            )}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm leading-relaxed text-accent-subtle">
                        {t(
                          `changesPage.history.versions.${key}.description`,
                        )}
                      </p>

                      <div className="mt-4 space-y-2.5">
                        {items.map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-2.5"
                          >
                            <CheckCircle2
                              size={15}
                              className="mt-0.5 shrink-0 text-accent-green"
                            />

                            <span className="text-sm leading-relaxed text-accent-muted">
                              {t(
                                `changesPage.history.versions.${key}.items.${item}`,
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ),
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-300">
              <Clock3 size={18} />
            </div>

            <div>
              <h2 className="font-semibold text-accent-white">
                {t('changesPage.roadmap.title')}
              </h2>

              <p className="text-xs text-accent-subtle">
                {t('changesPage.roadmap.subtitle')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {roadmapItems.map(
              (
                {
                  key,
                  icon: Icon,
                  status,
                },
                index,
              ) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  className="card flex items-start gap-4 p-5"
                >
                  <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-300">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-accent-white">
                        {t(
                          `changesPage.roadmap.items.${key}.title`,
                        )}
                      </h3>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          status ===
                          'development'
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-blue-500/10 text-blue-300'
                        }`}
                      >
                        {t(
                          `changesPage.roadmap.status.${status}`,
                        )}
                      </span>
                    </div>

                    <p className="mt-1 text-sm leading-relaxed text-accent-subtle">
                      {t(
                        `changesPage.roadmap.items.${key}.description`,
                      )}
                    </p>
                  </div>

                </motion.div>
              ),
            )}
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <TimerReset
              size={17}
              className="mt-0.5 shrink-0 text-accent-subtle"
            />

            <p className="text-xs leading-relaxed text-accent-subtle">
              {t('changesPage.roadmap.disclaimer')}
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
