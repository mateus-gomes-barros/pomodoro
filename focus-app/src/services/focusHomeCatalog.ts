import type {
  FocusHomeKey,
} from '@/components/focusme/FocusHomeSymbol'

export type FocusHomeArchetype =
  | 'visionary'
  | 'builder'
  | 'finisher'
  | 'executor'
  | 'organizer'
  | 'rhythmist'
  | 'restorer'
  | 'planner'
  | 'catalyst'
  | 'explorer'
  | 'strategist'
  | 'guardian'

export interface FocusHomeDefinition {
  key: FocusHomeKey
  archetype:
    FocusHomeArchetype
}

export const FOCUS_HOME_CATALOG:
  FocusHomeDefinition[] = [
    {
      key: 'aster',
      archetype: 'visionary',
    },
    {
      key: 'atlas',
      archetype: 'builder',
    },
    {
      key: 'forge',
      archetype: 'finisher',
    },
    {
      key: 'pulse',
      archetype: 'executor',
    },
    {
      key: 'loom',
      archetype: 'organizer',
    },
    {
      key: 'orbit',
      archetype: 'rhythmist',
    },
    {
      key: 'tide',
      archetype: 'restorer',
    },
    {
      key: 'ember',
      archetype: 'planner',
    },
    {
      key: 'nova',
      archetype: 'catalyst',
    },
    {
      key: 'prism',
      archetype: 'explorer',
    },
    {
      key: 'vanguard',
      archetype: 'strategist',
    },
    {
      key: 'verdant',
      archetype: 'guardian',
    },
  ]

export function getFocusHomeDefinition(
  key: FocusHomeKey,
): FocusHomeDefinition {
  const definition =
    FOCUS_HOME_CATALOG.find(
      (item) => item.key === key,
    )

  if (!definition) {
    throw new Error(
      `Unknown FocushoMe: ${key}`,
    )
  }

  return definition
}
