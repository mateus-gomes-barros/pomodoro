import type {
  FocusHomeKey,
} from '@/components/focusme/FocusHomeSymbol'
import {
  FOCUS_HOME_CATALOG,
  getFocusHomeDefinition,
  type FocusHomeArchetype,
} from '@/services/focusHomeCatalog'
import type {
  FocusMeMonthlyMetrics,
  TimeBlock,
} from '@/services/focusMeMonthlyService'

export const FOCUS_HOME_CLASSIFIER_VERSION =
  1

export type FocusHomeTemporalExpression =
  | 'aurora'
  | 'solaris'
  | 'vesper'
  | 'lunaris'
  | 'equinox'

export type FocusHomeTrait =
  | 'night_planner_morning_executor'
  | 'morning_planner_night_executor'
  | 'goal_rich_open_horizons'
  | 'task_driven'
  | 'project_concentrated'
  | 'category_explorer'
  | 'comeback_pattern'
  | 'urgent_closer'
  | 'long_horizon'
  | 'quick_solver'
  | 'deep_sessions'
  | 'steady_weeks'
  | 'peak_driven'

export interface FocusHomeScore {
  key: FocusHomeKey
  archetype:
    FocusHomeArchetype
  score: number
}

export interface FocusHomeEvidence {
  key: string
  value: number | string
}

export interface FocusHomeClassification {
  version: number
  focusHome: FocusHomeKey
  archetype:
    FocusHomeArchetype
  secondaryArchetype:
    FocusHomeArchetype
  temporalExpression:
    FocusHomeTemporalExpression
  traits: FocusHomeTrait[]
  confidence: number
  scoreGap: number
  scores: FocusHomeScore[]
  evidence: FocusHomeEvidence[]
}

function clamp(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(100, value),
  )
}

function scale(
  value: number,
  target: number,
): number {
  if (target <= 0) {
    return 0
  }

  return clamp(
    (value / target) * 100,
  )
}

function inverse(
  value: number,
): number {
  return clamp(100 - value)
}

function weighted(
  signals: Array<
    [number, number]
  >,
): number {
  const totalWeight =
    signals.reduce(
      (total, [, weight]) =>
        total + weight,
      0,
    )

  if (totalWeight === 0) {
    return 0
  }

  return Math.round(
    signals.reduce(
      (
        total,
        [signal, weight],
      ) =>
        total +
        clamp(signal) * weight,
      0,
    ) / totalWeight,
  )
}

function sumTimeBlocks(
  blocks: Record<
    TimeBlock,
    number
  >,
): number {
  return Object.values(
    blocks,
  ).reduce(
    (total, value) =>
      total + value,
    0,
  )
}

function dominantBlock(
  blocks: Record<
    TimeBlock,
    number
  >,
): {
  block: TimeBlock
  share: number
} | null {
  const total =
    sumTimeBlocks(blocks)

  if (total === 0) {
    return null
  }

  const entries =
    Object.entries(blocks) as Array<
      [TimeBlock, number]
    >

  const strongest =
    [...entries].sort(
      (first, second) =>
        second[1] - first[1],
    )[0]

  return {
    block: strongest[0],
    share: Math.round(
      (
        strongest[1] /
        total
      ) * 100,
    ),
  }
}

function categoryShare(
  metrics: FocusMeMonthlyMetrics,
  category:
    | 'quick'
    | 'planned'
    | 'urgent'
    | 'long_term',
): number {
  const categories =
    metrics.tasks.categories

  const total =
    categories.reduce(
      (sum, item) =>
        sum +
        item.created +
        item.completed,
      0,
    )

  if (total === 0) {
    return 0
  }

  const selected =
    categories.find(
      (item) =>
        item.category === category,
    )

  if (!selected) {
    return 0
  }

  return Math.round(
    (
      (
        selected.created +
        selected.completed
      ) /
      total
    ) * 100,
  )
}

function categoryCompletionShare(
  metrics: FocusMeMonthlyMetrics,
  category:
    | 'quick'
    | 'planned'
    | 'urgent'
    | 'long_term',
): number {
  const total =
    metrics.tasks.categories.reduce(
      (sum, item) =>
        sum + item.completed,
      0,
    )

  if (total === 0) {
    return 0
  }

  const selected =
    metrics.tasks.categories.find(
      (item) =>
        item.category === category,
    )

  return selected
    ? Math.round(
        (
          selected.completed /
          total
        ) * 100,
      )
    : 0
}

function getTemporalExpression(
  metrics: FocusMeMonthlyMetrics,
): FocusHomeTemporalExpression {
  const dominant =
    dominantBlock(
      metrics.timeBlocks,
    )

  if (
    !dominant ||
    dominant.share < 40
  ) {
    return 'equinox'
  }

  switch (dominant.block) {
    case 'morning':
      return 'aurora'

    case 'afternoon':
      return 'solaris'

    case 'evening':
      return 'vesper'

    case 'late_night':
      return 'lunaris'
  }
}

function detectTraits(
  metrics: FocusMeMonthlyMetrics,
): FocusHomeTrait[] {
  const traits:
    FocusHomeTrait[] = []

  const planning =
    dominantBlock(
      metrics.behavior
        .planningTimeBlocks,
    )

  const execution =
    dominantBlock(
      metrics.behavior
        .executionTimeBlocks,
    )

  if (
    planning?.block ===
      'late_night' &&
    execution?.block === 'morning'
  ) {
    traits.push(
      'night_planner_morning_executor',
    )
  }

  if (
    planning?.block === 'morning' &&
    (
      execution?.block ===
        'evening' ||
      execution?.block ===
        'late_night'
    )
  ) {
    traits.push(
      'morning_planner_night_executor',
    )
  }

  if (
    metrics.goals.created >= 2 &&
    metrics.goals.completed === 0
  ) {
    traits.push(
      'goal_rich_open_horizons',
    )
  }

  if (
    metrics.tasks.created +
      metrics.tasks.completed >=
    16
  ) {
    traits.push('task_driven')
  }

  if (
    metrics.behavior
      .projectFocusShare >= 65
  ) {
    traits.push(
      'project_concentrated',
    )
  }

  if (
    metrics.behavior
      .categoryDiversity >= 4
  ) {
    traits.push(
      'category_explorer',
    )
  }

  if (
    metrics.behavior
      .recoveryActions >= 3
  ) {
    traits.push(
      'comeback_pattern',
    )
  }

  if (
    categoryCompletionShare(
      metrics,
      'urgent',
    ) >= 35
  ) {
    traits.push(
      'urgent_closer',
    )
  }

  if (
    categoryShare(
      metrics,
      'long_term',
    ) >= 30
  ) {
    traits.push(
      'long_horizon',
    )
  }

  if (
    categoryShare(
      metrics,
      'quick',
    ) >= 40
  ) {
    traits.push(
      'quick_solver',
    )
  }

  const averageSession =
    metrics.completedSessions > 0
      ? (
          metrics.focusMinutes /
          metrics.completedSessions
        )
      : 0

  if (averageSession >= 35) {
    traits.push(
      'deep_sessions',
    )
  }

  if (
    metrics.activeDays >= 12 &&
    metrics.behavior
      .strongestWeekShare <= 40
  ) {
    traits.push(
      'steady_weeks',
    )
  }

  if (
    metrics.behavior
      .strongestWeekShare >= 60
  ) {
    traits.push(
      'peak_driven',
    )
  }

  return traits.slice(0, 5)
}

export function classifyFocusHome(
  metrics: FocusMeMonthlyMetrics,
): FocusHomeClassification {
  const quickShare =
    categoryShare(
      metrics,
      'quick',
    )

  const plannedShare =
    categoryShare(
      metrics,
      'planned',
    )

  const urgentShare =
    categoryShare(
      metrics,
      'urgent',
    )

  const longTermShare =
    categoryShare(
      metrics,
      'long_term',
    )

  const urgentCompletion =
    categoryCompletionShare(
      metrics,
      'urgent',
    )

  const longTermCompletion =
    categoryCompletionShare(
      metrics,
      'long_term',
    )

  const averageSession =
    metrics.completedSessions > 0
      ? (
          metrics.focusMinutes /
          metrics.completedSessions
        )
      : 0

  const planningEvents =
    sumTimeBlocks(
      metrics.behavior
        .planningTimeBlocks,
    )

  const executionEvents =
    sumTimeBlocks(
      metrics.behavior
        .executionTimeBlocks,
    )

  const creationSurplus =
    metrics.tasks.created > 0
      ? clamp(
          (
            (
              metrics.tasks.created -
              metrics.tasks.completed
            ) /
            metrics.tasks.created
          ) * 100,
        )
      : 0

  const balancedCompletion =
    inverse(
      Math.abs(
        100 -
        metrics.behavior
          .completionBalance,
      ),
    )

  const consistency =
    clamp(
      (
        100 -
        metrics.behavior
          .strongestWeekShare
      ) * 1.5,
    )

  const lowAbandonment =
    inverse(
      metrics.behavior
        .abandonmentRate,
    )

  const volume =
    scale(
      metrics.tasks.created +
        metrics.tasks.completed,
      24,
    )

  const scores: Record<
    FocusHomeKey,
    number
  > = {
    aster: weighted([
      [
        scale(
          metrics.goals.created,
          3,
        ),
        0.28,
      ],
      [
        scale(
          metrics.projects.created,
          4,
        ),
        0.18,
      ],
      [creationSurplus, 0.22],
      [
        scale(planningEvents, 12),
        0.17,
      ],
      [longTermShare, 0.15],
    ]),

    atlas: weighted([
      [
        metrics.behavior
          .projectFocusShare,
        0.35,
      ],
      [
        scale(
          metrics.focusMinutes,
          1200,
        ),
        0.2,
      ],
      [
        scale(averageSession, 40),
        0.2,
      ],
      [longTermShare, 0.15],
      [
        scale(
          metrics.projects.completed,
          2,
        ),
        0.1,
      ],
    ]),

    forge: weighted([
      [
        metrics.behavior
          .completionBalance,
        0.26,
      ],
      [
        scale(
          metrics.tasks.completed,
          18,
        ),
        0.18,
      ],
      [
        scale(
          metrics.projects.completed +
            metrics.goals.completed,
          3,
        ),
        0.16,
      ],
      [lowAbandonment, 0.1],
      [
        scale(executionEvents, 15),
        0.1,
      ],
      [
        inverse(urgentCompletion),
        0.2,
      ],
    ]),

    pulse: weighted([
      [quickShare, 0.3],
      [volume, 0.28],
      [
        inverse(
          scale(averageSession, 50),
        ),
        0.17,
      ],
      [
        scale(
          metrics.completedSessions,
          24,
        ),
        0.15,
      ],
      [
        scale(
          metrics.tasks.completed,
          20,
        ),
        0.1,
      ],
    ]),

    loom: weighted([
      [
        scale(
          metrics.coverage
            .featureAreasUsed,
          4,
        ),
        0.3,
      ],
      [
        scale(
          metrics.behavior
            .categoryDiversity,
          4,
        ),
        0.22,
      ],
      [balancedCompletion, 0.2],
      [
        scale(
          metrics.projects
            .topProjects.length,
          3,
        ),
        0.13,
      ],
      [
        scale(
          metrics.goals.created +
            metrics.goals.completed,
          3,
        ),
        0.15,
      ],
    ]),

    orbit: weighted([
      [
        scale(
          metrics.activeDays,
          20,
        ),
        0.28,
      ],
      [consistency, 0.25],
      [lowAbandonment, 0.18],
      [
        scale(
          metrics.completedSessions,
          24,
        ),
        0.12,
      ],
      [
        inverse(longTermShare),
        0.08,
      ],
      [
        inverse(
          metrics.behavior
            .projectFocusShare,
        ),
        0.09,
      ],
    ]),

    tide: weighted([
      [
        scale(
          metrics.behavior
            .recoveryActions,
          8,
        ),
        0.38,
      ],
      [
        scale(
          metrics.behavior
            .focusTimeDiversity,
          4,
        ),
        0.22,
      ],
      [
        scale(
          metrics.tasks.reopened +
            metrics.projects.reopened +
            metrics.goals.reopened,
          5,
        ),
        0.2,
      ],
      [
        scale(
          metrics.rhythm.resumes,
          6,
        ),
        0.2,
      ],
    ]),

    ember: weighted([
      [plannedShare, 0.24],
      [
        scale(planningEvents, 16),
        0.25,
      ],
      [
        scale(averageSession, 45),
        0.22,
      ],
      [
        inverse(volume),
        0.12,
      ],
      [
        scale(
          metrics.focusMinutes,
          900,
        ),
        0.17,
      ],
    ]),

    nova: weighted([
      [creationSurplus, 0.3],
      [
        scale(
          metrics.projects.created +
            metrics.goals.created,
          6,
        ),
        0.25,
      ],
      [
        scale(
          metrics.tasks.created,
          20,
        ),
        0.2,
      ],
      [
        metrics.behavior
          .strongestWeekShare,
        0.15,
      ],
      [
        scale(planningEvents, 15),
        0.1,
      ],
    ]),

    prism: weighted([
      [
        scale(
          metrics.behavior
            .categoryDiversity,
          4,
        ),
        0.3,
      ],
      [
        scale(
          metrics.behavior
            .focusTimeDiversity,
          4,
        ),
        0.25,
      ],
      [
        inverse(
          metrics.behavior
            .projectFocusShare,
        ),
        0.18,
      ],
      [
        scale(
          metrics.projects
            .topProjects.length,
          3,
        ),
        0.12,
      ],
      [
        scale(
          metrics.coverage
            .featureAreasUsed,
          4,
        ),
        0.15,
      ],
    ]),

    vanguard: weighted([
      [
        scale(
          urgentShare,
          70,
        ),
        0.34,
      ],
      [
        scale(
          urgentCompletion,
          70,
        ),
        0.32,
      ],
      [
        scale(
          metrics.behavior
            .strongestWeekShare,
          65,
        ),
        0.17,
      ],
      [
        scale(executionEvents, 15),
        0.17,
      ],
    ]),

    verdant: weighted([
      [longTermShare, 0.25],
      [longTermCompletion, 0.2],
      [
        scale(
          metrics.activeDays,
          18,
        ),
        0.2,
      ],
      [consistency, 0.2],
      [
        scale(
          metrics.projects.completed +
            metrics.goals.completed,
          3,
        ),
        0.15,
      ],
    ]),
  }

  const ranked =
    FOCUS_HOME_CATALOG
      .map((definition) => ({
        key: definition.key,
        archetype:
          definition.archetype,
        score:
          scores[definition.key],
      }))
      .sort(
        (first, second) =>
          second.score -
          first.score,
      )

  const primary = ranked[0]
  const secondary =
    ranked[1]

  const scoreGap =
    primary.score -
    secondary.score

  const dataDepth =
    clamp(
      (
        metrics.coverage
          .meaningfulActions /
        35
      ) * 100,
    )

  const confidence =
    Math.round(
      Math.min(
        96,
        48 +
          scoreGap * 1.2 +
          dataDepth * 0.32,
      ),
    )

  const evidence:
    FocusHomeEvidence[] = [
      {
        key: 'primary_score',
        value: primary.score,
      },
      {
        key: 'score_gap',
        value: scoreGap,
      },
      {
        key: 'active_days',
        value:
          metrics.activeDays,
      },
      {
        key: 'focus_minutes',
        value:
          metrics.focusMinutes,
      },
      {
        key: 'completion_balance',
        value:
          metrics.behavior
            .completionBalance,
      },
      {
        key: 'project_focus_share',
        value:
          metrics.behavior
            .projectFocusShare,
      },
    ]

  return {
    version:
      FOCUS_HOME_CLASSIFIER_VERSION,
    focusHome: primary.key,
    archetype:
      primary.archetype,
    secondaryArchetype:
      getFocusHomeDefinition(
        secondary.key,
      ).archetype,
    temporalExpression:
      getTemporalExpression(
        metrics,
      ),
    traits:
      detectTraits(metrics),
    confidence,
    scoreGap,
    scores: ranked,
    evidence,
  }
}
