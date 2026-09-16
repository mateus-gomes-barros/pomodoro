export type StreakBadge = {
    minimumDays: number
    name: string
    description: string
  }
  
  export const STREAK_BADGES: StreakBadge[] = [
    {
      minimumDays: 0,
      name: 'First Drop',
      description:
        'Begin your focus journey.',
    },
    {
      minimumDays: 3,
      name: 'First Steps',
      description:
        'Maintain a 3-day streak.',
    },
    {
      minimumDays: 7,
      name: 'On Fire',
      description:
        'Maintain a 7-day streak.',
    },
    {
      minimumDays: 14,
      name: 'Flame Keeper',
      description:
        'Maintain a 14-day streak.',
    },
    {
      minimumDays: 30,
      name: 'Momentum',
      description:
        'Maintain a 30-day streak.',
    },
    {
      minimumDays: 50,
      name: 'Liftoff',
      description:
        'Maintain a 50-day streak.',
    },
    {
      minimumDays: 75,
      name: 'Steady Orbit',
      description:
        'Maintain a 75-day streak.',
    },
    {
      minimumDays: 100,
      name: 'Focus Star',
      description:
        'Maintain a 100-day streak.',
    },
    {
      minimumDays: 150,
      name: 'Bright Mind',
      description:
        'Maintain a 150-day streak.',
    },
    {
      minimumDays: 200,
      name: 'Focus Champion',
      description:
        'Maintain a 200-day streak.',
    },
    {
      minimumDays: 300,
      name: 'Bronze Master',
      description:
        'Maintain a 300-day streak.',
    },
    {
      minimumDays: 365,
      name: 'Year of Focus',
      description:
        'Maintain a full 365-day streak.',
    },
    {
      minimumDays: 500,
      name: 'Golden Focus',
      description:
        'Maintain a 500-day streak.',
    },
    {
      minimumDays: 600,
      name: 'Diamond Mind',
      description:
        'Maintain a 600-day streak.',
    },
    {
      minimumDays: 750,
      name: 'Focus Sage',
      description:
        'Maintain a 750-day streak.',
    },
    {
      minimumDays: 1000,
      name: 'Focus Legend',
      description:
        'Maintain a 1,000-day streak.',
    },
    {
      minimumDays: 1500,
      name: 'Grandmaster',
      description:
        'Maintain a 1,500-day streak.',
    },
    {
      minimumDays: 2000,
      name: 'Infinite Focus',
      description:
        'Maintain a 2,000-day streak.',
    },
  ]
  
  export function getStreakBadge(
    streakDays: number,
  ): StreakBadge {
    const normalizedDays = Math.max(
      0,
      streakDays,
    )
  
    return (
      [...STREAK_BADGES]
        .reverse()
        .find(
          (badge) =>
            normalizedDays >=
            badge.minimumDays,
        ) ?? STREAK_BADGES[0]
    )
  }
  
  export function getNextStreakBadge(
    streakDays: number,
  ): StreakBadge | null {
    const normalizedDays = Math.max(
      0,
      streakDays,
    )
  
    return (
      STREAK_BADGES.find(
        (badge) =>
          badge.minimumDays >
          normalizedDays,
      ) ?? null
    )
  }
  
  export function getStreakBadgeProgress(
    streakDays: number,
  ): number {
    const normalizedDays = Math.max(
      0,
      streakDays,
    )
  
    const currentBadge =
      getStreakBadge(normalizedDays)
  
    const nextBadge =
      getNextStreakBadge(normalizedDays)
  
    if (!nextBadge) {
      return 1
    }
  
    const levelRange =
      nextBadge.minimumDays -
      currentBadge.minimumDays
  
    const daysInCurrentLevel =
      normalizedDays -
      currentBadge.minimumDays
  
    if (levelRange <= 0) {
      return 0
    }
  
    return Math.min(
      Math.max(
        daysInCurrentLevel /
          levelRange,
        0,
      ),
      1,
    )
  }