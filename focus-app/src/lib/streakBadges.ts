export type StreakBadge = {
    minimumDays: number
    nativeSymbol: string
    name: string
    description: string
  }
  
  export const STREAK_BADGES: StreakBadge[] = [
    {
      minimumDays: 0,
      nativeSymbol: '•',
      name: 'First Drop',
      description:
        'Begin your focus journey.',
    },
    {
      minimumDays: 3,
      nativeSymbol: 'Y',
      name: 'First Steps',
      description:
        'Maintain a 3-day streak.',
    },
    {
      minimumDays: 7,
      nativeSymbol: '△',
      name: 'On Fire',
      description:
        'Maintain a 7-day streak.',
    },
    {
      minimumDays: 14,
      nativeSymbol: '♡',
      name: 'Flame Keeper',
      description:
        'Maintain a 14-day streak.',
    },
    {
      minimumDays: 30,
      nativeSymbol: 'ϟ',
      name: 'Momentum',
      description:
        'Maintain a 30-day streak.',
    },
    {
      minimumDays: 50,
      nativeSymbol: '↑',
      name: 'Liftoff',
      description:
        'Maintain a 50-day streak.',
    },
    {
      minimumDays: 75,
      nativeSymbol: '○',
      name: 'Steady Orbit',
      description:
        'Maintain a 75-day streak.',
    },
    {
      minimumDays: 100,
      nativeSymbol: '✦',
      name: 'Focus Star',
      description:
        'Maintain a 100-day streak.',
    },
    {
      minimumDays: 150,
      nativeSymbol: '✧',
      name: 'Bright Mind',
      description:
        'Maintain a 150-day streak.',
    },
    {
      minimumDays: 200,
      nativeSymbol: '◎',
      name: 'Focus Champion',
      description:
        'Maintain a 200-day streak.',
    },
    {
      minimumDays: 300,
      nativeSymbol: 'III',
      name: 'Bronze Master',
      description:
        'Maintain a 300-day streak.',
    },
    {
      minimumDays: 365,
      nativeSymbol: '365',
      name: 'Year of Focus',
      description:
        'Maintain a full 365-day streak.',
    },
    {
      minimumDays: 500,
      nativeSymbol: '☼',
      name: 'Golden Focus',
      description:
        'Maintain a 500-day streak.',
    },
    {
      minimumDays: 600,
      nativeSymbol: '◆',
      name: 'Diamond Mind',
      description:
        'Maintain a 600-day streak.',
    },
    {
      minimumDays: 750,
      nativeSymbol: '◉',
      name: 'Focus Sage',
      description:
        'Maintain a 750-day streak.',
    },
    {
      minimumDays: 1000,
      nativeSymbol: 'M',
      name: 'Focus Legend',
      description:
        'Maintain a 1,000-day streak.',
    },
    {
      minimumDays: 1500,
      nativeSymbol: 'V',
      name: 'Grandmaster',
      description:
        'Maintain a 1,500-day streak.',
    },
    {
      minimumDays: 2000,
      nativeSymbol: '∞',
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