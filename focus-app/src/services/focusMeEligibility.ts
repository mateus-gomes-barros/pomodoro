import type {
  FocusMeMonthlyMetrics,
} from '@/services/focusMeMonthlyService'

export const FOCUSHOME_ELIGIBILITY_VERSION =
  1

const REQUIREMENTS = {
  activeDays: 8,
  completedSessions: 12,
  focusMinutes: 300,
  completedTasks: 6,
  meaningfulActions: 18,
  featureAreasUsed: 2,
} as const

export type FocusHomeEligibilityState =
  | 'building'
  | 'ready'
  | 'eligible'

export interface FocusHomeEligibilityCheck {
  key:
    keyof typeof REQUIREMENTS
  current: number
  required: number
  progress: number
  passed: boolean
}

export interface FocusHomeEligibility {
  version: number
  state:
    FocusHomeEligibilityState
  eligible: boolean
  readyForClosing: boolean
  progress: number
  checks:
    FocusHomeEligibilityCheck[]
}

function calculateProgress(
  current: number,
  required: number,
): number {
  if (required <= 0) {
    return 100
  }

  return Math.min(
    100,
    Math.round(
      (current / required) * 100,
    ),
  )
}

export function evaluateFocusHomeEligibility(
  metrics: FocusMeMonthlyMetrics,
  periodClosed = false,
): FocusHomeEligibility {
  const values = {
    activeDays:
      metrics.activeDays,
    completedSessions:
      metrics.completedSessions,
    focusMinutes:
      metrics.focusMinutes,
    completedTasks:
      metrics.tasks.completed,
    meaningfulActions:
      metrics.coverage
        .meaningfulActions,
    featureAreasUsed:
      metrics.coverage
        .featureAreasUsed,
  }

  const checks = (
    Object.keys(
      REQUIREMENTS,
    ) as Array<
      keyof typeof REQUIREMENTS
    >
  ).map((key) => {
    const current =
      values[key]

    const required =
      REQUIREMENTS[key]

    const progress =
      calculateProgress(
        current,
        required,
      )

    return {
      key,
      current,
      required,
      progress,
      passed:
        current >= required,
    }
  })

  const readyForClosing =
    checks.every(
      (check) => check.passed,
    )

  /*
   * A média usa pesos para evitar que
   * uma única métrica domine o avanço.
   * Todos os requisitos ainda precisam
   * ser atendidos para liberar a análise.
   */
  const weights: Record<
    keyof typeof REQUIREMENTS,
    number
  > = {
    activeDays: 0.2,
    completedSessions: 0.15,
    focusMinutes: 0.2,
    completedTasks: 0.2,
    meaningfulActions: 0.15,
    featureAreasUsed: 0.1,
  }

  const progress =
    Math.round(
      checks.reduce(
        (total, check) =>
          total +
          check.progress *
            weights[check.key],
        0,
      ),
    )

  const eligible =
    periodClosed &&
    readyForClosing

  const state:
    FocusHomeEligibilityState =
      eligible
        ? 'eligible'
        : readyForClosing
          ? 'ready'
          : 'building'

  return {
    version:
      FOCUSHOME_ELIGIBILITY_VERSION,
    state,
    eligible,
    readyForClosing,
    progress,
    checks,
  }
}
