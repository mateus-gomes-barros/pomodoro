import {
  baseMetrics,
  blocks,
} from './focusHomeClassifierFixtures.ts'
import type {
  FocusHomeTemporalExpression,
  FocusHomeTrait,
  FocusMeMonthlyMetrics,
} from './focusHomeClassifier.ts'

export interface BehaviorFixture {
  key: string
  metrics:
    FocusMeMonthlyMetrics
  expectedTemporal?:
    FocusHomeTemporalExpression
  expectedTrait?:
    FocusHomeTrait
  expectedEligible?: boolean
  maxScoreGap?: number
}

function fixture(
  key: string,
  mutate: (
    metrics:
      FocusMeMonthlyMetrics,
  ) => void,
  expectations:
    Omit<
      BehaviorFixture,
      'key' | 'metrics'
    >,
): BehaviorFixture {
  const metrics =
    baseMetrics()

  mutate(metrics)

  return {
    key,
    metrics,
    ...expectations,
  }
}

export const FOCUS_HOME_BEHAVIOR_FIXTURES:
  BehaviorFixture[] = [
    fixture(
      'planeja à noite e executa de manhã',
      (metrics) => {
        metrics.behavior
          .planningTimeBlocks =
          blocks(1, 1, 4, 16)
        metrics.behavior
          .executionTimeBlocks =
          blocks(15, 2, 1, 1)
        metrics.timeBlocks =
          blocks(480, 60, 30, 30)
        metrics.dominantTimeBlock =
          'morning'
      },
      {
        expectedTemporal: 'aurora',
        expectedTrait:
          'night_planner_morning_executor',
      },
    ),

    fixture(
      'planeja de manhã e executa à noite',
      (metrics) => {
        metrics.behavior
          .planningTimeBlocks =
          blocks(15, 2, 1, 0)
        metrics.behavior
          .executionTimeBlocks =
          blocks(1, 2, 15, 1)
        metrics.timeBlocks =
          blocks(50, 50, 460, 40)
        metrics.dominantTimeBlock =
          'evening'
      },
      {
        expectedTemporal: 'vesper',
        expectedTrait:
          'morning_planner_night_executor',
      },
    ),

    fixture(
      'muitas metas ainda abertas',
      (metrics) => {
        metrics.goals.created = 5
        metrics.goals.completed = 0
      },
      {
        expectedTrait:
          'goal_rich_open_horizons',
      },
    ),

    fixture(
      'foco concentrado em um projeto',
      (metrics) => {
        metrics.behavior
          .projectFocusShare = 88
      },
      {
        expectedTrait:
          'project_concentrated',
      },
    ),

    fixture(
      'finalizador de urgências',
      (metrics) => {
        metrics.tasks.categories = [
          {
            category: 'quick',
            created: 1,
            completed: 1,
          },
          {
            category: 'planned',
            created: 2,
            completed: 2,
          },
          {
            category: 'urgent',
            created: 10,
            completed: 9,
          },
          {
            category: 'long_term',
            created: 0,
            completed: 0,
          },
        ]
      },
      {
        expectedTrait:
          'urgent_closer',
      },
    ),

    fixture(
      'horizonte longo',
      (metrics) => {
        metrics.tasks.categories = [
          {
            category: 'quick',
            created: 1,
            completed: 1,
          },
          {
            category: 'planned',
            created: 2,
            completed: 2,
          },
          {
            category: 'urgent',
            created: 0,
            completed: 0,
          },
          {
            category: 'long_term',
            created: 10,
            completed: 8,
          },
        ]
      },
      {
        expectedTrait:
          'long_horizon',
      },
    ),

    fixture(
      'resolvedor rápido',
      (metrics) => {
        metrics.tasks.categories = [
          {
            category: 'quick',
            created: 14,
            completed: 13,
          },
          {
            category: 'planned',
            created: 2,
            completed: 1,
          },
          {
            category: 'urgent',
            created: 0,
            completed: 0,
          },
          {
            category: 'long_term',
            created: 0,
            completed: 0,
          },
        ]
      },
      {
        expectedTrait:
          'quick_solver',
      },
    ),

    fixture(
      'retorna após interrupções',
      (metrics) => {
        metrics.behavior
          .recoveryActions = 9
      },
      {
        expectedTrait:
          'comeback_pattern',
      },
    ),

    fixture(
      'constância entre semanas',
      (metrics) => {
        metrics.activeDays = 18
        metrics.behavior
          .strongestWeekShare = 28
      },
      {
        expectedTrait:
          'steady_weeks',
      },
    ),

    fixture(
      'produtividade em picos',
      (metrics) => {
        metrics.behavior
          .strongestWeekShare = 72
      },
      {
        expectedTrait:
          'peak_driven',
      },
    ),

    fixture(
      'ritmo temporal equilibrado',
      (metrics) => {
        metrics.timeBlocks =
          blocks(150, 150, 150, 150)
        metrics.dominantTimeBlock =
          null
      },
      {
        expectedTemporal:
          'equinox',
      },
    ),

    fixture(
      'madrugada predominante',
      (metrics) => {
        metrics.timeBlocks =
          blocks(30, 30, 60, 480)
        metrics.dominantTimeBlock =
          'late_night'
      },
      {
        expectedTemporal:
          'lunaris',
      },
    ),

    fixture(
      'dados insuficientes',
      (metrics) => {
        metrics.focusMinutes = 25
        metrics.completedSessions = 1
        metrics.activeDays = 1
        metrics.tasks.created = 1
        metrics.tasks.completed = 0
        metrics.projects.created = 0
        metrics.projects.completed = 0
        metrics.goals.created = 0
        metrics.goals.completed = 0
        metrics.coverage
          .meaningfulActions = 1
        metrics.coverage
          .featureAreasUsed = 1
        metrics.coverage
          .activityEvents = 2
      },
      {
        expectedEligible: false,
      },
    ),

    fixture(
      'perfil intencionalmente ambíguo',
      (metrics) => {
        metrics.activeDays = 16
        metrics.focusMinutes = 900
        metrics.completedSessions = 24
        metrics.behavior
          .projectFocusShare = 60
        metrics.behavior
          .strongestWeekShare = 32
        metrics.behavior
          .completionBalance = 100
        metrics.tasks.categories = [
          {
            category: 'quick',
            created: 3,
            completed: 3,
          },
          {
            category: 'planned',
            created: 4,
            completed: 4,
          },
          {
            category: 'urgent',
            created: 2,
            completed: 2,
          },
          {
            category: 'long_term',
            created: 5,
            completed: 5,
          },
        ]
      },
      {
        maxScoreGap: 12,
      },
    ),
  ]
