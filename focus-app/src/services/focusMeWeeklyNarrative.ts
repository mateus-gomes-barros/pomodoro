import type {
  FocusMeWeeklyReport,
} from '@/services/focusMeService'

export interface FocusMeWeeklyNarrative {
  paragraphs: string[]
}

type NarrativeLocale =
  | 'pt-BR'
  | 'en-US'

function createSeed(
  report: FocusMeWeeklyReport,
): number {
  const source = [
    report.period.start,
    report.focus.totalMinutes,
    report.focus.activeDays,
    report.tasks.created,
    report.tasks.completed,
    report.rhythm.resumes,
  ].join(':')

  return [...source].reduce(
    (total, character) =>
      (
        total * 31 +
        character.charCodeAt(0)
      ) >>> 0,
    7,
  )
}

function choose<T>(
  values: T[],
  seed: number,
  offset: number,
): T {
  return values[
    (seed + offset * 17) %
      values.length
  ]
}

function formatMinutes(
  minutes: number,
  locale: NarrativeLocale,
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
    return remainder > 0
      ? `${hours}h e ${remainder}min`
      : `${hours} horas`
  }

  return remainder > 0
    ? `${hours}h ${remainder}min`
    : `${hours} hours`
}

function weekdayName(
  date: string,
  locale: NarrativeLocale,
): string {
  return new Intl.DateTimeFormat(
    locale,
    {
      weekday: 'long',
    },
  ).format(
    new Date(`${date}T12:00:00`),
  )
}

function dominantTimeBlock(
  report: FocusMeWeeklyReport,
): {
  key:
    | 'morning'
    | 'afternoon'
    | 'evening'
    | 'lateNight'
  minutes: number
} | null {
  const blocks = [
    {
      key: 'morning' as const,
      minutes:
        report.focus.morningMinutes,
    },
    {
      key: 'afternoon' as const,
      minutes:
        report.focus.afternoonMinutes,
    },
    {
      key: 'evening' as const,
      minutes:
        report.focus.eveningMinutes,
    },
    {
      key: 'lateNight' as const,
      minutes:
        report.focus.lateNightMinutes,
    },
  ].sort(
    (first, second) =>
      second.minutes -
      first.minutes,
  )

  return blocks[0].minutes > 0
    ? blocks[0]
    : null
}

function blockName(
  key:
    | 'morning'
    | 'afternoon'
    | 'evening'
    | 'lateNight',
  locale: NarrativeLocale,
): string {
  const names = {
    'pt-BR': {
      morning: 'manhã',
      afternoon: 'tarde',
      evening: 'noite',
      lateNight: 'madrugada',
    },
    'en-US': {
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'evening',
      lateNight: 'late night',
    },
  }

  return names[locale][key]
}

function buildPortugueseNarrative(
  report: FocusMeWeeklyReport,
  seed: number,
): string[] {
  const paragraphs: string[] = []
  const totalActions =
    report.tasks.created +
    report.tasks.completed +
    report.projects.created +
    report.projects.completed +
    report.goals.created +
    report.goals.completed

  if (report.focus.totalMinutes > 0) {
    const time =
      formatMinutes(
        report.focus.totalMinutes,
        'pt-BR',
      )

    paragraphs.push(
      choose(
        [
          `Sua semana reuniu ${time} de foco em ${report.focus.activeDays} dias ativos. Mais do que um total, esse ritmo mostra como sua atenção encontrou espaço ao longo dos dias.`,
          `Você construiu ${time} de foco durante ${report.focus.activeDays} dias. Foram ${report.focus.completedSessions} sessões transformando intenção em tempo realmente dedicado.`,
          `Ao longo da semana, ${report.focus.completedSessions} sessões somaram ${time} de foco. Sua rotina esteve presente em ${report.focus.activeDays} dias diferentes.`,
        ],
        seed,
        1,
      ),
    )
  } else if (totalActions > 0) {
    paragraphs.push(
      choose(
        [
          'Sua semana se movimentou principalmente fora do cronômetro. Você organizou e atualizou partes da sua rotina, mesmo sem concluir sessões de foco.',
          'O tempo de foco ainda não apareceu nesta semana, mas houve movimento no seu planejamento. Suas ações já começaram a desenhar o próximo ciclo.',
          'Esta foi uma semana mais voltada à organização do que às sessões. O Focus registrou decisões e mudanças que também fazem parte do seu processo.',
        ],
        seed,
        1,
      ),
    )
  } else {
    paragraphs.push(
      'Esta semana ainda está em aberto. Conforme você usar tarefas, projetos, metas e sessões, o FocusMe transformará essas ações em uma leitura da sua rotina.',
    )
  }

  const bestDay =
    report.focus.bestDay
  const dominant =
    dominantTimeBlock(report)

  if (bestDay && dominant) {
    const day =
      weekdayName(
        bestDay.date,
        'pt-BR',
      )

    paragraphs.push(
      choose(
        [
          `${day} foi seu ponto mais intenso, com ${formatMinutes(bestDay.focusMinutes, 'pt-BR')} de foco. A ${blockName(dominant.key, 'pt-BR')} concentrou a maior parte da sua energia na semana.`,
          `Seu ritmo ganhou mais força na ${blockName(dominant.key, 'pt-BR')}. Entre os dias, ${day} se destacou com ${formatMinutes(bestDay.focusMinutes, 'pt-BR')} de atenção dedicada.`,
          `A maior presença aconteceu na ${blockName(dominant.key, 'pt-BR')}, e ${day} marcou o pico da semana. Nesse dia, você acumulou ${formatMinutes(bestDay.focusMinutes, 'pt-BR')} de foco.`,
        ],
        seed,
        2,
      ),
    )
  }

  const executionParts: string[] = []

  if (
    report.tasks.created > 0 ||
    report.tasks.completed > 0
  ) {
    executionParts.push(
      `${report.tasks.created} tarefas criadas e ${report.tasks.completed} concluídas`,
    )
  }

  if (report.projects.completed > 0) {
    executionParts.push(
      `${report.projects.completed} projetos concluídos`,
    )
  }

  if (report.goals.completed > 0) {
    executionParts.push(
      `${report.goals.completed} metas alcançadas`,
    )
  }

  const recoveryActions =
    report.tasks.reopened +
    report.tasks.restored +
    report.projects.reopened +
    report.goals.reopened +
    report.rhythm.resumes

  if (executionParts.length > 0) {
    let ending = '.'

    if (recoveryActions > 0) {
      ending =
        `, enquanto ${recoveryActions} retomadas mostram que interromper não significou abandonar.`
    } else if (
      report.rhythm.starts > 0
    ) {
      ending =
        `, com ${report.rhythm.completionRate}% dos ciclos iniciados chegando à conclusão.`
    }

    paragraphs.push(
      choose(
        [
          `Na execução, você registrou ${executionParts.join(', ')}${ending}`,
          `Seu movimento concreto apareceu em ${executionParts.join(', ')}${ending}`,
          `Entre planejar e finalizar, a semana deixou ${executionParts.join(', ')}${ending}`,
        ],
        seed,
        3,
      ),
    )
  } else if (recoveryActions > 0) {
    paragraphs.push(
      `Mesmo sem muitas conclusões registradas, houve ${recoveryActions} retomadas. Voltar ao que foi interrompido também é uma forma importante de continuidade.`,
    )
  }

  return paragraphs
}

function buildEnglishNarrative(
  report: FocusMeWeeklyReport,
  seed: number,
): string[] {
  const paragraphs: string[] = []
  const totalActions =
    report.tasks.created +
    report.tasks.completed +
    report.projects.created +
    report.projects.completed +
    report.goals.created +
    report.goals.completed

  if (report.focus.totalMinutes > 0) {
    const time =
      formatMinutes(
        report.focus.totalMinutes,
        'en-US',
      )

    paragraphs.push(
      choose(
        [
          `Your week gathered ${time} of focus across ${report.focus.activeDays} active days. Beyond the total, this rhythm shows how your attention found space throughout the week.`,
          `You built ${time} of focus over ${report.focus.activeDays} days. ${report.focus.completedSessions} sessions turned intention into time genuinely dedicated.`,
          `Across the week, ${report.focus.completedSessions} sessions added up to ${time} of focus. Your routine showed up on ${report.focus.activeDays} different days.`,
        ],
        seed,
        1,
      ),
    )
  } else if (totalActions > 0) {
    paragraphs.push(
      choose(
        [
          'Your week moved mainly outside the timer. You organized and updated parts of your routine even without completing focus sessions.',
          'Focus time has not appeared yet, but your planning moved forward. Those actions are already shaping your next cycle.',
          'This week leaned more toward organization than sessions. Focus recorded decisions and changes that are also part of your process.',
        ],
        seed,
        1,
      ),
    )
  } else {
    paragraphs.push(
      'This week is still open. As you use tasks, projects, goals, and sessions, FocusMe will turn those actions into an understanding of your routine.',
    )
  }

  const bestDay =
    report.focus.bestDay
  const dominant =
    dominantTimeBlock(report)

  if (bestDay && dominant) {
    const day =
      weekdayName(
        bestDay.date,
        'en-US',
      )

    paragraphs.push(
      choose(
        [
          `${day} was your strongest point, with ${formatMinutes(bestDay.focusMinutes, 'en-US')} of focus. The ${blockName(dominant.key, 'en-US')} held most of your focused energy.`,
          `Your rhythm was strongest during the ${blockName(dominant.key, 'en-US')}. Among the days, ${day} stood out with ${formatMinutes(bestDay.focusMinutes, 'en-US')} of dedicated attention.`,
          `Most of your focus happened during the ${blockName(dominant.key, 'en-US')}, while ${day} marked the week's peak at ${formatMinutes(bestDay.focusMinutes, 'en-US')}.`,
        ],
        seed,
        2,
      ),
    )
  }

  const executionParts: string[] = []

  if (
    report.tasks.created > 0 ||
    report.tasks.completed > 0
  ) {
    executionParts.push(
      `${report.tasks.created} tasks created and ${report.tasks.completed} completed`,
    )
  }

  if (report.projects.completed > 0) {
    executionParts.push(
      `${report.projects.completed} projects completed`,
    )
  }

  if (report.goals.completed > 0) {
    executionParts.push(
      `${report.goals.completed} goals achieved`,
    )
  }

  const recoveryActions =
    report.tasks.reopened +
    report.tasks.restored +
    report.projects.reopened +
    report.goals.reopened +
    report.rhythm.resumes

  if (executionParts.length > 0) {
    let ending = '.'

    if (recoveryActions > 0) {
      ending =
        `, while ${recoveryActions} returns show that interruption did not become abandonment.`
    } else if (
      report.rhythm.starts > 0
    ) {
      ending =
        `, with ${report.rhythm.completionRate}% of started cycles reaching completion.`
    }

    paragraphs.push(
      choose(
        [
          `In execution, you recorded ${executionParts.join(', ')}${ending}`,
          `Your concrete movement appeared through ${executionParts.join(', ')}${ending}`,
          `Between planning and finishing, the week left ${executionParts.join(', ')}${ending}`,
        ],
        seed,
        3,
      ),
    )
  } else if (recoveryActions > 0) {
    paragraphs.push(
      `Even without many recorded completions, you returned ${recoveryActions} times. Coming back to interrupted work is also an important form of continuity.`,
    )
  }

  return paragraphs
}

export function createFocusMeWeeklyNarrative(
  report: FocusMeWeeklyReport,
  locale: NarrativeLocale,
): FocusMeWeeklyNarrative {
  const seed =
    createSeed(report)

  return {
    paragraphs:
      locale === 'pt-BR'
        ? buildPortugueseNarrative(
            report,
            seed,
          )
        : buildEnglishNarrative(
            report,
            seed,
          ),
  }
}
