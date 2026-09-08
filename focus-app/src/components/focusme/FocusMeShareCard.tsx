import {
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Capacitor,
} from '@capacitor/core'
import {
  Directory,
  Filesystem,
} from '@capacitor/filesystem'
import {
  Share,
} from '@capacitor/share'
import {
  Check,
  Download,
  LoaderCircle,
  Share2,
  X,
} from 'lucide-react'
import {
  toPng,
} from 'html-to-image'
import {
  useTranslation,
} from 'react-i18next'
import {
  format,
  subDays,
} from 'date-fns'

import {
  FocusHomeSymbol,
  type FocusHomeKey,
} from '@/components/focusme/FocusHomeSymbol'
import {
  FocusMeIcon,
} from '@/components/icons/FocusMeIcon'
import {
  useFocusHomeAssessments,
  useFocusHomeProfile,
} from '@/hooks/focusme/useFocusHomeProfile'
import {
  usePomodoroSessions,
} from '@/hooks/pomodoro/usePomodoroSessions'
import {
  getStreakBadge,
} from '@/lib/streakBadges'
import type {
  FocusMeMonthlyReport,
} from '@/services/focusMeMonthlyService'
import type {
  FocusMeStoredReport,
} from '@/services/focusMeReportsService'
import type {
  FocusMeWeeklyReport,
} from '@/services/focusMeService'

interface FocusMeShareCardProps {
  report: FocusMeStoredReport
}

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

function calculateCurrentStreak(
  activeDates: string[],
): number {
  const uniqueDates =
    new Set(activeDates)

  const today =
    new Date()

  const todayString =
    format(
      today,
      'yyyy-MM-dd',
    )

  const yesterday =
    subDays(today, 1)

  const yesterdayString =
    format(
      yesterday,
      'yyyy-MM-dd',
    )

  let currentDate: Date | null =
    uniqueDates.has(todayString)
      ? today
      : uniqueDates.has(
            yesterdayString,
          )
        ? yesterday
        : null

  let currentStreak = 0

  while (currentDate) {
    const dateString =
      format(
        currentDate,
        'yyyy-MM-dd',
      )

    if (
      !uniqueDates.has(dateString)
    ) {
      break
    }

    currentStreak += 1

    currentDate =
      subDays(currentDate, 1)
  }

  return currentStreak
}

function formatMinutes(
  minutes: number,
): string {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours =
    Math.floor(minutes / 60)

  const remainder =
    minutes % 60

  return remainder > 0
    ? `${hours}h ${remainder}min`
    : `${hours}h`
}

function sanitizeFilename(
  value: string,
): string {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .replace(
      /[^a-zA-Z0-9-]+/g,
      '-',
    )
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export function FocusMeShareCard({
  report,
}: FocusMeShareCardProps) {
  const {
    t,
    i18n,
  } = useTranslation()

  const cardRef =
    useRef<HTMLDivElement>(null)

  const [
    state,
    setState,
  ] = useState<
    'idle' |
    'generating' |
    'sharing' |
    'saving' |
    'saved' |
    'error'
  >('idle')

  const [
    previewDataUrl,
    setPreviewDataUrl,
  ] = useState<string | null>(
    null,
  )

  const [
    previewFilename,
    setPreviewFilename,
  ] = useState('')

  const sessionsQuery =
    usePomodoroSessions()

  const currentStreak =
    useMemo(
      () =>
        calculateCurrentStreak(
          (
            sessionsQuery.data ??
            []
          )
            .filter(
              (session) =>
                session.type ===
                'work',
            )
            .map(
              (session) =>
                session.date,
            ),
        ),
      [sessionsQuery.data],
    )

  const currentBadge =
    getStreakBadge(
      currentStreak,
    )

  const assessmentsQuery =
    useFocusHomeAssessments()

  const profileQuery =
    useFocusHomeProfile()

  const assessment =
    assessmentsQuery.data?.find(
      (item) =>
        item.reportId === report.id,
    )

  const weekly =
    report.type === 'weekly'
      ? report.metrics as
          FocusMeWeeklyReport
      : null

  const monthly =
    report.type === 'monthly'
      ? report.metrics as
          FocusMeMonthlyReport
      : null

  const focusMinutes =
    weekly?.focus.totalMinutes ??
    monthly?.current.focusMinutes ??
    0

  const sessions =
    weekly?.focus.completedSessions ??
    monthly?.current
      .completedSessions ??
    0

  const activeDays =
    weekly?.focus.activeDays ??
    monthly?.current.activeDays ??
    0

  const tasksCompleted =
    weekly?.tasks.completed ??
    monthly?.current.tasks.completed ??
    0

  const storedFocusHome =
    isFocusHomeKey(
      report.focusHomeKey,
    )
      ? report.focusHomeKey
      : undefined

  const focusHome =
    assessment?.focusHome ??
    storedFocusHome ??
    profileQuery.data?.focusHome

  const focusHomeArchetype =
    assessment?.archetype ??
    profileQuery.data?.archetype

  const focusHomeTemporalExpression =
    assessment?.temporalExpression ??
    profileQuery.data
      ?.temporalExpression

  const focusHomeIsHistorical =
    Boolean(
      assessment &&
      profileQuery.data &&
      assessment.id !==
        profileQuery.data
          .currentAssessmentId,
    )

  const focusHomeIsLoading =
    assessmentsQuery.isLoading ||
    profileQuery.isLoading

  const locale =
    i18n.resolvedLanguage === 'pt-BR'
      ? 'pt-BR'
      : 'en-US'

  function formatPeriod(): string {
    const start =
      new Date(
        `${report.periodStart}T12:00:00`,
      )

    const end =
      new Date(
        `${report.periodEnd}T12:00:00`,
      )

    end.setDate(
      end.getDate() - 1,
    )

    if (report.type === 'monthly') {
      return new Intl.DateTimeFormat(
        locale,
        {
          month: 'long',
          year: 'numeric',
        },
      ).format(start)
    }

    const formatter =
      new Intl.DateTimeFormat(
        locale,
        {
          day: '2-digit',
          month: 'short',
        },
      )

    return (
      `${formatter.format(start)} – ` +
      formatter.format(end)
    )
  }

  function downloadOnWeb(
    dataUrl: string,
    filename: string,
  ) {
    const link =
      document.createElement('a')

    link.href = dataUrl
    link.download = filename

    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  async function createShareFile(
    dataUrl: string,
    filename: string,
  ): Promise<File> {
    const response =
      await fetch(dataUrl)

    const blob =
      await response.blob()

    return new File(
      [blob],
      filename,
      {
        type: 'image/png',
      },
    )
  }

  async function handlePreview() {
    if (
      !cardRef.current ||
      state === 'generating'
    ) {
      return
    }

    setState('generating')

    try {
      if ('fonts' in document) {
        await document.fonts.ready
      }

      const dataUrl =
        await toPng(
          cardRef.current,
          {
            width: 540,
            height: 960,
            pixelRatio: 2,
            cacheBust: true,
            backgroundColor:
              '#080a09',
          },
        )

      const filename =
        `focusme-${sanitizeFilename(
          formatPeriod(),
        )}.png`

      setPreviewDataUrl(dataUrl)
      setPreviewFilename(filename)
      setState('idle')
    } catch (error) {
      console.error(
        'Unable to generate FocusMe recap:',
        error,
      )

      setState('error')
    }
  }

  async function handleNativeShare() {
    if (
      !previewDataUrl ||
      !previewFilename
    ) {
      return
    }

    setState('sharing')

    try {
      if (
        Capacitor.isNativePlatform()
      ) {
        const base64 =
          previewDataUrl.split(',')[1]

        if (!base64) {
          throw new Error(
            'Invalid generated image.',
          )
        }

        const saved =
          await Filesystem.writeFile({
            path: previewFilename,
            data: base64,
            directory:
              Directory.Cache,
          })

        await Share.share({
          title: 'FocusMe',
          text: t(
            'focusMeReportPage.share.shareText',
          ),
          files: [saved.uri],
          dialogTitle: t(
            'focusMeReportPage.share.dialogTitle',
          ),
        })
      } else {
        const file =
          await createShareFile(
            previewDataUrl,
            previewFilename,
          )

        if (
          navigator.share &&
          (
            !navigator.canShare ||
            navigator.canShare({
              files: [file],
            })
          )
        ) {
          await navigator.share({
            title: 'FocusMe',
            text: t(
              'focusMeReportPage.share.shareText',
            ),
            files: [file],
          })
        } else {
          downloadOnWeb(
            previewDataUrl,
            previewFilename,
          )
        }
      }

      setState('idle')
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        setState('idle')
        return
      }

      console.error(
        'Unable to share FocusMe recap:',
        error,
      )

      setState('error')
    }
  }

  async function handleSave() {
    if (
      !previewDataUrl ||
      !previewFilename
    ) {
      return
    }

    setState('saving')

    try {
      if (
        Capacitor.isNativePlatform()
      ) {
        const base64 =
          previewDataUrl.split(',')[1]

        if (!base64) {
          throw new Error(
            'Invalid generated image.',
          )
        }

        await Filesystem.writeFile({
          path:
            `FocusMe/${previewFilename}`,
          data: base64,
          directory:
            Directory.Documents,
          recursive: true,
        })
      } else {
        downloadOnWeb(
          previewDataUrl,
          previewFilename,
        )
      }

      setState('saved')

      window.setTimeout(
        () => setState('idle'),
        2200,
      )
    } catch (error) {
      console.error(
        'Unable to save FocusMe recap:',
        error,
      )

      setState('error')
    }
  }

  function handleClosePreview() {
    if (
      state === 'sharing' ||
      state === 'saving'
    ) {
      return
    }

    setPreviewDataUrl(null)
    setPreviewFilename('')
    setState('idle')
  }

  const period =
    formatPeriod()

  return (
    <>
      <div className="mb-4 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handlePreview}
          disabled={
            state === 'generating' ||
            focusHomeIsLoading ||
            sessionsQuery.isLoading
          }
          className="btn-primary flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === 'generating' ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : (
            <Share2 size={16} />
          )}

          {t(
            state === 'generating'
              ? 'focusMeReportPage.share.generating'
              : 'focusMeReportPage.share.button',
          )}
        </button>

        {state === 'error' && (
          <p className="text-xs text-red-300">
            {t(
              'focusMeReportPage.share.error',
            )}
          </p>
        )}
      </div>

      {previewDataUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t(
            'focusMeReportPage.share.previewTitle',
          )}
          className="fixed inset-0 z-[100] flex flex-col bg-[#050706]/95 backdrop-blur-xl"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-5 py-4 pt-[calc(1rem+env(safe-area-inset-top))]">
            <div>
              <p className="text-sm font-semibold text-accent-white">
                {t(
                  'focusMeReportPage.share.previewTitle',
                )}
              </p>

              <p className="mt-1 text-xs text-accent-subtle">
                {t(
                  'focusMeReportPage.share.previewDescription',
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleClosePreview}
              disabled={
                state === 'sharing' ||
                state === 'saving'
              }
              aria-label={t(
                'focusMeReportPage.share.close',
              )}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-accent-subtle transition hover:text-accent-white disabled:opacity-40"
            >
              <X size={20} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-auto p-5">
            <div className="mx-auto flex min-h-full max-w-md items-center justify-center">
              <img
                src={previewDataUrl}
                alt={t(
                  'focusMeReportPage.share.previewAlt',
                )}
                className="block max-h-[calc(100dvh-220px)] w-auto max-w-full rounded-2xl border border-white/[0.08] object-contain shadow-2xl shadow-black/50"
              />
            </div>
          </div>

          <footer className="shrink-0 border-t border-white/[0.07] bg-[#080a09]/95 px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  state === 'saving' ||
                  state === 'sharing'
                }
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 text-sm font-semibold text-accent-white transition hover:bg-white/[0.08] disabled:opacity-50"
              >
                {state === 'saving' ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : state === 'saved' ? (
                  <Check size={17} />
                ) : (
                  <Download size={17} />
                )}

                {t(
                  state === 'saving'
                    ? 'focusMeReportPage.share.saving'
                    : state === 'saved'
                      ? 'focusMeReportPage.share.saved'
                      : 'focusMeReportPage.share.save',
                )}
              </button>

              <button
                type="button"
                onClick={handleNativeShare}
                disabled={
                  state === 'sharing' ||
                  state === 'saving'
                }
                className="btn-primary flex min-h-12 items-center justify-center gap-2 disabled:opacity-50"
              >
                {state === 'sharing' ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Share2 size={17} />
                )}

                {t(
                  state === 'sharing'
                    ? 'focusMeReportPage.share.sharing'
                    : 'focusMeReportPage.share.shareAction',
                )}
              </button>
            </div>

            {state === 'saved' && (
              <p className="mx-auto mt-3 max-w-md text-center text-xs text-emerald-300">
                {t(
                  'focusMeReportPage.share.savedLocation',
                )}
              </p>
            )}

            {state === 'error' && (
              <p className="mx-auto mt-3 max-w-md text-center text-xs text-red-300">
                {t(
                  'focusMeReportPage.share.error',
                )}
              </p>
            )}
          </footer>
        </div>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-[10000px] top-0"
      >
        <div
          ref={cardRef}
          style={{
            width: 540,
            height: 960,
            background:
              'radial-gradient(circle at 82% 9%, rgba(16,185,129,0.20), transparent 30%), radial-gradient(circle at 12% 90%, rgba(16,185,129,0.10), transparent 28%), #080a09',
          }}
          className="relative flex overflow-hidden p-12 text-white"
        >
          <div className="absolute left-8 top-8 h-40 w-40 rounded-full border border-emerald-400/[0.07]" />
          <div className="absolute left-14 top-14 h-28 w-28 rounded-full border border-emerald-400/[0.05]" />
          <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full border border-emerald-400/[0.08]" />

          <div className="relative flex w-full flex-col">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FocusMeIcon
                  size={30}
                  className="text-emerald-400"
                />

                <span className="text-xl font-bold tracking-tight">
                  FocusMe
                </span>
              </div>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                {t(
                  `focusMeReportPage.share.types.${report.type}`,
                )}
              </span>
            </header>

            <div className="mt-14">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
                {t(
                  'focusMeReportPage.share.eyebrow',
                )}
              </p>

              <h1 className="mt-4 max-w-[420px] text-5xl font-bold capitalize leading-[1.05] tracking-[-0.04em] text-white">
                {period}
              </h1>
            </div>

            {focusHome ? (
              <div
                className="mt-10 flex items-center gap-7 rounded-[32px] border p-7"
                style={{
                  borderColor:
                    'rgba(52, 211, 153, 0.22)',
                  background:
                    'rgba(255, 255, 255, 0.045)',
                }}
              >
                <div
                  className="flex h-[158px] w-[158px] shrink-0 items-center justify-center rounded-[28px]"
                  style={{
                    background:
                      'rgba(255, 255, 255, 0.035)',
                    border:
                      '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <FocusHomeSymbol
                    type={focusHome}
                    size={132}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
                    {t(
                      'focusMeReportPage.share.yourFocusHome',
                    )}
                  </p>

                  <p className="mt-2 text-[34px] font-bold capitalize leading-none text-white">
                    {focusHome}
                  </p>

                  {focusHomeArchetype && (
                    <p className="mt-4 text-sm font-medium leading-relaxed text-white/65">
                      {t(
                        `focusHomeIdentity.archetypes.${focusHomeArchetype}`,
                      )}
                    </p>
                  )}

                  {focusHomeTemporalExpression && (
                    <p className="mt-1 text-xs leading-relaxed text-white/45">
                      {t(
                        `focusHomeIdentity.temporal.${focusHomeTemporalExpression}`,
                      )}
                    </p>
                  )}

                  <span className="mt-4 inline-flex rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                    {t(
                      focusHomeIsHistorical
                        ? 'focusMeReportPage.share.periodIdentity'
                        : 'focusMeReportPage.share.currentIdentity',
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-10 rounded-[32px] border border-emerald-400/15 bg-white/[0.035] p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  FocusMe
                </p>

                <p className="mt-3 text-2xl font-semibold leading-snug text-white">
                  {t(
                    'focusMeReportPage.share.focusStory',
                  )}
                </p>
              </div>
            )}

            <div
              className="mt-4 flex items-center gap-4 rounded-[24px] px-5 py-4"
              style={{
                background:
                  'rgba(255, 255, 255, 0.035)',
                border:
                  '1px solid rgba(255, 255, 255, 0.075)',
              }}
            >
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[34px]"
                style={{
                  background:
                    'rgba(52, 211, 153, 0.09)',
                  border:
                    '1px solid rgba(52, 211, 153, 0.16)',
                }}
              >
                {currentBadge.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold uppercase tracking-[0.17em] text-emerald-400">
                  {t(
                    'focusMeReportPage.share.currentBadge',
                  )}
                </p>

                <p className="mt-1 text-xl font-bold text-white">
                  {t(
                    `streaksPage.badges.${currentBadge.minimumDays}.name`,
                    {
                      defaultValue:
                        currentBadge.name,
                    },
                  )}
                </p>

                <p className="mt-1 text-[11px] leading-relaxed text-white/45">
                  {t(
                    'focusMeReportPage.share.badgeStreak',
                    {
                      count:
                        currentStreak,
                    },
                  )}
                </p>
              </div>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-4">
              {[
                {
                  label: t(
                    'focusMeReportPage.focusTime',
                  ),
                  value:
                    formatMinutes(
                      focusMinutes,
                    ),
                },
                {
                  label: t(
                    'focusMeReportPage.sessions',
                  ),
                  value: sessions,
                },
                {
                  label: t(
                    'focusMeReportPage.activeDays',
                  ),
                  value: activeDays,
                },
                {
                  label: t(
                    'focusMeReportPage.tasksCompleted',
                  ),
                  value:
                    tasksCompleted,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6"
                >
                  <p className="text-3xl font-semibold text-white">
                    {item.value}
                  </p>

                  <p className="mt-2 text-xs text-white/45">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <footer className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-white/30">
              <span>
                {t(
                  'focusMeReportPage.share.footer',
                )}
              </span>

              <span>
                Focus 4.0
              </span>
            </footer>
          </div>
        </div>
      </div>
    </>
  )
}
