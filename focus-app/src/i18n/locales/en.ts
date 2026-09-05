const en = {
  layout: {
    streak: 'Streak',
    streakDays_one: '{{count}} day streak',
    streakDays_other: '{{count}} days streak',
  },


  loginPage: {
    title: 'Welcome to Focus',
    subtitle:
      'Sign in to sync your productivity data across devices.',
    googleError:
      'Could not sign in with Google.',
    redirecting: 'Redirecting...',
    continueGoogle: 'Continue with Google',
    or: 'or',
    continueGuest: 'Continue as Guest',
    guestDescription:
      'Your data will be saved only on this device.',
    demoAccess: 'Try without an account',
    language: 'Language',
    portuguese: 'Português',
    english: 'English',
  },

  analyticsPage: {
    title: 'Analytics',
    loading: 'Loading your productivity data',
    unableToLoad: 'Unable to load your productivity data',
    loadError:
      'An unexpected error occurred while loading analytics.',
    subtitle: 'Your productivity at a glance',

    ranges: {
      week: 'This Week',
      month: 'This Month',
      year: 'This Year',
      all: 'All Time',
      lastWeek: 'last week',
      lastMonth: 'last month',
      lastYear: 'last year',
    },

    stats: {
      totalFocus: 'Total Focus',
      allTime: 'all time',
      totalSessions: 'Total Sessions',
      pomodoros: 'pomodoros',
      dailyAverage: 'Daily Average',
      thisWeek: 'this week',
      topProject: 'Top Project',
      noneYet: 'None yet',
    },

    tooltip: {
      sessions: 'Sessions',
      tasks: 'Tasks',
      hours: 'Hours',
    },

    focusChart: {
      title: 'Focus Hours',
      subtitle: 'Daily concentration time',
    },

    sessionsChart: {
      title: 'Sessions & Tasks',
      subtitle:
        'Pomodoros completed vs tasks done',
      sessions: 'Sessions',
      tasks: 'Tasks',
    },

    monthly: {
      title: 'Last 6 Months',
      subtitle: 'Your monthly focus history',
      noPrevious: 'No previous month data',
      fromLastMonth:
        '{{percentage}}% from last month',
      unchanged: 'Unchanged',
      empty: 'No monthly focus history yet',
      emptyDescription:
        'Complete Pomodoro sessions to build your monthly progress history.',
      session_one: '{{count}} session',
      session_other: '{{count}} sessions',
      activeDay_one: '{{count}} active day',
      activeDay_other: '{{count}} active days',
      sixMonthTotal: 'Six-month total',
      averagePerMonth:
        'Average of {{duration}} per month',
      bestMonth: 'Best month',
      noData: 'No data',
      topProject: 'Top project',
      currentMonth: 'Current month',
    },

    trends: {
      title: 'Trends',
      subtitle:
        'Discover where your focus time is going',
      topProjects: 'Top Projects',
      comparedWith:
        'Focus time compared with {{period}}',
      allRecorded:
        'Share of all recorded focus time',
      totalFocus: 'total focus',
      empty:
        'No project focus data in this period',
      emptyDescription:
        'Complete a Pomodoro connected to a project to see its trend here.',
      topThree: 'Top 3 Projects',
      share:
        '{{percentage}}% of your focus time',
      otherProjects: 'Other Projects',
      project_one: '{{count}} project',
      project_other: '{{count}} projects',
      shareShort:
        '{{percentage}}% of focus time',
      showLess: 'Show less',
      showAll: 'Show all {{count}} projects',
    },

    change: {
      new: 'New',
      noPrevious: 'No previous data',
    },

    insights: {
      title: 'Insights',
      subtitle: 'Highlights from this period',
      empty:
        'Your insights will appear after you complete focus sessions.',

      momentum: 'Focus momentum',
      noComparison:
        'There is no focus data from {{period}} to compare yet.',
      more:
        'You focused {{percentage}}% more than {{period}}.',
      less:
        'You focused {{percentage}}% less than {{period}}.',
      unchanged:
        'Your focus time is unchanged from {{period}}.',

      productiveDay: 'Most productive day',
      productiveDayText:
        '{{day}} is your strongest focus day in this period.',
      productiveDayEmpty:
        'Not enough activity to identify your best day yet.',

      mainFocus: 'Main focus',
      mainFocusText:
        '{{project}} received {{percentage}}% of your total focus time.',
      mainFocusEmpty:
        'Connect sessions to projects to discover your main focus.',

      activeDays: 'Active days',
      activeDaysText_one:
        'You recorded focus time on {{count}} day during this period.',
      activeDaysText_other:
        'You recorded focus time on {{count}} days during this period.',
    },
  },

  streaksPage: {
    title: 'Streaks',
    loading: 'Loading your activity',
    unableToLoad: 'Unable to load your activity',
    loadError:
      'An unexpected error occurred while loading streak data.',
    subtitle: 'Keep your momentum going',

    stats: {
      current: 'Current',
      longest: 'Longest',
      activeDays: 'Active Days',
      focusTime: 'Focus Time',
      days: 'days',
      best: 'best',
      total: 'total',
      allTime: 'all time',
    },

    currentBadge: 'Current badge',
    streak_one: '{{count}} day streak',
    streak_other: '{{count}} days streak',
    nextBadge: 'Next badge',
    dayLeft_one: '{{count}} day left',
    dayLeft_other: '{{count}} days left',
    daysCount_one: '{{count}} day',
    daysCount_other: '{{count}} days',
    highestLevel:
      'You reached the highest streak level.',

    heatmap: 'Activity Heatmap',
    achievementsTitle: 'Achievements',

    journey: {
      title: 'Badge Journey',
      subtitle:
        'Swipe to explore every streak level.',
      current: 'Current',
      previous: 'Previous badge page',
      next: 'Next badge page',
      goToPage: 'Go to badge page {{page}}',
      page: 'Page {{current}} of {{total}}',
      unlockedDays_one: '{{count}} day',
      unlockedDays_other: '{{count}} days',
      remaining_one: '{{count}} day left',
      remaining_other: '{{count}} days left',
    },

    achievements: {
      firstSession: {
        title: 'First Focus',
        description:
          'Complete your first session',
      },
      weekStreak: {
        title: 'On Fire',
        description:
          'Reach a 7-day streak',
      },
      monthStreak: {
        title: 'Iron Will',
        description:
          'Reach a 30-day streak',
      },
      tenHours: {
        title: 'Power User',
        description:
          'Complete 600 focus minutes',
      },
    },

    badges: {
      '0': {
        name: 'First Drop',
        description:
          'Begin your focus journey.',
      },
      '3': {
        name: 'First Steps',
        description:
          'Maintain a 3-day streak.',
      },
      '7': {
        name: 'On Fire',
        description:
          'Maintain a 7-day streak.',
      },
      '14': {
        name: 'Flame Keeper',
        description:
          'Maintain a 14-day streak.',
      },
      '30': {
        name: 'Momentum',
        description:
          'Maintain a 30-day streak.',
      },
      '50': {
        name: 'Liftoff',
        description:
          'Maintain a 50-day streak.',
      },
      '75': {
        name: 'Steady Orbit',
        description:
          'Maintain a 75-day streak.',
      },
      '100': {
        name: 'Focus Star',
        description:
          'Maintain a 100-day streak.',
      },
      '150': {
        name: 'Bright Mind',
        description:
          'Maintain a 150-day streak.',
      },
      '200': {
        name: 'Focus Champion',
        description:
          'Maintain a 200-day streak.',
      },
      '300': {
        name: 'Bronze Master',
        description:
          'Maintain a 300-day streak.',
      },
      '365': {
        name: 'Year of Focus',
        description:
          'Maintain a full 365-day streak.',
      },
      '500': {
        name: 'Golden Focus',
        description:
          'Maintain a 500-day streak.',
      },
      '600': {
        name: 'Diamond Mind',
        description:
          'Maintain a 600-day streak.',
      },
      '750': {
        name: 'Focus Sage',
        description:
          'Maintain a 750-day streak.',
      },
      '1000': {
        name: 'Focus Legend',
        description:
          'Maintain a 1,000-day streak.',
      },
      '1500': {
        name: 'Grandmaster',
        description:
          'Maintain a 1,500-day streak.',
      },
      '2000': {
        name: 'Infinite Focus',
        description:
          'Maintain a 2,000-day streak.',
      },
    },
  },

  projectsPage: {
    title: 'Projects',
    loading: 'Loading projects',
    unableToLoad: 'Unable to load projects',
    loadError:
      'An unexpected error occurred while loading your projects.',
    active_one: '{{count}} active project',
    active_other: '{{count}} active projects',

    newProject: 'New Project',
    editProject: 'Edit Project',
    createProject: 'Create Project',

    form: {
      icon: 'Icon',
      selectIcon: 'Select {{emoji}} icon',
      name: 'Name',
      namePlaceholder: 'Project name',
      description: 'Description',
      descriptionPlaceholder:
        'Optional description',
      color: 'Color',
      selectColor:
        'Select project color {{color}}',
      custom: 'Custom',
      customColor:
        'Choose a custom project color',
      colorHelp:
        'Choose a preset or create your own color.',
      saveError:
        'Unable to save the project. Please try again.',
      saving: 'Saving...',
      saveChanges: 'Save Changes',
      create: 'Create Project',
    },

    delete: {
      title: 'Delete Project',
      confirmation:
        'Delete this project permanently?',
      error:
        'Unable to delete the project. Please try again.',
      cancel: 'Cancel',
      deleting: 'Deleting...',
      delete: 'Delete',
    },

    card: {
      edit: 'Edit {{name}}',
      delete: 'Delete {{name}}',
    },

    empty: {
      title: 'No projects yet',
      description: 'Create your first project',
      action: 'Create Project',
    },
  },

  tasksPage: {
    title: 'Tasks',
    loading: 'Loading tasks',
    unableToLoad: 'Unable to load tasks',
    loadError:
      'An unexpected error occurred while loading your tasks.',
    count_one: '{{count}} task',
    count_other: '{{count}} tasks',
    add: 'Add Task',
    updateError:
      'Unable to update the task. Please try again.',
    empty: 'No tasks yet',
    reopen: 'Reopen {{title}}',
    complete: 'Complete {{title}}',
    delete: 'Delete {{title}}',
    newTask: 'New Task',
    placeholder: 'Task name...',
    createError:
      'Unable to create the task. Please try again.',
    creating: 'Creating...',
    create: 'Create Task',
  },

  goalsPage: {
    title: 'Goals',
    loading: 'Loading {{year}} goals',
    unableToLoad: 'Unable to load goals',
    loadError:
      'An unexpected error occurred while loading your goals.',
    yearlyGoals: '{{year}} yearly goals',
    add: 'Add Goal',

    summary: {
      title: 'Goals done this year',
      completed:
        '{{completed}} of {{total}} completed',
    },

    updateError:
      'Unable to update the goal. Please try again.',

    list: {
      title: 'Your goals',
      description:
        'Check off each goal as you complete it.',
      remaining: 'remaining',
      empty: 'No goals yet',
      emptyDescription:
        'Add your first goal for {{year}}.',
      goalFor: 'Goal for {{year}}',
      reopen: 'Reopen {{title}}',
      complete: 'Complete {{title}}',
      delete: 'Delete {{title}}',
    },

    achievements: {
      title: 'Achievements this year',
      description:
        'Every completed goal becomes part of your yearly journey.',
      empty: 'No achievements yet',
      emptyDescription:
        'Your completed goals will appear here.',
      label: 'Achievement',
    },

    completed: {
      inYear: 'Completed in {{year}}',
      onDate: 'Completed on {{date}}',
    },

    modal: {
      title: 'New Goal',
      question:
        'What do you want to achieve?',
      placeholder: 'Goal for {{year}}...',
      createError:
        'Unable to create the goal. Please try again.',
      creating: 'Creating...',
      create: 'Create Goal',
    },
  },

  dashboard: {
    error:
      'An unexpected error occurred while loading the dashboard.',

    greeting: {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
    },

    focusedToday:
      "You've focused for {{duration}} today.",
    startMomentum:
      'Start your first session to build momentum.',

    stats: {
      todayFocus: "Today's Focus",
      goal: 'Goal: {{duration}}',
      streak: 'Streak',
      day: 'day',
      days: 'days',
      tasksDone: 'Tasks Done',
      today: 'today',
      sessions: 'Sessions',
      pomodoros: 'pomodoros',
    },

    goals: {
      doneThisYear: 'Goals done this year',
      viewYear: 'View your {{year}} goals',
    },

    timer: {
      durationsTitle: 'Timer Durations',
      focusSession: 'Focus Session',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      resume: 'Resume',
      startSession: 'Start Session',
      running: 'Running',
      dailyProgress: 'Daily Progress',
    },

    tasks: {
      pending: 'Pending Tasks',
      viewAll: 'View all',
      allComplete: 'All tasks complete 🎉',
    },

    projects: {
      title: 'Projects',
      viewAll: 'View all',
      empty: 'No projects yet.',
    },
  },

  navigation: {
    dashboard: 'Dashboard',
    timer: 'Timer',
    projects: 'Projects',
    tasks: 'Tasks',
    goals: 'Goals',
    streaks: 'Streaks',
    analytics: 'Analytics',
    settings: 'Settings',
    signOut: 'Sign out',
    signingOut: 'Signing out...',
    openNavigation: 'Open navigation',
    closeMenu: 'Close menu',
  },

  timer: {
    session: {
      work: 'Focus',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
    },
    status: {
      start: 'Start timer',
      pause: 'Pause timer',
      reset: 'Reset timer',
      resume: 'Resume',
      startSession: 'Start Session',
    },
    sound: {
      mute: 'Mute sound',
      enable: 'Enable sound',
    },
    projects: {
      title: 'Project',
      none: 'No project',
      loadError: 'Unable to load projects.',
    },
    settings: {
      focus: 'Focus',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      sessionsUntilLongBreak:
        'Sessions until long break',
      minutes: 'min',
    },
    sessionNumber: 'Session {{current}} of {{total}}',
  },

  settings: {
    title: 'Settings',
    subtitle:
      'Customize your focus experience',

    language: {
      title: 'Language',
      description:
        'Choose the language used throughout Focus.',
      english: 'English',
      portugueseBrazil:
        'Português (Brasil)',
    },

    account: {
      title: 'Account',
      connected: 'Connected Account',
      googleConnected:
        'Google account connected',
      displayName: 'Display name',
      displayNameDescription:
        'This name will appear in your Dashboard greeting.',
      placeholder: 'Your name',
      saving: 'Saving...',
      save: 'Save name',
      saved: 'Display name saved.',
      signOut: 'Sign Out',
      signingOut: 'Signing out...',
      guestMode: 'Guest Mode',
      guestDescription:
        "You're using Focus without an account. Your data is stored only on this device.",
      continueGoogle:
        'Continue with Google',
      redirecting: 'Redirecting...',
      exitGuest: 'Exit Guest Mode',
      noAccount:
        'No Account Connected',
      noAccountDescription:
        'Connect your Google account to synchronize your Focus data.',
    },

    timer: {
      title: 'Timer Durations',
      focus: 'Focus session',
      shortBreak: 'Short break',
      longBreak: 'Long break',
      sessionsUntilLongBreak:
        'Sessions until long break',
      minutes: 'min',
    },

    preferences: {
      title: 'Preferences',
      sound: 'Sound notifications',
      autoBreak:
        'Auto-start breaks',
      autoWork:
        'Auto-start work sessions',
    },

    about: {
      title: 'About',
      description:
        'Focus v3.0 — A minimalist Pomodoro and productivity app. Guest data is stored locally on your device.',
    },
  },
}

export default en
