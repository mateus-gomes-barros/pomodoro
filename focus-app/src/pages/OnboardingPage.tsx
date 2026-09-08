import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  App as CapacitorApp,
} from '@capacitor/app'
import {
  Capacitor,
} from '@capacitor/core'
import {
  AnimatePresence,
  motion,
} from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ExternalLink,
  LoaderCircle,
} from 'lucide-react'
import {
  useTranslation,
} from 'react-i18next'
import {
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  getOnboardingStorageKey,
} from '@/components/onboarding/OnboardingGate'
import {
  OnboardingVisual,
  type OnboardingVisualType,
} from '@/components/onboarding/OnboardingVisual'
import {
  useAuth,
} from '@/contexts/AuthContext'
import {
  getTimerNotificationSetup,
  openTimerLiveNotificationSettings,
  openTimerNotificationSettings,
  requestTimerNotificationPermission,
  type TimerNotificationSetup,
} from '@/services/timerNotificationService'

interface Slide {
  visual: OnboardingVisualType
  title: string
  description: string
}

const copy = {
  'pt-BR': {
    slides: [
      {
        visual: 'welcome',
        title: 'Seu foco começa aqui',
        description:
          'Organize seus dias, acompanhe seu progresso e transforme cada sessão em parte de uma jornada maior.',
      },
      {
        visual: 'planning',
        title: 'Transforme ideias em progresso',
        description:
          'Conecte projetos, metas e tarefas ao seu tempo de foco e mantenha tudo o que importa em movimento.',
      },
      {
        visual: 'analytics',
        title: 'Entenda o seu ritmo',
        description:
          'Visualize seu tempo de foco, dias ativos, sessões concluídas e os projetos que fazem parte da sua rotina.',
      },
      {
        visual: 'focusme',
        title: 'Sua história contada pelo foco',
        description:
          'Receba retrospectivas semanais e mensais construídas a partir das suas ações e da sua evolução.',
      },
      {
        visual: 'focushome',
        title: 'Descubra sua identidade de foco',
        description:
          'O FocushoMe revela como você planeja, executa e conclui, criando uma identidade que evolui junto com você.',
      },
      {
        visual: 'notifications',
        title: 'Seu timer sempre por perto',
        description:
          'Ative as notificações para acompanhar o tempo restante mesmo quando o Focus estiver em segundo plano.',
      },
      {
        visual: 'live',
        title: 'Acompanhe seu foco ao vivo',
        description:
          'Veja o timer enquanto usa outros aplicativos, escuta música, lê ou continua sua rotina.',
      },
      {
        visual: 'finale',
        title: 'Bem-vindo à sua nova era',
        description:
          'Integre sua vida, hábitos, ideias, sonhos e metas em um único lugar — com uma experiência que carrega a sua personalidade.',
      },
    ] satisfies Slide[],
    back: 'Voltar',
    continue: 'Continuar',
    notNow: 'Agora não',
    activate: 'Ativar notificações',
    enabled: 'Notificações ativadas',
    openSettings: 'Abrir configurações',
    configureLive: 'Configurar Live Notifications',
    verify: 'Verificar novamente',
    liveEnabled: 'Live Notifications ativadas',
    liveInstructions:
      'Siga estas etapas em um dispositivo Samsung Galaxy:',
    liveSteps: [
      'Abra as Configurações do celular.',
      'Entre em Sobre o telefone.',
      'Toque em Informações de software.',
      'Toque várias vezes em Número de compilação até o modo desenvolvedor ser ativado.',
      'Volte às Configurações e pesquise por “Live notification”.',
      'Na seção Opções do desenvolvedor, abra “Notif. ao vivo para todos apps”.',
      'Ative a opção e volte ao Focus.',
    ],
    confirmLive:
      'Confirmo que ativei na One UI',
    confirmed:
      'Configuração confirmada',
    finish: 'Começar minha jornada',
    finishBlocked:
      'Conclua a configuração das notificações para começar.',
    checking: 'Verificando configurações...',
  },
  en: {
    slides: [
      {
        visual: 'welcome',
        title: 'Your focus starts here',
        description:
          'Organize your days, follow your progress, and turn every session into part of a greater journey.',
      },
      {
        visual: 'planning',
        title: 'Turn ideas into progress',
        description:
          'Connect projects, goals, and tasks to your focus time and keep everything that matters moving.',
      },
      {
        visual: 'analytics',
        title: 'Understand your rhythm',
        description:
          'See your focus time, active days, completed sessions, and the projects shaping your routine.',
      },
      {
        visual: 'focusme',
        title: 'Your story, told through focus',
        description:
          'Receive weekly and monthly retrospectives built from your actions and personal evolution.',
      },
      {
        visual: 'focushome',
        title: 'Discover your focus identity',
        description:
          'FocushoMe reveals how you plan, execute, and finish, creating an identity that evolves with you.',
      },
      {
        visual: 'notifications',
        title: 'Your timer, always nearby',
        description:
          'Enable notifications to follow the remaining time while Focus is running in the background.',
      },
      {
        visual: 'live',
        title: 'Follow your focus live',
        description:
          'See your timer while using other apps, listening to music, reading, or continuing your routine.',
      },
      {
        visual: 'finale',
        title: 'Welcome to your new era',
        description:
          'Bring your life, habits, ideas, dreams, and goals together in an experience shaped by your personality.',
      },
    ] satisfies Slide[],
    back: 'Back',
    continue: 'Continue',
    notNow: 'Not now',
    activate: 'Enable notifications',
    enabled: 'Notifications enabled',
    openSettings: 'Open settings',
    configureLive: 'Configure Live Notifications',
    verify: 'Check again',
    liveEnabled: 'Live Notifications enabled',
    liveInstructions:
      'Follow these steps on a Samsung Galaxy device:',
    liveSteps: [
      'Open your phone Settings.',
      'Open About phone.',
      'Select Software information.',
      'Tap Build number several times until Developer mode is enabled.',
      'Return to Settings and search for “Live notification”.',
      'Under Developer options, open “Live notifications for all apps”.',
      'Enable the option and return to Focus.',
    ],
    confirmLive:
      'I enabled it in One UI',
    confirmed:
      'Configuration confirmed',
    finish: 'Start my journey',
    finishBlocked:
      'Complete notification setup to begin.',
    checking: 'Checking settings...',
  },
} as const

export function OnboardingPage() {
  const {
    i18n,
  } = useTranslation()

  const {
    user,
    isDemoMode,
  } = useAuth()

  const navigate = useNavigate()
  const location = useLocation()

  const language =
    i18n.resolvedLanguage === 'pt-BR'
      ? 'pt-BR'
      : 'en'

  const content = copy[language]

  const isAndroid =
    Capacitor.getPlatform() ===
    'android'

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0)

  const [
    direction,
    setDirection,
  ] = useState(1)

  const [
    setup,
    setSetup,
  ] = useState<
    TimerNotificationSetup | undefined
  >()

  const [
    isChecking,
    setIsChecking,
  ] = useState(true)

  const [
    liveConfirmed,
    setLiveConfirmed,
  ] = useState(false)

  const identity =
    user?.id ??
    (
      isDemoMode
        ? 'demo'
        : 'anonymous'
    )

  const storageKey =
    getOnboardingStorageKey(
      identity,
    )

  const alreadyCompleted =
    localStorage.getItem(
      storageKey,
    ) === 'true'

  const slide =
    content.slides[currentIndex]

  const lastIndex =
    content.slides.length - 1

  const destination =
    useMemo(() => {
      const state =
        location.state as
          | {
              from?: string
            }
          | null

      return (
        state?.from &&
        state.from !== '/onboarding'
          ? state.from
          : '/'
      )
    }, [location.state])

  async function refreshSetup() {
    setIsChecking(true)

    try {
      const nextSetup =
        await getTimerNotificationSetup()

      setSetup(nextSetup)

      if (
        nextSetup.liveNotificationsEnabled
      ) {
        setLiveConfirmed(true)
      }
    } catch (error) {
      console.error(
        'Unable to check notification setup:',
        error,
      )
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    void refreshSetup()

    let removeListener:
      | (() => Promise<void>)
      | undefined

    void CapacitorApp.addListener(
      'appStateChange',
      ({ isActive }) => {
        if (isActive) {
          void refreshSetup()
        }
      },
    ).then((handle) => {
      removeListener =
        () => handle.remove()
    })

    return () => {
      void removeListener?.()
    }
  }, [])

  if (alreadyCompleted) {
    return (
      <Navigate
        to={destination}
        replace
      />
    )
  }

  function goTo(index: number) {
    const bounded =
      Math.max(
        0,
        Math.min(
          lastIndex,
          index,
        ),
      )

    setDirection(
      bounded >= currentIndex
        ? 1
        : -1,
    )

    setCurrentIndex(bounded)
  }

  async function activateNotifications() {
    const granted =
      await requestTimerNotificationPermission()

    await refreshSetup()

    if (!granted) {
      await openTimerNotificationSettings()
    }
  }

  async function configureLive() {
    await openTimerLiveNotificationSettings()
  }

  function finishOnboarding() {
    localStorage.setItem(
      storageKey,
      'true',
    )

    navigate(
      destination,
      {
        replace: true,
      },
    )
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-white">
      <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-emerald-400/[0.06] blur-3xl" />

      <header
        className="relative flex items-center justify-between px-5 pb-3 sm:px-8"
        style={{
          paddingTop:
            'calc(env(safe-area-inset-top, 0px) + 18px)',
        }}
      >
        <div className="flex items-center gap-2 text-emerald-400">
          <Bell size={17} />
          <span className="text-sm font-semibold">
            Focus
          </span>
        </div>

        <span className="text-xs tabular-nums text-white/35">
          {currentIndex + 1}
          {' / '}
          {content.slides.length}
        </span>
      </header>

      <div className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pb-5 sm:px-8">
        <div className="mb-5 flex gap-1.5">
          {content.slides.map(
            (_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`${index + 1}`}
                onClick={() =>
                  goTo(index)
                }
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]"
              >
                <span
                  className={
                    index <= currentIndex
                      ? 'block h-full w-full bg-emerald-400 transition'
                      : 'block h-full w-0 bg-emerald-400 transition'
                  }
                />
              </button>
            ),
          )}
        </div>

        <div className="flex flex-1 items-center">
          <AnimatePresence
            mode="wait"
            initial={false}
          >
            <motion.section
              key={currentIndex}
              initial={{
                opacity: 0,
                x: direction * 35,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: direction * -35,
              }}
              transition={{
                duration: 0.25,
                ease: [
                  0.16,
                  1,
                  0.3,
                  1,
                ],
              }}
              drag="x"
              dragConstraints={{
                left: 0,
                right: 0,
              }}
              dragElastic={0.15}
              onDragEnd={(
                _,
                info,
              ) => {
                if (
                  info.offset.x < -70
                ) {
                  goTo(
                    currentIndex + 1,
                  )
                } else if (
                  info.offset.x > 70
                ) {
                  goTo(
                    currentIndex - 1,
                  )
                }
              }}
              className="grid w-full items-center gap-7 py-4 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14"
            >
              <OnboardingVisual
                type={slide.visual}
              />

              <div className="mx-auto w-full max-w-xl text-center lg:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {slide.title}
                </h1>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-white/50 lg:mx-0">
                  {slide.description}
                </p>

                {currentIndex === 5 &&
                  isAndroid && (
                  <div className="mt-6 space-y-3">
                    <button
                      type="button"
                      onClick={() =>
                        void activateNotifications()
                      }
                      disabled={
                        isChecking ||
                        setup?.notificationsEnabled
                      }
                      className="btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto"
                    >
                      {isChecking ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : setup
                          ?.notificationsEnabled ? (
                        <Check size={17} />
                      ) : (
                        <Bell size={17} />
                      )}

                      {isChecking
                        ? content.checking
                        : setup
                            ?.notificationsEnabled
                          ? content.enabled
                          : content.activate}
                    </button>

                    {!isChecking &&
                      !setup
                        ?.notificationsEnabled && (
                        <button
                          type="button"
                          onClick={() =>
                            void openTimerNotificationSettings()
                          }
                          className="flex w-full items-center justify-center gap-2 text-xs text-white/45 sm:w-auto"
                        >
                          <ExternalLink
                            size={14}
                          />
                          {content.openSettings}
                        </button>
                      )}
                  </div>
                )}

                {currentIndex === 6 &&
                  isAndroid && (
                  <div className="mt-6">
                    <p className="mb-4 text-xs leading-6 text-white/50">
                      {
                        content.liveInstructions
                      }
                    </p>

                    <ol className="mb-5 space-y-2.5 text-left">
                      {content.liveSteps.map(
                        (step, index) => (
                          <li
                            key={step}
                            className="flex items-start gap-3 text-xs leading-5 text-white/50"
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-[10px] font-semibold text-emerald-400">
                              {index + 1}
                            </span>

                            <span>
                              {step}
                            </span>
                          </li>
                        ),
                      )}
                    </ol>

                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          void configureLive()
                        }
                        className="btn-primary inline-flex items-center justify-center gap-2"
                      >
                        <ExternalLink
                          size={16}
                        />
                        {content.configureLive}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void refreshSetup()
                        }
                        className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/60"
                      >
                        {content.verify}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setLiveConfirmed(
                          true,
                        )
                      }
                      className={
                        liveConfirmed
                          ? 'mt-4 flex items-center gap-2 text-xs text-emerald-400'
                          : 'mt-4 flex items-center gap-2 text-xs text-white/45'
                      }
                    >
                      <span className={
                        liveConfirmed
                          ? 'flex h-5 w-5 items-center justify-center rounded-md bg-emerald-400 text-black'
                          : 'h-5 w-5 rounded-md border border-white/20'
                      }>
                        {liveConfirmed && (
                          <Check size={13} />
                        )}
                      </span>

                      {liveConfirmed
                        ? content.confirmed
                        : content.confirmLive}
                    </button>
                  </div>
                )}

              </div>
            </motion.section>
          </AnimatePresence>
        </div>

        <footer
          className="flex items-center justify-between gap-4 pt-4"
          style={{
            paddingBottom:
              'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <button
            type="button"
            onClick={() =>
              goTo(currentIndex - 1)
            }
            disabled={
              currentIndex === 0
            }
            className="flex items-center gap-2 rounded-xl px-3 py-3 text-sm text-white/45 disabled:invisible"
          >
            <ArrowLeft size={17} />
            {content.back}
          </button>

          <button
            type="button"
            onClick={() => {
              if (
                currentIndex ===
                lastIndex
              ) {
                finishOnboarding()
              } else {
                goTo(
                  currentIndex + 1,
                )
              }
            }}
            className="btn-primary inline-flex items-center gap-2"
          >
            {currentIndex ===
            lastIndex
              ? content.finish
              : isAndroid &&
                  currentIndex === 5 &&
                  !setup
                    ?.notificationsEnabled
                ? content.notNow
                : isAndroid &&
                    currentIndex === 6 &&
                    !liveConfirmed
                  ? content.notNow
                  : content.continue}

            {currentIndex ===
            lastIndex ? (
              <Check size={17} />
            ) : (
              <ArrowRight size={17} />
            )}
          </button>
        </footer>
      </div>
    </main>
  )
}
