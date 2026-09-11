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
    activityMap: {
      description:
        'Review one month at a time.',
      select:
        'Select month and year',
      previous:
        'Previous month',
      next:
        'Next month',
    },
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

    statusUpdateError:
      'Unable to update the project status.',

    filters: {
      label: 'Filter projects',
      active: 'Active',
      completed: 'Completed',
      all: 'All',
      empty:
        'No projects match the selected filter.',
    },

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
      complete: 'Complete {{name}}',
      reopen: 'Reopen {{name}}',
      completeShort: 'Complete',
      reopenShort: 'Reopen',
      completed: 'Completed',
      completedOn:
        'Completed on {{date}}',
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
    count_one: '{{count}} active task',
    count_other: '{{count}} active tasks',
    add: 'Add Task',
    addShort: 'Add',
    updateError:
      'Unable to update the task. Please try again.',
    empty: 'No tasks yet',
    emptyAction: 'Create first task',
    reopen: 'Reopen {{title}}',
    complete: 'Complete {{title}}',
    edit: 'Edit {{title}}',
    newTask: 'New Task',
    editTask: 'Edit Task',
    placeholder: 'Task name...',
    createError:
      'Unable to create the task. Please try again.',
    editError:
      'Unable to save the task. Please try again.',
    creating: 'Creating...',
    create: 'Create Task',
    saving: 'Saving...',
    save: 'Save Changes',
    pomodoroCount_one: '{{count}} Pomodoro',
    pomodoroCount_other: '{{count}} Pomodoros',

    filters: {
      status: 'Filter by status',
      pending: 'Pending',
      completed: 'Completed',
      all: 'All',
      empty:
        'No tasks match the selected filters.',
    },

    categories: {
      all: 'All categories',

      quick: {
        label: 'Quick',
        description:
          'A small action to complete in little time.',
      },

      planned: {
        label: 'Planned',
        description:
          'A task that requires organization and attention.',
      },

      urgent: {
        label: 'Urgent',
        description:
          'Something that needs priority.',
      },

      long_term: {
        label: 'Long term',
        description:
          'Work to advance over several days.',
      },
    },

    form: {
      name: 'Name',
      category: 'Category',
      project: 'Project',
      noProject: 'No project',
      estimate: 'Focus estimate',
    },

    trash: {
      open: 'Open trash',
      move: 'Move {{title}} to trash',
      title: 'Trash',
      subtitle:
        'Tasks are permanently deleted after 30 days.',
      back: 'Back to Tasks',
      empty: 'Trash is empty',
      emptyDescription:
        'Removed tasks will remain available here for 30 days.',
      daysRemaining_one:
        'Permanent deletion in {{count}} day',
      daysRemaining_other:
        'Permanent deletion in {{count}} days',
      deleteToday:
        'Permanent deletion today',
      restoreTask: 'Restore {{title}}',
      deleteTask:
        'Permanently delete {{title}}',
      confirmTitle:
        'Permanently delete',
      confirmDescription:
        'Permanently delete “{{title}}”? This action cannot be undone.',
      cancel: 'Cancel',
      deletePermanently:
        'Delete permanently',
      deleting: 'Deleting...',
      deleteError:
        'Unable to permanently delete the task.',
      loadError:
        'Unable to load trash.',
    },
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
      dailyGoal:
        'Daily focus goal',
      dailyGoalDescription:
        'Used to calculate your daily progress on the Dashboard.',
      focus: 'Focus',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
      sessionsUntilLongBreak:
        'Sessions until long break',
      minutes: 'min',
    },
    sessionNumber: 'Session {{current}} of {{total}}',
  },

  focusHomeRetest: {
    title: 'Take a new class test',
    action: 'Take a new class test',
    back: 'Back to About FocusMe',
    unavailable:
      'There is no newer eligible monthly report for this analysis yet.',
    analyzing: 'Analyzing...',
    error:
      'The new test could not be completed.',

    states: {
      loading:
        'Checking your monthly reports...',
      first:
        'Your first FocushoMe will be revealed from the main page when an eligible month is available.',
      waiting:
        'A new test will become available after another complete month with enough data.',
      available:
        'A new monthly report is ready. You can request a new reading of your class.',
    },

    confirm: {
      title: 'Perform a new reading?',
      description:
        'Focus will use only the newly closed month. The result may confirm your current identity or reveal another FocushoMe.',
      warning:
        'After this analysis, another eligible monthly report will be required before testing again.',
    },

    result: {
      remained:
        'Your essence remained',
      remainedDescription:
        'The new month introduced different nuances, but your central structure still belongs to the same FocushoMe.',
      changed:
        'A new identity was revealed',
      changedDescription:
        'Your latest month showed a deep and consistent change in how you use Focus.',
      finish: 'Continue to FocusMe',
    },
  },

  focusHomeReveal: {
    back: 'Back to FocusMe',
    unavailable:
      'This report cannot perform a FocushoMe analysis yet.',
    alreadyRevealed:
      'Your current FocushoMe',
    goToFocusMe: 'Go to FocusMe',
    title:
      'Your month revealed an identity',
    description:
      'Focus analyzed how you planned, executed, completed, and resumed your work. Your FocushoMe is ready to be revealed.',
    action: 'Reveal my FocushoMe',
    analyzing: 'Analyzing...',
    error:
      'The reveal could not be completed right now.',

    invitation: {
      title:
        'Your first FocushoMe is ready',
      description:
        'A complete month gathered enough data for a deep analysis.',
    },

    result: {
      eyebrow:
        'You belong to FocushoMe',
      influence:
        'Influence: {{archetype}}',
      expression:
        'Temporal expression: {{expression}}',
      permanent:
        'This identity will remain with you',
    },

    traits: {
      night_planner_morning_executor:
        'Plans at night and executes in the morning',
      morning_planner_night_executor:
        'Plans early and executes at night',
      goal_rich_open_horizons:
        'Open horizons',
      task_driven:
        'Task driven',
      project_concentrated:
        'Concentrated focus',
      category_explorer:
        'Category explorer',
      comeback_pattern:
        'Return strength',
      urgent_closer:
        'Urgency finisher',
      long_horizon:
        'Long horizon',
      quick_solver:
        'Quick solver',
      deep_sessions:
        'Deep sessions',
      steady_weeks:
        'Consistent weeks',
      peak_driven:
        'Peak driven',
    },
  },

  focusHomeIdentity: {
    current: 'Your FocushoMe',
    locked:
      'FocushoMe not revealed yet',

    archetypes: {
      visionary: 'The Visionary',
      builder: 'The Builder',
      finisher: 'The Finisher',
      executor: 'The Executor',
      organizer: 'The Organizer',
      rhythmist: 'The Rhythmist',
      restorer: 'The Restorer',
      planner: 'The Planner',
      catalyst: 'The Catalyst',
      explorer: 'The Explorer',
      strategist: 'The Strategist',
      guardian: 'The Guardian',
    },

    temporal: {
      aurora: 'Aurora',
      solaris: 'Solaris',
      vesper: 'Vesper',
      lunaris: 'Lunaris',
      equinox: 'Equinox',
    },
  },

  focusMePage: {
    back: 'Back to Settings',
    reportsSubtitle:
      'Your reports, patterns, and discoveries gathered in one place.',
    subtitle:
      'A new way to understand your focus journey.',
    coming: 'Available in Focus 4.0',

    view: {
      week: 'Week',
      month: 'Month',
      label: 'Report period',
    },

    monthlyReport: {
      eyebrow: 'Your month so far',
      description:
        'See how your rhythm is taking shape before the monthly retrospective.',
      error:
        'This month’s data could not be prepared.',
      focusTime: 'Focus time',
      sessions: 'Sessions',
      activeDays: 'Active days',
      tasksCompleted: 'Tasks completed',
      noComparison: 'No previous month',
      weeklyEvolution: 'Weekly evolution',
      week: 'W{{number}}',
      noFocus:
        'Weeks will appear as you complete sessions.',
      timeDistribution: 'When your focus happens',
      timeBlocks: {
        morning: 'Morning',
        afternoon: 'Afternoon',
        evening: 'Evening',
        late_night: 'Late night',
      },
      tasks: 'Tasks',
      projects: 'Projects',
      goals: 'Goals',
      created: 'created',
      completed: 'completed',
      topProjects: 'Most focused projects',
      eligibility: {
        building: {
          title:
            'Your analysis is taking shape',
          description:
            'Keep using Focus naturally. Every session and completion helps build a more reliable understanding of your month.',
        },
        ready: {
          title:
            'Enough data for your analysis',
          description:
            'Your month already has enough depth. When it ends, your FocushoMe analysis can be performed.',
        },
        eligible: {
          title:
            'FocushoMe analysis available',
          description:
            'This closed month contains enough data to reveal or reassess your FocushoMe.',
        },
      },
    },

    weeklyReport: {
      available: 'Available now',
      eyebrow: 'Your week so far',
      title:
        'What your focus already says about you',
      loading:
        'Bringing your weekly data together...',
      error:
        'Your summary could not be prepared right now.',
      focusTime: 'Focus time',
      sessions: 'Sessions',
      activeDays: 'Active days',
      tasksCompleted: 'Tasks completed',
      dailyRhythm: 'Daily rhythm',
      bestDay: 'Most focused day',
      noFocus:
        'Complete a session to start building your report.',
      tasksTitle: 'Planning and execution',
      created: 'Created',
      completed: 'Completed',
      rhythmTitle: 'Continuity',
      starts: 'Starts',
      pauses: 'Pauses',
      resumes: 'Resumes',
      abandoned: 'Interrupted',
      topProject: 'Highlighted project',
      noProject:
        'No project received focus sessions this week.',
      currentWeek:
        'This summary evolves as you use Focus.',
      historyTitle: 'Report history',
      historyDescription:
        'Review your preserved weekly and monthly retrospectives over time.',
      narrativeTitle:
        'The story of your week',
      narrativeDescription:
        'An interpretation built only from your actions inside Focus.',
    },


    hero: {
      title:
        'Your focus tells a story.',
      description:
        'FocusMe brings together your sessions, tasks, goals, projects, and achievements to show not only how much you accomplished, but how your routine truly unfolded.',
    },

    experience: {
      title: 'A retrospective made for you',
      subtitle:
        'Every part of Focus builds a more complete view of your journey.',

      items: {
        weekly: {
          title: 'Your week',
          description:
            'Understand your most focused days, completed tasks, highlighted projects, and changes in your rhythm.',
        },

        monthly: {
          title: 'Your month',
          description:
            'Receive a deep retrospective written in a human way from metrics calculated by Focus.',
        },

        focusHome: {
          title: 'Your FocushoMe',
          description:
            'Discover a rare class based on how you plan, execute, complete, and maintain your focus.',
        },

        sharing: {
          title: 'Your story in one image',
          description:
            'Turn your results into a personalized PNG with your FocushoMe, current badge, and metrics, ready to preview, save, or share.',
        },
      },
    },

    focusHome: {
      title: 'More than a badge',
      description:
        'Your FocushoMe will be an identity built from real app usage. It will not be determined only by when you work or by leaving the timer running.',

      items: {
        rare:
          'Earned only after a month with enough meaningful data.',
        complete:
          'Based on sessions, tasks, goals, projects, and completion patterns.',
        permanent:
          'It stays with you and changes only when you request a new monthly test.',
      },
    },

    symbols: {
      title: 'The twelve FocushoMes',
      subtitle:
        'Tap a symbol to discover the identity, strength, and balance point of each FocushoMe.',
      tap: 'Discover',
      open: 'Discover the {{name}} FocushoMe',
      close: 'Close',
      strength: 'Core strength',
      balance: 'Balance point',

      items: {
        aster: {
          essence:
            'The vision that comes before the path.',
          description:
            'Aster belongs to those who see possibilities before turning them into action. Goals, ideas, and plans emerge naturally, creating a broad view of what could still be built.',
          strength:
            'Imagining possible futures, establishing direction, and giving meaning to work before it begins.',
          balance:
            'Choosing which possibilities truly deserve progress so new horizons do not hide paths already opened.',
        },

        atlas: {
          essence:
            'Depth to sustain meaningful journeys.',
          description:
            'Atlas concentrates energy on important projects and remains with them for long periods. Instead of spreading focus across many fronts, it carries and develops what matters.',
          strength:
            'Building depth, mastery, and many hours of attention around goals that require continuity.',
          balance:
            'Recognizing when a responsibility has become too heavy and when sharing the path may strengthen the result.',
        },

        forge: {
          essence:
            'Intention transformed into results.',
          description:
            'Forge finds satisfaction in completion. Closed tasks, advancing projects, and achieved goals fuel someone who turns planning into something concrete.',
          strength:
            'Finishing, resolving open loops, and converting effort into outcomes that can be seen and recognized.',
          balance:
            'Not turning every experience into an obligation to produce; some ideas need space before entering the fire.',
        },

        pulse: {
          essence:
            'Fast movement that keeps the day alive.',
          description:
            'Pulse works through short and frequent impulses. Small tasks, quick responses, and immediate decisions create a constant sense of progress.',
          strength:
            'Unblocking everyday life, reducing small pending items, and responding quickly to what needs attention now.',
          balance:
            'Reserving longer periods for work that offers no immediate reward but builds deeper results.',
        },

        loom: {
          essence:
            'Different threads forming one story.',
          description:
            'Loom connects tasks, projects, goals, and focus sessions. Its pattern does not depend on a single tool: every part of Focus contributes to a larger structure.',
          strength:
            'Integrating planning and execution while keeping different areas connected without losing the whole.',
          balance:
            'Avoiding structures that become more complex than the decisions they were meant to support.',
        },

        orbit: {
          essence:
            'Consistency that creates its own center.',
          description:
            'Orbit returns to focus through recognizable times and cycles. Its power lies less in dramatic peaks and more in returning to the same axis regularly.',
          strength:
            'Turning focus into a reliable routine and reducing dependence on temporary motivation.',
          balance:
            'Allowing change when a routine no longer serves, without treating adaptation as lost discipline.',
        },

        tide: {
          essence:
            'Adaptation without losing direction.',
          description:
            'Tide changes intensity, timing, and strategy according to context. Its rhythm may vary, but intelligence exists in how it responds to current conditions.',
          strength:
            'Reorganizing priorities, finding new productivity windows, and continuing when the original plan fails.',
          balance:
            'Creating stable reference points so adaptation does not become permanent dispersion.',
        },

        ember: {
          essence:
            'An intensity that remains lit within.',
          description:
            'Ember may not produce the largest visible volume, but it sustains deep and quiet attention. Its eye represents awareness: observing before acting and protecting essential energy.',
          strength:
            'Maintaining inner concentration, noticing detail, and preserving motivation through quieter periods.',
          balance:
            'Allowing internal work to become visible by sharing progress and recognizing personal achievements.',
        },

        nova: {
          essence:
            'The energy that opens new paths.',
          description:
            'Nova appears where projects, tasks, and possibilities begin intensely. It finds excitement in experimenting, initiating, and creating movement.',
          strength:
            'Taking the first step, generating momentum, and turning a still idea into something that has begun to exist.',
          balance:
            'Maintaining energy after the initial brightness and choosing which beginnings deserve completion.',
        },

        prism: {
          essence:
            'Many forms of focus moving through one person.',
          description:
            'Prism distributes attention across categories, projects, times, and ways of working. Its identity comes from variety and seeing through multiple angles.',
          strength:
            'Combining perspectives, alternating skills, and finding solutions that uniform routines might never reveal.',
          balance:
            'Creating priority among many possibilities so variety does not become fragmentation.',
        },

        vanguard: {
          essence:
            'Firm presence before what cannot wait.',
          description:
            'Vanguard responds strongly when priority, urgency, or responsibility is clear. Pressure does not paralyze it; pressure organizes the field.',
          strength:
            'Making decisions, protecting what matters, and advancing when situations demand quick response and direction.',
          balance:
            'Not depending only on urgency to act and giving energy to important work before it becomes an emergency.',
        },

        verdant: {
          essence:
            'Patient growth that becomes lasting.',
          description:
            'Verdant cultivates goals and projects over time. Small advances may seem quiet alone, but they form deep roots when viewed across a full month.',
          strength:
            'Building sustainable results, respecting long processes, and continuing when progress is not immediately visible.',
          balance:
            'Celebrating intermediate stages so distance from the final result does not hide everything already grown.',
        },
      },
    },

    privacy: {
      title:
        'Your routine remains yours',
      description:
        'FocusMe will use only actions recorded inside Focus. No constant monitoring will be required.',

      items: {
        location:
          'No access to your location.',
        apps:
          'No access to activity from other apps.',
        device:
          'No permanent device monitoring.',
      },
    },

    development: {
      title:
        'FocusMe is in development',
      description:
        'This page will evolve as Focus 4.0 features are completed.',
    },
  },

  focusMeHistoryPage: {
    back: 'Back to FocusMe',
    title: 'Report history',
    subtitle:
      'Revisit your weeks, months, and the evolution of your routine.',
    filterLabel: 'Filter reports',
    error:
      'Your report history could not be loaded.',
    sessions: 'sessions',
    tasks: 'tasks completed',
    types: {
      weekly: 'Weekly',
      monthly: 'Monthly',
    },
    filters: {
      all: 'All',
      weekly: 'Weekly',
      monthly: 'Monthly',
    },
    journey: {
      title: 'Your FocushoMe journey',
      description:
        'Follow the identities revealed by your months and how your way of focusing has evolved.',
      current: 'Current',
      assessmentTypes: {
        initial: 'First assessment',
        retest: 'New assessment',
      },
      changed:
        'Your journey changed from {{previous}} to {{current}}.',
      remained:
        'Your identity remained {{name}}.',
    },
    empty: {
      title:
        'Your reports will appear here',
      description:
        'When a week or month ends, FocusMe will preserve the retrospective so it no longer changes over time.',
      schedule:
        'Weeks close on Monday',
    },
  },

  focusMeReportPage: {
    back: 'Back to history',
    error:
      'This report was not found or could not be loaded.',
    focusHome: {
      eyebrow: 'FocushoMe revealed this month',
      current: 'Current identity',
      historical: 'Previous identity',
      currentDescription:
        'This FocushoMe currently represents how you plan, execute, and complete your work.',
      historicalDescription:
        'This identity was preserved as part of your journey and represents how you experienced this period.',
    },
    share: {
          currentBadge: 'Current badge',
      previewTitle: 'Retrospective preview',
      previewDescription:
        'Review the image before sharing or saving it.',
      previewAlt:
        'FocusMe retrospective PNG preview',
      close: 'Close preview',
      save: 'Save image',
      saving: 'Saving...',
      saved: 'Image saved',
      savedLocation:
        'Image saved in Documents/FocusMe.',
      shareAction: 'Share',
      sharing: 'Opening...',
      button: 'Share retrospective',
      generating: 'Creating image...',
      ready: 'Image ready',
      error:
        'The image could not be created. Please try again.',
      dialogTitle:
        'Share FocusMe retrospective',
      shareText:
        'My FocusMe retrospective.',
      eyebrow: 'My retrospective',
      focusStory:
        'A view of the rhythm I built during this period.',
      footer:
        'My focus tells a story',
      types: {
        weekly: 'Weekly recap',
        monthly: 'Monthly recap',
      },
    },
    types: {
      weekly: 'Weekly retrospective',
      monthly: 'Monthly retrospective',
    },
    preserved:
      'Closed and preserved report',
    focusTime: 'Focus time',
    sessions: 'Sessions',
    activeDays: 'Active days',
    tasksCompleted: 'Tasks completed',
    dailyEvolution: 'Daily evolution',
    weeklyEvolution: 'Weekly evolution',
    week: 'W{{number}}',
    noFocus:
      'No focus session was completed during this period.',
    tasks: 'Tasks completed / created',
    projects: 'Projects completed / created',
    goals: 'Goals completed / created',
    topProject: 'Highlighted project',
    yourStory: 'The story of your period',
    monthlyNarrativeTitle:
      'The story of your month',
    monthlyNarrativeDescription:
      'A local editorial reading while your personalized narrative has not been generated.',
    monthlyNarrativeGeneratedDescription:
      'A personalized narrative built only from metrics calculated by Focus.',
    narrativePreparing:
      'FocusMe is writing your personalized retrospective. The report remains available in the meantime.',
    narrativeFallback:
      'Personalized writing was unavailable. Your local retrospective was preserved.',
    narrativeRetry:
      'Try again',
    legacyNarrativeTitle:
      'Preserved retrospective',
    legacyNarrativeDescription:
      'This report was created before the new FocusMe behavioral analysis. Its metrics remain available, but there is not enough information to rebuild a reliable monthly narrative.',
  },

  changesPage: {
    back: 'Back to Settings',
    title: 'Changes and updates',
    subtitle:
      'Follow everything that has evolved in Focus and what we are preparing next.',
    currentVersion: 'Current version',
    currentDescription:
      'Focus 4.0 turns sessions, tasks, goals, and projects into personal retrospectives, FocushoMe identities, and a preserved journey of growth.',
    new: 'New',

    recent: {
      title: 'Recent updates',
      subtitle:
        'The newest improvements available in the app.',

      items: {
        weeklyRecaps: {
          title: 'Weekly retrospectives',
          description:
            'Each closed week gains metrics, daily rhythm, continuity, and a narrative built from your actions.',
        },

        monthlyRecaps: {
          title: 'Monthly retrospectives',
          description:
            'Your months receive comparisons, behavioral patterns, weekly evolution, and a preserved personal narrative.',
        },

        focusHome: {
          title: 'Your FocushoMe identity',
          description:
            'Twelve identities interpret how you plan, execute, complete, and sustain focus.',
        },

        focusMeHistory: {
          title: 'History and FocushoMe journey',
          description:
            'Previous reports and assessments remain preserved, showing identity changes and continuity.',
        },

        sharing: {
          title: 'Shareable retrospectives',
          description:
            'Generate a PNG with your FocushoMe, badge, and metrics, preview it full-screen, save, or share it.',
        },

        taskCategories: {
          title: 'New task experience',
          description:
            'Tasks now include categories, combined filters, linked projects, and Pomodoro estimates.',
        },

        taskTrash: {
          title: 'Task trash',
          description:
            'Removed tasks can be restored for 30 days before permanent deletion.',
        },

        projectLifecycle: {
          title: 'Project completion',
          description:
            'Projects can now be completed, viewed separately, and reopened without losing their history.',
        },

        focusMePreview: {
          title: 'Meet FocusMe',
          description:
            'A new page introduces retrospectives, FocushoMe, and the Focus vision for personal insights.',
        },

        taskEditing: {
          title: 'Task editing',
          description:
            'You can now correct or update a task name without deleting it and creating another one.',
        },
        responsive: {
          title: 'Responsive improvements',
          description:
            'Text, headers, and spacing have been refined for a better experience on phones and tablets.',
        },
        changesCenter: {
          title: 'Changes center',
          description:
            'This new space brings together the Focus history, recent updates, and upcoming features.',
        },
      },
    },

    history: {
      title: 'Version history',
      subtitle:
        'See how Focus has evolved since its first version.',
      current: 'Current',

      versions: {
        v4: {
          description:
            'Focus entered a new phase, connecting daily organization, completion, and understanding of your routine.',
          items: {
            weeklyRecaps:
              'Weekly retrospectives with metrics, daily rhythm, continuity, and narrative.',
            monthlyRecaps:
              'Monthly retrospectives with comparisons, patterns, and behavioral interpretation.',
            focusHome:
              'Twelve FocushoMe identities revealed from real usage data.',
            focusMeHistory:
              'History of reports, reveals, and new FocushoMe assessments.',
            sharing:
              'High-resolution PNG with preview, current badge, saving, and sharing.',
            taskEditing:
              'Complete task editing without needing to delete and recreate.',
            taskCategories:
              'Quick, Planned, Urgent, and Long-term categories with filters and minimalist visual identification.',
            taskTrash:
              'Trash with 30-day restoration and permanent deletion.',
            projectLifecycle:
              'Project completion, reopening, and filters while preserving hours, tasks, and sessions.',
            focusMePreview:
              'Introduction to FocusMe, FocushoMe, upcoming retrospectives, and privacy principles.',
          },
        },

        v3: {
          description:
            'Focus became a truly cross-platform and bilingual experience.',
          items: {
            languages:
              'Complete app experience in Portuguese and English.',
            androidWidgets:
              'New widgets for Android devices.',
            autoStart:
              'Options to automatically start breaks and focus sessions.',
            widgetImprovements:
              'Layout, synchronization, and responsiveness improvements for widgets.',
          },
        },

        v2: {
          description:
            'The mobile experience gained native features and deeper system integration.',
          items: {
            android:
              'Native Focus experience for Android.',
            liveNotifications:
              'Timer displayed in live notifications during sessions.',
            appleExperience:
              'Live Activity, Dynamic Island, and iPhone widgets.',
            tabletSupport:
              'Layouts and widgets adapted for iPad.',
          },
        },

        v1: {
          description:
            'The foundation of Focus launched with the essential tools for organizing time and progress.',
          items: {
            pomodoro:
              'Pomodoro timer with customizable durations.',
            organization:
              'Tasks, projects, and yearly goals.',
            progress:
              'Streaks, badges, analytics, and focus history.',
            accounts:
              'Google account synchronization and guest mode.',
          },
        },
      },
    },

    roadmap: {
      title: 'Next steps',
      subtitle:
        'FocusMe is already available. These are the next refinements planned for the experience.',

      status: {
        development: 'In development',
        planned: 'Planned',
      },

      items: {
        taskExperience: {
          title: 'New task experience',
          description:
            'A reorganized and more complete screen that remains true to the Focus minimalism.',
        },

        categories: {
          title: 'Task categories',
          description:
            'Quick, planned, urgent, and long-term tasks with filters and subtle visual identification.',
        },

        trash: {
          title: 'Task trash',
          description:
            'Recover removed tasks for 30 days before permanent deletion.',
        },

        weeklyRecaps: {
          title: 'Weekly recaps',
          description:
            'A complete summary of your days, sessions, tasks, goals, projects, and achievements.',
        },

        monthlyRecaps: {
          title: 'Monthly retrospectives',
          description:
            'A deep view of your month with metrics, patterns, comparisons, and a personal narrative.',
        },

        focusHome: {
          title: 'FocushoMe',
          description:
            'A rare and permanent class based on how you plan, execute, and complete.',
        },

        sharing: {
          title: 'Shareable reports',
          description:
            'Personalized PNG recaps for sharing your results and your FocushoMe.',
        },

        history: {
          title: 'FocusMe history',
          description:
            'Browse weekly recaps, monthly retrospectives, and previous analyses.',
        },

        notifications: {
          title: 'New reports available',
          description:
            'Receive an optional alert when your week, month, or FocushoMe is ready.',
        },
      },

      disclaimer:
        'The remaining features will be added progressively throughout the evolution of Focus 4.0.',
    },
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

    accountDeletion: {
      button: 'Delete my account',
      title: 'Permanently delete account?',
      subtitle:
        'This action cannot be undone.',
      description:
        'Your Focus account and all data associated with it will be removed.',
      warning:
        'Sessions, tasks, projects, goals, reports, narratives, and your FocushoMe journey will be permanently deleted.',
      cancel: 'Cancel',
      confirm: 'Delete permanently',
      deleting: 'Deleting...',
      error:
        'Your account could not be deleted. Please try again.',
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

    focusMe: {
      title: 'About FocusMe',
      badge: 'Focus 4.0',
      description:
        'Discover how your activity will become personal retrospectives.',
    },

    changes: {
      title: 'Changes and updates',
      description:
        'Explore the evolution of Focus and see what is coming next.',
    },

    about: {
      title: 'About',
      description:
        'Focus v4.0 — A minimalist Pomodoro and productivity app. Guest data is stored locally on your device.',
    },
  },
}

export default en
