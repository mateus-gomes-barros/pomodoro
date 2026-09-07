import type {
  FocusHomeKey,
} from '@/components/focusme/FocusHomeSymbol'
import type {
  FocusMeMonthlyMetrics,
  TimeBlock,
} from '@/services/focusMeMonthlyService'

export interface FocusHomeFixture {
  key: string
  expected: FocusHomeKey
  metrics:
    FocusMeMonthlyMetrics
}

export function blocks(
  morning = 0,
  afternoon = 0,
  evening = 0,
  lateNight = 0,
): Record<TimeBlock, number> {
  return {
    morning,
    afternoon,
    evening,
    late_night: lateNight,
  }
}

export function baseMetrics():
  FocusMeMonthlyMetrics {
  return {
    focusMinutes: 600,
    completedSessions: 20,
    activeDays: 10,
    averageMinutesPerActiveDay: 60,
    weeks: [
      {
        week: 1,
        focusMinutes: 150,
        sessions: 5,
      },
      {
        week: 2,
        focusMinutes: 150,
        sessions: 5,
      },
      {
        week: 3,
        focusMinutes: 150,
        sessions: 5,
      },
      {
        week: 4,
        focusMinutes: 150,
        sessions: 5,
      },
    ],
    timeBlocks:
      blocks(150, 150, 150, 150),
    dominantTimeBlock: null,

    tasks: {
      created: 10,
      completed: 10,
      reopened: 0,
      deleted: 0,
      restored: 0,
      categories: [
        {
          category: 'quick',
          created: 2,
          completed: 2,
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
          created: 2,
          completed: 2,
        },
      ],
    },

    projects: {
      created: 1,
      completed: 1,
      reopened: 0,
      topProjects: [
        {
          id: 'project-1',
          name: 'Project',
          emoji: '•',
          color: '#34D399',
          focusMinutes: 300,
          sessions: 10,
        },
      ],
    },

    goals: {
      created: 1,
      completed: 1,
      reopened: 0,
    },

    rhythm: {
      starts: 20,
      pauses: 2,
      resumes: 2,
      abandoned: 1,
    },

    behavior: {
      planningTimeBlocks:
        blocks(3, 3, 3, 3),
      executionTimeBlocks:
        blocks(3, 3, 3, 3),
      taskCreationTimeBlocks:
        blocks(2, 3, 3, 2),
      taskCompletionTimeBlocks:
        blocks(2, 3, 3, 2),
      projectCreationTimeBlocks:
        blocks(1, 0, 0, 0),
      goalCreationTimeBlocks:
        blocks(0, 1, 0, 0),
      categoryDiversity: 4,
      focusTimeDiversity: 4,
      projectFocusShare: 50,
      strongestWeekShare: 25,
      completionBalance: 100,
      abandonmentRate: 5,
      recoveryActions: 2,
    },

    coverage: {
      meaningfulActions: 32,
      featureAreasUsed: 4,
      activityEvents: 50,
    },
  }
}

function fixture(
  key: string,
  expected: FocusHomeKey,
  mutate: (
    metrics:
      FocusMeMonthlyMetrics,
  ) => void,
): FocusHomeFixture {
  const metrics =
    baseMetrics()

  mutate(metrics)

  return {
    key,
    expected,
    metrics,
  }
}

export const FOCUS_HOME_FIXTURES:
  FocusHomeFixture[] = [
    fixture(
      'visionary',
      'aster',
      (metrics) => {
        metrics.goals.created = 5
        metrics.goals.completed = 0
        metrics.projects.created = 4
        metrics.projects.completed = 0
        metrics.tasks.created = 24
        metrics.tasks.completed = 5
        metrics.behavior
          .completionBalance = 21
        metrics.behavior
          .planningTimeBlocks =
          blocks(2, 3, 12, 10)
        metrics.tasks.categories = [
          {
            category: 'quick',
            created: 1,
            completed: 0,
          },
          {
            category: 'planned',
            created: 9,
            completed: 2,
          },
          {
            category: 'urgent',
            created: 1,
            completed: 1,
          },
          {
            category: 'long_term',
            created: 13,
            completed: 2,
          },
        ]
      },
    ),

    fixture(
      'builder',
      'atlas',
      (metrics) => {
        metrics.focusMinutes = 1800
        metrics.completedSessions = 40
        metrics.activeDays = 16
        metrics.behavior
          .projectFocusShare = 92
        metrics.projects.topProjects[0]
          .focusMinutes = 1656
        metrics.tasks.categories = [
          {
            category: 'quick',
            created: 0,
            completed: 0,
          },
          {
            category: 'planned',
            created: 3,
            completed: 3,
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
    ),

    fixture(
      'finisher',
      'forge',
      (metrics) => {
        metrics.tasks.created = 12
        metrics.tasks.completed = 24
        metrics.projects.completed = 3
        metrics.goals.completed = 2
        metrics.behavior
          .completionBalance = 200
        metrics.behavior
          .executionTimeBlocks =
          blocks(8, 8, 8, 8)
        metrics.rhythm.abandoned = 0
        metrics.behavior
          .abandonmentRate = 0
      },
    ),

    fixture(
      'quick-executor',
      'pulse',
      (metrics) => {
        metrics.focusMinutes = 480
        metrics.completedSessions = 32
        metrics.tasks.created = 28
        metrics.tasks.completed = 27
        metrics.tasks.categories = [
          {
            category: 'quick',
            created: 25,
            completed: 24,
          },
          {
            category: 'planned',
            created: 2,
            completed: 2,
          },
          {
            category: 'urgent',
            created: 1,
            completed: 1,
          },
          {
            category: 'long_term',
            created: 0,
            completed: 0,
          },
        ]
        metrics.behavior
          .categoryDiversity = 3
      },
    ),

    fixture(
      'integrator',
      'loom',
      (metrics) => {
        metrics.coverage
          .featureAreasUsed = 4
        metrics.behavior
          .categoryDiversity = 4
        metrics.behavior
          .completionBalance = 100
        metrics.projects.created = 3
        metrics.projects.completed = 2
        metrics.goals.created = 2
        metrics.goals.completed = 2
        metrics.projects.topProjects = [
          {
            id: 'p1',
            name: 'One',
            emoji: '•',
            color: '#34D399',
            focusMinutes: 210,
            sessions: 7,
          },
          {
            id: 'p2',
            name: 'Two',
            emoji: '•',
            color: '#34D399',
            focusMinutes: 200,
            sessions: 7,
          },
          {
            id: 'p3',
            name: 'Three',
            emoji: '•',
            color: '#34D399',
            focusMinutes: 190,
            sessions: 6,
          },
        ]
        metrics.behavior
          .projectFocusShare = 35
      },
    ),

    fixture(
      'rhythmist',
      'orbit',
      (metrics) => {
        metrics.activeDays = 24
        metrics.completedSessions = 32
        metrics.behavior
          .strongestWeekShare = 24
        metrics.behavior
          .abandonmentRate = 0
        metrics.rhythm.abandoned = 0
      },
    ),

    fixture(
      'restorer',
      'tide',
      (metrics) => {
        metrics.behavior
          .recoveryActions = 12
        metrics.behavior
          .focusTimeDiversity = 4
        metrics.tasks.reopened = 4
        metrics.tasks.restored = 3
        metrics.projects.reopened = 2
        metrics.goals.reopened = 1
        metrics.rhythm.resumes = 8
      },
    ),

    fixture(
      'planner',
      'ember',
      (metrics) => {
        metrics.focusMinutes = 1000
        metrics.completedSessions = 20
        metrics.tasks.created = 7
        metrics.tasks.completed = 6
        metrics.behavior
          .planningTimeBlocks =
          blocks(2, 3, 14, 9)
        metrics.tasks.categories = [
          {
            category: 'quick',
            created: 0,
            completed: 0,
          },
          {
            category: 'planned',
            created: 12,
            completed: 10,
          },
          {
            category: 'urgent',
            created: 0,
            completed: 0,
          },
          {
            category: 'long_term',
            created: 2,
            completed: 2,
          },
        ]
        metrics.behavior
          .categoryDiversity = 2
      },
    ),

    fixture(
      'catalyst',
      'nova',
      (metrics) => {
        metrics.tasks.created = 30
        metrics.tasks.completed = 5
        metrics.projects.created = 6
        metrics.projects.completed = 0
        metrics.goals.created = 4
        metrics.goals.completed = 0
        metrics.behavior
          .completionBalance = 17
        metrics.behavior
          .strongestWeekShare = 78
        metrics.behavior
          .planningTimeBlocks =
          blocks(5, 5, 5, 5)
      },
    ),

    fixture(
      'explorer',
      'prism',
      (metrics) => {
        metrics.behavior
          .categoryDiversity = 4
        metrics.behavior
          .focusTimeDiversity = 4
        metrics.behavior
          .projectFocusShare = 24
        metrics.coverage
          .featureAreasUsed = 4
        metrics.projects.topProjects = [
          {
            id: 'p1',
            name: 'One',
            emoji: '•',
            color: '#34D399',
            focusMinutes: 160,
            sessions: 5,
          },
          {
            id: 'p2',
            name: 'Two',
            emoji: '•',
            color: '#34D399',
            focusMinutes: 150,
            sessions: 5,
          },
          {
            id: 'p3',
            name: 'Three',
            emoji: '•',
            color: '#34D399',
            focusMinutes: 140,
            sessions: 5,
          },
        ]
      },
    ),

    fixture(
      'strategist',
      'vanguard',
      (metrics) => {
        metrics.tasks.created = 18
        metrics.tasks.completed = 17
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
            created: 15,
            completed: 14,
          },
          {
            category: 'long_term',
            created: 0,
            completed: 0,
          },
        ]
        metrics.behavior
          .categoryDiversity = 3
        metrics.behavior
          .strongestWeekShare = 65
        metrics.behavior
          .executionTimeBlocks =
          blocks(8, 8, 8, 8)
      },
    ),

    fixture(
      'guardian',
      'verdant',
      (metrics) => {
        metrics.activeDays = 20
        metrics.behavior
          .strongestWeekShare = 26
        metrics.projects.completed = 2
        metrics.goals.completed = 1
        metrics.tasks.categories = [
          {
            category: 'quick',
            created: 0,
            completed: 0,
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
            created: 14,
            completed: 12,
          },
        ]
        metrics.behavior
          .categoryDiversity = 2
      },
    ),
  ]
