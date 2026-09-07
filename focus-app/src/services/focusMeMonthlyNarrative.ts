import type {
  FocusMeMonthlyReport,
  TimeBlock,
} from '@/services/focusMeMonthlyService'
import type {
  TaskCategory,
} from '@/types'

export type FocusMeNarrativeLocale =
  | 'pt-BR'
  | 'en-US'

export interface FocusMeMonthlyEditorialFacts {
  periodStart: string
  periodEnd: string
  focusMinutes: number
  completedSessions: number
  activeDays: number
  averageMinutesPerActiveDay: number
  dominantTimeBlock: TimeBlock | null
  strongestWeek: number | null
  strongestWeekMinutes: number
  tasksCreated: number
  tasksCompleted: number
  dominantTaskCategory:
    TaskCategory | null
  projectsCreated: number
  projectsCompleted: number
  goalsCreated: number
  goalsCompleted: number
  recoveryActions: number
  completionBalance: number
  abandonmentRate: number
  projectFocusShare: number
  focusChangePercent: number | null
  tasksChangePercent: number | null
  activeDaysChangePercent: number | null
}

export interface FocusMeMonthlyNarrative {
  paragraphs: string[]
}

export function buildFocusMeMonthlyEditorialFacts(
  report: FocusMeMonthlyReport,
): FocusMeMonthlyEditorialFacts {
  const current = report.current

  const strongestWeek =
    [...current.weeks].sort(
      (first, second) =>
        second.focusMinutes -
        first.focusMinutes,
    )[0]

  const dominantCategory =
    [...current.tasks.categories]
      .sort(
        (first, second) =>
          second.completed -
            first.completed ||
          second.created -
            first.created,
      )[0]

  return {
    periodStart:
      report.period.start,
    periodEnd:
      report.period.end,
    focusMinutes:
      current.focusMinutes,
    completedSessions:
      current.completedSessions,
    activeDays:
      current.activeDays,
    averageMinutesPerActiveDay:
      current.averageMinutesPerActiveDay,
    dominantTimeBlock:
      current.dominantTimeBlock,
    strongestWeek:
      strongestWeek?.focusMinutes
        ? strongestWeek.week
        : null,
    strongestWeekMinutes:
      strongestWeek?.focusMinutes ??
      0,
    tasksCreated:
      current.tasks.created,
    tasksCompleted:
      current.tasks.completed,
    dominantTaskCategory:
      dominantCategory &&
      (
        dominantCategory.created > 0 ||
        dominantCategory.completed > 0
      )
        ? dominantCategory.category
        : null,
    projectsCreated:
      current.projects.created,
    projectsCompleted:
      current.projects.completed,
    goalsCreated:
      current.goals.created,
    goalsCompleted:
      current.goals.completed,
    recoveryActions:
      current.behavior
        .recoveryActions,
    completionBalance:
      current.behavior
        .completionBalance,
    abandonmentRate:
      current.behavior
        .abandonmentRate,
    projectFocusShare:
      current.behavior
        .projectFocusShare,
    focusChangePercent:
      report.comparison
        .focusMinutesPercent,
    tasksChangePercent:
      report.comparison
        .tasksCompletedPercent,
    activeDaysChangePercent:
      report.comparison
        .activeDaysPercent,
  }
}

function seedFromFacts(
  facts: FocusMeMonthlyEditorialFacts,
): number {
  const source = [
    facts.periodStart,
    facts.focusMinutes,
    facts.activeDays,
    facts.tasksCompleted,
    facts.recoveryActions,
  ].join(':')

  return [...source].reduce(
    (total, character) =>
      (
        total * 31 +
        character.charCodeAt(0)
      ) >>> 0,
    11,
  )
}

function choose(
  values: string[],
  seed: number,
  offset: number,
): string {
  return values[
    (seed + offset * 19) %
      values.length
  ]
}

function formatMinutes(
  minutes: number,
  locale: FocusMeNarrativeLocale,
): string {
  if (minutes < 60) {
    return locale === 'pt-BR'
      ? `${minutes} minutos`
      : `${minutes} minutes`
  }

  const hours =
    Math.floor(minutes / 60)
  const remainder =
    minutes % 60

  if (locale === 'pt-BR') {
    return remainder
      ? `${hours}h e ${remainder}min`
      : `${hours} horas`
  }

  return remainder
    ? `${hours}h ${remainder}min`
    : `${hours} hours`
}

const BLOCK_NAMES = {
  'pt-BR': {
    morning: 'manhã',
    afternoon: 'tarde',
    evening: 'noite',
    late_night: 'madrugada',
  },
  'en-US': {
    morning: 'morning',
    afternoon: 'afternoon',
    evening: 'evening',
    late_night: 'late night',
  },
} satisfies Record<
  FocusMeNarrativeLocale,
  Record<TimeBlock, string>
>

const CATEGORY_NAMES = {
  'pt-BR': {
    quick: 'rápidas',
    planned: 'planejadas',
    urgent: 'urgentes',
    long_term: 'de longo prazo',
  },
  'en-US': {
    quick: 'quick',
    planned: 'planned',
    urgent: 'urgent',
    long_term: 'long-term',
  },
} satisfies Record<
  FocusMeNarrativeLocale,
  Record<TaskCategory, string>
>

function portugueseNarrative(
  facts: FocusMeMonthlyEditorialFacts,
  seed: number,
): string[] {
  const paragraphs: string[] = []
  const time =
    formatMinutes(
      facts.focusMinutes,
      'pt-BR',
    )

  paragraphs.push(
    choose(
      [
        `Seu mês reuniu ${time} de foco em ${facts.activeDays} dias ativos. Foram ${facts.completedSessions} sessões que transformaram diferentes momentos da rotina em progresso registrado.`,
        `Ao longo do mês, você construiu ${time} de atenção dedicada. Esse ritmo se distribuiu por ${facts.activeDays} dias e ${facts.completedSessions} sessões concluídas.`,
        `${facts.activeDays} dias receberam sua atenção neste mês. Juntos, eles formaram ${time} de foco e ${facts.completedSessions} sessões concluídas.`,
      ],
      seed,
      1,
    ),
  )

  if (
    facts.focusChangePercent !== null
  ) {
    const direction =
      facts.focusChangePercent >= 0
        ? 'acima'
        : 'abaixo'

    paragraphs.push(
      `O tempo de foco terminou ${Math.abs(facts.focusChangePercent)}% ${direction} do mês anterior. Essa comparação mostra uma mudança de ritmo, não um julgamento sobre o valor do período.`,
    )
  } else {
    paragraphs.push(
      'Este período começa uma nova referência mensal. Os próximos relatórios poderão mostrar com mais clareza como seu ritmo está mudando.',
    )
  }

  if (facts.dominantTimeBlock) {
    const block =
      BLOCK_NAMES['pt-BR'][
        facts.dominantTimeBlock
      ]

    const strongest =
      facts.strongestWeek
        ? ` A semana ${facts.strongestWeek} foi a mais intensa, com ${formatMinutes(facts.strongestWeekMinutes, 'pt-BR')}.`
        : ''

    paragraphs.push(
      choose(
        [
          `A ${block} foi o período em que seu foco mais apareceu.${strongest}`,
          `Seu padrão encontrou mais força durante a ${block}.${strongest}`,
          `Entre os horários do mês, a ${block} concentrou a maior parte da sua atenção.${strongest}`,
        ],
        seed,
        2,
      ),
    )
  }

  const execution: string[] = []

  if (
    facts.tasksCreated > 0 ||
    facts.tasksCompleted > 0
  ) {
    execution.push(
      `${facts.tasksCreated} tarefas criadas e ${facts.tasksCompleted} concluídas`,
    )
  }

  if (
    facts.projectsCreated > 0 ||
    facts.projectsCompleted > 0
  ) {
    execution.push(
      `${facts.projectsCreated} projetos iniciados e ${facts.projectsCompleted} concluídos`,
    )
  }

  if (
    facts.goalsCreated > 0 ||
    facts.goalsCompleted > 0
  ) {
    execution.push(
      `${facts.goalsCreated} metas criadas e ${facts.goalsCompleted} alcançadas`,
    )
  }

  if (execution.length > 0) {
    let ending = '.'

    if (facts.recoveryActions > 0) {
      ending =
        `, além de ${facts.recoveryActions} retomadas que revelam sua capacidade de voltar ao que ainda importava.`
    } else if (
      facts.dominantTaskCategory
    ) {
      ending =
        `. As tarefas ${CATEGORY_NAMES['pt-BR'][facts.dominantTaskCategory]} foram as que mais apareceram no seu movimento do mês.`
    }

    paragraphs.push(
      `Na passagem entre intenção e resultado, você registrou ${execution.join('; ')}${ending}`,
    )
  }

  return paragraphs
}

function englishNarrative(
  facts: FocusMeMonthlyEditorialFacts,
  seed: number,
): string[] {
  const paragraphs: string[] = []
  const time =
    formatMinutes(
      facts.focusMinutes,
      'en-US',
    )

  paragraphs.push(
    choose(
      [
        `Your month gathered ${time} of focus across ${facts.activeDays} active days. ${facts.completedSessions} sessions turned different moments of your routine into recorded progress.`,
        `Throughout the month, you built ${time} of dedicated attention. This rhythm spread across ${facts.activeDays} days and ${facts.completedSessions} completed sessions.`,
        `${facts.activeDays} days received your attention this month. Together, they formed ${time} of focus and ${facts.completedSessions} completed sessions.`,
      ],
      seed,
      1,
    ),
  )

  if (
    facts.focusChangePercent !== null
  ) {
    const direction =
      facts.focusChangePercent >= 0
        ? 'above'
        : 'below'

    paragraphs.push(
      `Focus time ended ${Math.abs(facts.focusChangePercent)}% ${direction} the previous month. This comparison reflects a change in rhythm, not a judgment of the period's value.`,
    )
  } else {
    paragraphs.push(
      'This period creates a new monthly reference. Future reports will make changes in your rhythm easier to recognize.',
    )
  }

  if (facts.dominantTimeBlock) {
    const block =
      BLOCK_NAMES['en-US'][
        facts.dominantTimeBlock
      ]

    const strongest =
      facts.strongestWeek
        ? ` Week ${facts.strongestWeek} was the strongest, with ${formatMinutes(facts.strongestWeekMinutes, 'en-US')}.`
        : ''

    paragraphs.push(
      choose(
        [
          `The ${block} was when your focus appeared most often.${strongest}`,
          `Your pattern found its greatest strength during the ${block}.${strongest}`,
          `Among the month's time periods, the ${block} held most of your attention.${strongest}`,
        ],
        seed,
        2,
      ),
    )
  }

  const execution: string[] = []

  if (
    facts.tasksCreated > 0 ||
    facts.tasksCompleted > 0
  ) {
    execution.push(
      `${facts.tasksCreated} tasks created and ${facts.tasksCompleted} completed`,
    )
  }

  if (
    facts.projectsCreated > 0 ||
    facts.projectsCompleted > 0
  ) {
    execution.push(
      `${facts.projectsCreated} projects started and ${facts.projectsCompleted} completed`,
    )
  }

  if (
    facts.goalsCreated > 0 ||
    facts.goalsCompleted > 0
  ) {
    execution.push(
      `${facts.goalsCreated} goals created and ${facts.goalsCompleted} achieved`,
    )
  }

  if (execution.length > 0) {
    let ending = '.'

    if (facts.recoveryActions > 0) {
      ending =
        `, alongside ${facts.recoveryActions} returns that show your ability to revisit what still mattered.`
    } else if (
      facts.dominantTaskCategory
    ) {
      ending =
        `. ${CATEGORY_NAMES['en-US'][facts.dominantTaskCategory]} tasks appeared most often in your monthly movement.`
    }

    paragraphs.push(
      `Between intention and results, you recorded ${execution.join('; ')}${ending}`,
    )
  }

  return paragraphs
}

export function createFocusMeMonthlyNarrative(
  report: FocusMeMonthlyReport,
  locale: FocusMeNarrativeLocale,
): FocusMeMonthlyNarrative {
  const facts =
    buildFocusMeMonthlyEditorialFacts(
      report,
    )

  const seed =
    seedFromFacts(facts)

  return {
    paragraphs:
      locale === 'pt-BR'
        ? portugueseNarrative(
            facts,
            seed,
          )
        : englishNarrative(
            facts,
            seed,
          ),
  }
}
