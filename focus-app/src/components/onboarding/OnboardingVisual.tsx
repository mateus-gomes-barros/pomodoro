import {
  BarChart3,
  BrainCircuit,
  Check,
  CheckSquare,
  Clock3,
  Flame,
  FolderKanban,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from 'lucide-react'

import {
  useTranslation,
} from 'react-i18next'

import {
  FocusHomeSymbol,
} from '@/components/focusme/FocusHomeSymbol'
import {
  FocusMeIcon,
} from '@/components/icons/FocusMeIcon'

export type OnboardingVisualType =
  | 'welcome'
  | 'planning'
  | 'analytics'
  | 'focusme'
  | 'focushome'
  | 'notifications'
  | 'live'
  | 'finale'

interface OnboardingVisualProps {
  type: OnboardingVisualType
}

const visualCopy = {
  'pt-BR': {
    dayMoving: 'Seu dia em movimento',
    focusToday: 'Foco hoje',
    currentStreak: 'Sequência atual',
    tasksCompleted: 'Tarefas concluídas',
    sessions: 'Sessões',
    connected: 'Tudo conectado',
    launchProject: 'Lançar meu projeto',
    sixTasks: '6 tarefas',
    buildRoutine: 'Construir uma rotina',
    annualGoal: 'Meta anual',
    finishPresentation: 'Finalizar apresentação',
    today: 'Hoje',
    rhythm: 'Seu ritmo',
    activeDays: 'Dias ativos',
    consistency: 'Consistência',
    retrospective: 'Retrospectiva',
    monthInFocus: 'Seu mês em foco',
    narrative:
      'Você transformou constância em evolução.',
    narrativeDescription:
      'Seus períodos mais consistentes nasceram quando projetos e sessões seguiram o mesmo ritmo.',
    builtByYou:
      'Uma narrativa construída por você',
    yourFocusHome: 'Sua FocushoMe',
    archetype: 'Visionário · Expansão',
    creative: 'Criativo',
    explorer: 'Explorador',
    intentional: 'Intencional',
    focus: 'Foco',
    personalProject: 'Projeto pessoal',
    pause: 'Pausar',
    finish: 'Encerrar',
    visible:
      'Visível enquanto você usa outros apps',
  },
  en: {
    dayMoving: 'Your day in motion',
    focusToday: 'Focus today',
    currentStreak: 'Current streak',
    tasksCompleted: 'Tasks completed',
    sessions: 'Sessions',
    connected: 'Everything connected',
    launchProject: 'Launch my project',
    sixTasks: '6 tasks',
    buildRoutine: 'Build a routine',
    annualGoal: 'Annual goal',
    finishPresentation: 'Finish presentation',
    today: 'Today',
    rhythm: 'Your rhythm',
    activeDays: 'Active days',
    consistency: 'Consistency',
    retrospective: 'Retrospective',
    monthInFocus: 'Your month in focus',
    narrative:
      'You turned consistency into evolution.',
    narrativeDescription:
      'Your most consistent periods emerged when projects and sessions followed the same rhythm.',
    builtByYou:
      'A narrative built by you',
    yourFocusHome: 'Your FocushoMe',
    archetype: 'Visionary · Expansion',
    creative: 'Creative',
    explorer: 'Explorer',
    intentional: 'Intentional',
    focus: 'Focus',
    personalProject: 'Personal project',
    pause: 'Pause',
    finish: 'Finish',
    visible:
      'Visible while you use other apps',
  },
} as const

function useVisualCopy() {
  const {
    i18n,
  } = useTranslation()

  return visualCopy[
    i18n.resolvedLanguage === 'pt-BR'
      ? 'pt-BR'
      : 'en'
  ]
}

function Frame({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative mx-auto flex h-[330px] w-full max-w-[440px] items-center justify-center overflow-hidden rounded-[36px] border border-white/[0.07] glass-visual p-5 shadow-2xl sm:h-[380px]">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-400/[0.09] blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-emerald-400/[0.05] blur-3xl" />

      <div className="relative w-full">
        {children}
      </div>
    </div>
  )
}

function Metric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
      <div className="text-emerald-400">
        {icon}
      </div>

      <p className="mt-4 text-xl font-semibold text-white">
        {value}
      </p>

      <p className="mt-1 text-[10px] text-white/40">
        {label}
      </p>
    </div>
  )
}

function WelcomeVisual() {
  const labels = useVisualCopy()

  return (
    <Frame>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
          <FocusMeIcon size={22} />
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400">
            Focus
          </p>
          <p className="text-sm font-semibold text-white">
            {labels.dayMoving}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Metric
          icon={<Timer size={17} />}
          value="1h 40min"
          label={labels.focusToday}
        />
        <Metric
          icon={<Flame size={17} />}
          value="12 dias"
          label={labels.currentStreak}
        />
        <Metric
          icon={<CheckSquare size={17} />}
          value="8"
          label={labels.tasksCompleted}
        />
        <Metric
          icon={<TrendingUp size={17} />}
          value="4"
          label={labels.sessions}
        />
      </div>
    </Frame>
  )
}

function PlanningVisual() {
  const labels = useVisualCopy()

  const items = [
    {
      icon: <FolderKanban size={17} />,
      title: labels.launchProject,
      detail: labels.sixTasks,
      progress: '72%',
    },
    {
      icon: <Target size={17} />,
      title: labels.buildRoutine,
      detail: labels.annualGoal,
      progress: '58%',
    },
    {
      icon: <CheckSquare size={17} />,
      title: labels.finishPresentation,
      detail: labels.today,
      progress: '90%',
    },
  ]

  return (
    <Frame>
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
        {labels.connected}
      </p>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
                {item.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-[10px] text-white/40">
                  {item.detail}
                </p>
              </div>

              <span className="text-xs text-emerald-400">
                {item.progress}
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{
                  width: item.progress,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function AnalyticsVisual() {
  const labels = useVisualCopy()

  const bars = [
    34, 58, 42, 78, 64, 94, 72,
  ]

  return (
    <Frame>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400">
            {labels.rhythm}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            12h 35min
          </p>
        </div>

        <BarChart3
          size={24}
          className="text-emerald-400"
        />
      </div>

      <div className="mt-8 flex h-36 items-end gap-3 rounded-3xl border border-white/[0.07] bg-white/[0.025] px-5 pb-5 pt-8">
        {bars.map((height, index) => (
          <div
            key={index}
            className="flex flex-1 items-end"
            style={{
              height: '100%',
            }}
          >
            <div
              className={
                index === 5
                  ? 'w-full rounded-t-lg bg-emerald-400'
                  : 'w-full rounded-t-lg bg-emerald-400/25'
              }
              style={{
                height: `${height}%`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          ['28', labels.sessions],
          ['6', labels.activeDays],
          ['84%', labels.consistency],
        ].map(([value, label]) => (
          <div key={label}>
            <p className="text-sm font-semibold text-white">
              {value}
            </p>
            <p className="mt-1 text-[9px] text-white/35">
              {label}
            </p>
          </div>
        ))}
      </div>
    </Frame>
  )
}

function FocusMeVisual() {
  const labels = useVisualCopy()

  return (
    <Frame>
      <div className="rounded-[28px] border border-emerald-400/15 bg-white/[0.035] p-6">
        <div className="flex items-center justify-between">
          <FocusMeIcon
            size={28}
            className="text-emerald-400"
          />

          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[9px] uppercase tracking-wider text-emerald-400">
            {labels.retrospective}
          </span>
        </div>

        <p className="mt-8 text-[10px] uppercase tracking-[0.18em] text-emerald-400">
          {labels.monthInFocus}
        </p>

        <p className="mt-3 text-2xl font-semibold text-white">
          {labels.narrative}
        </p>

        <p className="mt-4 text-xs leading-6 text-white/45">
          {labels.narrativeDescription}
        </p>

        <div className="mt-6 flex items-center gap-2 text-[10px] text-emerald-300">
          <Sparkles size={13} />
          {labels.builtByYou}
        </div>
      </div>
    </Frame>
  )
}

function FocusHomeVisual() {
  const labels = useVisualCopy()

  return (
    <Frame>
      <div className="text-center">
        <FocusHomeSymbol
          type="nova"
          size={150}
          className="mx-auto"
        />

        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
          {labels.yourFocusHome}
        </p>

        <p className="mt-2 text-3xl font-semibold capitalize text-white">
          Nova
        </p>

        <p className="mt-2 text-xs text-white/45">
          {labels.archetype}
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {[
            labels.creative,
            labels.explorer,
            labels.intentional,
          ].map((trait) => (
            <span
              key={trait}
              className="rounded-full border border-white/[0.07] bg-white/[0.035] px-3 py-1.5 text-[9px] text-white/50"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
    </Frame>
  )
}

function NotificationCard() {
  const labels = useVisualCopy()

  return (
    <div className="rounded-[30px] border border-white/[0.08] glass-visual p-5 shadow-2xl">
      <div className="flex gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-400">
          <FocusMeIcon size={28} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-white">
              Focus
            </p>
            <p className="text-xs text-white/65">
              24:54
            </p>
          </div>

          <p className="mt-2 text-lg font-semibold text-white">
            {labels.focus}
          </p>

          <p className="mt-1 text-[10px] text-white/40">
            {labels.personalProject}
          </p>
        </div>
      </div>

      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/15">
        <div className="h-full w-[38%] rounded-full bg-emerald-400" />
      </div>

      <div className="mt-5 grid grid-cols-2 divide-x divide-white/10 text-center text-xs font-semibold text-white">
        <span>{labels.pause}</span>
        <span>{labels.finish}</span>
      </div>
    </div>
  )
}

function NotificationsVisual() {
  return (
    <Frame>
      <div className="mb-5 flex items-center justify-between px-2 text-white/55">
        <span className="text-sm font-semibold">
          10:24
        </span>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white/60" />
          <span className="h-2 w-2 rounded-full bg-white/40" />
          <span className="h-2 w-5 rounded-full bg-white/60" />
        </div>
      </div>

      <NotificationCard />
    </Frame>
  )
}

function LiveVisual() {
  const labels = useVisualCopy()

  return (
    <Frame>
      <div className="mb-10 flex items-center justify-between px-2">
        <span className="text-sm font-semibold text-white">
          10:24
        </span>

        <div className="flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-semibold text-black">
          <Clock3 size={12} />
          24:34
        </div>

        <span className="text-xs text-white/55">
          84%
        </span>
      </div>

      <div className="mx-auto max-w-[330px] rounded-full border border-white/[0.08] glass-visual px-5 py-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
            <FocusMeIcon size={23} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-white/45">
              Focus
            </p>
            <p className="text-sm font-semibold text-white">
              {labels.focus}
            </p>
          </div>

          <span className="text-sm font-medium text-emerald-400">
            24:34
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-white/35">
        <Check
          size={13}
          className="text-emerald-400"
        />
        {labels.visible}
      </div>
    </Frame>
  )
}

function FinaleVisual() {
  return (
    <Frame>
      <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-emerald-400/10" />
        <div className="absolute inset-8 rounded-full border border-emerald-400/20" />
        <div className="absolute inset-16 rounded-full bg-emerald-400/[0.08] blur-xl" />

        <div className="relative flex h-24 w-24 items-center justify-center rounded-[30px] border border-emerald-400/20 glass-visual text-emerald-400 shadow-2xl">
          <BrainCircuit size={42} />
        </div>

        <Timer
          size={24}
          className="absolute left-3 top-28 text-emerald-400"
        />
        <Target
          size={24}
          className="absolute right-7 top-7 text-white/55"
        />
        <Sparkles
          size={24}
          className="absolute bottom-5 right-10 text-emerald-300"
        />
        <CheckSquare
          size={24}
          className="absolute left-10 top-7 text-white/55"
        />
      </div>
    </Frame>
  )
}

export function OnboardingVisual({
  type,
}: OnboardingVisualProps) {
  switch (type) {
    case 'welcome':
      return <WelcomeVisual />
    case 'planning':
      return <PlanningVisual />
    case 'analytics':
      return <AnalyticsVisual />
    case 'focusme':
      return <FocusMeVisual />
    case 'focushome':
      return <FocusHomeVisual />
    case 'notifications':
      return <NotificationsVisual />
    case 'live':
      return <LiveVisual />
    case 'finale':
      return <FinaleVisual />
  }
}
