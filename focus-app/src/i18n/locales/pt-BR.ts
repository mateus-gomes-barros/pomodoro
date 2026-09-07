const ptBR = {
  layout: {
    streak: 'Ofensiva',
    streakDays_one: '{{count}} dia de ofensiva',
    streakDays_other: '{{count}} dias de ofensiva',
  },


  loginPage: {
    title: 'Bem-vindo ao Focus',
    subtitle:
      'Entre para sincronizar seus dados de produtividade entre dispositivos.',
    googleError:
      'Não foi possível entrar com o Google.',
    redirecting: 'Redirecionando...',
    continueGoogle: 'Continuar com Google',
    or: 'ou',
    continueGuest: 'Continuar como visitante',
    guestDescription:
      'Seus dados serão salvos somente neste dispositivo.',
    demoAccess: 'Testar sem criar conta',
    language: 'Idioma',
    portuguese: 'Português',
    english: 'English',
  },

  analyticsPage: {
    title: 'Análises',
    loading: 'Carregando seus dados de produtividade',
    unableToLoad:
      'Não foi possível carregar seus dados de produtividade',
    loadError:
      'Ocorreu um erro inesperado ao carregar as análises.',
    subtitle: 'Sua produtividade em um só lugar',

    ranges: {
      week: 'Esta semana',
      month: 'Este mês',
      year: 'Este ano',
      all: 'Todo o período',
      lastWeek: 'a semana passada',
      lastMonth: 'o mês passado',
      lastYear: 'o ano passado',
    },

    stats: {
      totalFocus: 'Foco total',
      allTime: 'todo o período',
      totalSessions: 'Total de sessões',
      pomodoros: 'pomodoros',
      dailyAverage: 'Média diária',
      thisWeek: 'esta semana',
      topProject: 'Projeto principal',
      noneYet: 'Nenhum ainda',
    },

    tooltip: {
      sessions: 'Sessões',
      tasks: 'Tarefas',
      hours: 'Horas',
    },

    focusChart: {
      title: 'Horas de foco',
      subtitle: 'Tempo diário de concentração',
    },

    sessionsChart: {
      title: 'Sessões e tarefas',
      subtitle:
        'Pomodoros concluídos vs. tarefas concluídas',
      sessions: 'Sessões',
      tasks: 'Tarefas',
    },

    monthly: {
      title: 'Últimos 6 meses',
      subtitle: 'Seu histórico mensal de foco',
      noPrevious:
        'Sem dados do mês anterior',
      fromLastMonth:
        '{{percentage}}% em relação ao mês passado',
      unchanged: 'Sem alteração',
      empty:
        'Ainda não há histórico mensal de foco',
      emptyDescription:
        'Conclua sessões Pomodoro para construir seu histórico mensal de progresso.',
      session_one: '{{count}} sessão',
      session_other: '{{count}} sessões',
      activeDay_one: '{{count}} dia ativo',
      activeDay_other: '{{count}} dias ativos',
      sixMonthTotal: 'Total em seis meses',
      averagePerMonth:
        'Média de {{duration}} por mês',
      bestMonth: 'Melhor mês',
      noData: 'Sem dados',
      topProject: 'Projeto principal',
      currentMonth: 'Mês atual',
    },

    trends: {
      title: 'Tendências',
      subtitle:
        'Descubra para onde está indo seu tempo de foco',
      topProjects: 'Principais projetos',
      comparedWith:
        'Tempo de foco comparado com {{period}}',
      allRecorded:
        'Participação em todo o tempo de foco registrado',
      totalFocus: 'foco total',
      empty:
        'Sem dados de foco por projeto neste período',
      emptyDescription:
        'Conclua um Pomodoro vinculado a um projeto para visualizar sua tendência aqui.',
      topThree: 'Top 3 projetos',
      share:
        '{{percentage}}% do seu tempo de foco',
      otherProjects: 'Outros projetos',
      project_one: '{{count}} projeto',
      project_other: '{{count}} projetos',
      shareShort:
        '{{percentage}}% do tempo de foco',
      showLess: 'Mostrar menos',
      showAll: 'Mostrar todos os {{count}} projetos',
    },

    change: {
      new: 'Novo',
      noPrevious: 'Sem dados anteriores',
    },

    insights: {
      title: 'Insights',
      subtitle: 'Destaques deste período',
      empty:
        'Seus insights aparecerão após você concluir sessões de foco.',

      momentum: 'Ritmo de foco',
      noComparison:
        'Ainda não há dados de foco de {{period}} para comparar.',
      more:
        'Você focou {{percentage}}% a mais que {{period}}.',
      less:
        'Você focou {{percentage}}% a menos que {{period}}.',
      unchanged:
        'Seu tempo de foco não mudou em relação a {{period}}.',

      productiveDay: 'Dia mais produtivo',
      productiveDayText:
        '{{day}} é seu melhor dia de foco neste período.',
      productiveDayEmpty:
        'Ainda não há atividade suficiente para identificar seu melhor dia.',

      mainFocus: 'Foco principal',
      mainFocusText:
        '{{project}} recebeu {{percentage}}% do seu tempo total de foco.',
      mainFocusEmpty:
        'Vincule sessões a projetos para descobrir seu foco principal.',

      activeDays: 'Dias ativos',
      activeDaysText_one:
        'Você registrou tempo de foco em {{count}} dia durante este período.',
      activeDaysText_other:
        'Você registrou tempo de foco em {{count}} dias durante este período.',
    },
  },

  streaksPage: {
    title: 'Sequências',
    loading: 'Carregando sua atividade',
    unableToLoad:
      'Não foi possível carregar sua atividade',
    loadError:
      'Ocorreu um erro inesperado ao carregar os dados da sequência.',
    subtitle: 'Continue mantendo seu ritmo',

    stats: {
      current: 'Atual',
      longest: 'Maior',
      activeDays: 'Dias ativos',
      focusTime: 'Tempo de foco',
      days: 'dias',
      best: 'recorde',
      total: 'total',
      allTime: 'todo o período',
    },

    currentBadge: 'Insígnia atual',
    streak_one: 'sequência de {{count}} dia',
    streak_other: 'sequência de {{count}} dias',
    nextBadge: 'Próxima insígnia',
    dayLeft_one: 'Falta {{count}} dia',
    dayLeft_other: 'Faltam {{count}} dias',
    daysCount_one: '{{count}} dia',
    daysCount_other: '{{count}} dias',
    highestLevel:
      'Você alcançou o nível máximo de sequência.',

    heatmap: 'Mapa de atividade',
    achievementsTitle: 'Conquistas',

    journey: {
      title: 'Jornada de insígnias',
      subtitle:
        'Deslize para explorar todos os níveis de sequência.',
      current: 'Atual',
      previous:
        'Página anterior de insígnias',
      next:
        'Próxima página de insígnias',
      goToPage:
        'Ir para a página {{page}} de insígnias',
      page: 'Página {{current}} de {{total}}',
      unlockedDays_one: '{{count}} dia',
      unlockedDays_other: '{{count}} dias',
      remaining_one: 'Falta {{count}} dia',
      remaining_other: 'Faltam {{count}} dias',
    },

    achievements: {
      firstSession: {
        title: 'Primeiro foco',
        description:
          'Conclua sua primeira sessão',
      },
      weekStreak: {
        title: 'Em chamas',
        description:
          'Alcance uma sequência de 7 dias',
      },
      monthStreak: {
        title: 'Vontade de ferro',
        description:
          'Alcance uma sequência de 30 dias',
      },
      tenHours: {
        title: 'Usuário avançado',
        description:
          'Complete 600 minutos de foco',
      },
    },

    badges: {
      '0': {
        name: 'Primeira gota',
        description:
          'Comece sua jornada de foco.',
      },
      '3': {
        name: 'Primeiros passos',
        description:
          'Mantenha uma sequência de 3 dias.',
      },
      '7': {
        name: 'Em chamas',
        description:
          'Mantenha uma sequência de 7 dias.',
      },
      '14': {
        name: 'Guardião da chama',
        description:
          'Mantenha uma sequência de 14 dias.',
      },
      '30': {
        name: 'Ritmo',
        description:
          'Mantenha uma sequência de 30 dias.',
      },
      '50': {
        name: 'Decolagem',
        description:
          'Mantenha uma sequência de 50 dias.',
      },
      '75': {
        name: 'Órbita estável',
        description:
          'Mantenha uma sequência de 75 dias.',
      },
      '100': {
        name: 'Estrela do foco',
        description:
          'Mantenha uma sequência de 100 dias.',
      },
      '150': {
        name: 'Mente brilhante',
        description:
          'Mantenha uma sequência de 150 dias.',
      },
      '200': {
        name: 'Campeão do foco',
        description:
          'Mantenha uma sequência de 200 dias.',
      },
      '300': {
        name: 'Mestre de bronze',
        description:
          'Mantenha uma sequência de 300 dias.',
      },
      '365': {
        name: 'Um ano de foco',
        description:
          'Mantenha uma sequência completa de 365 dias.',
      },
      '500': {
        name: 'Foco dourado',
        description:
          'Mantenha uma sequência de 500 dias.',
      },
      '600': {
        name: 'Mente de diamante',
        description:
          'Mantenha uma sequência de 600 dias.',
      },
      '750': {
        name: 'Sábio do foco',
        description:
          'Mantenha uma sequência de 750 dias.',
      },
      '1000': {
        name: 'Lenda do foco',
        description:
          'Mantenha uma sequência de 1.000 dias.',
      },
      '1500': {
        name: 'Grão-mestre',
        description:
          'Mantenha uma sequência de 1.500 dias.',
      },
      '2000': {
        name: 'Foco infinito',
        description:
          'Mantenha uma sequência de 2.000 dias.',
      },
    },
  },

  projectsPage: {
    title: 'Projetos',
    loading: 'Carregando projetos',
    unableToLoad:
      'Não foi possível carregar os projetos',
    loadError:
      'Ocorreu um erro inesperado ao carregar seus projetos.',
    active_one: '{{count}} projeto ativo',
    active_other: '{{count}} projetos ativos',

    statusUpdateError:
      'Não foi possível atualizar o estado do projeto.',

    filters: {
      label: 'Filtrar projetos',
      active: 'Ativos',
      completed: 'Concluídos',
      all: 'Todos',
      empty:
        'Nenhum projeto corresponde ao filtro selecionado.',
    },

    newProject: 'Novo projeto',
    editProject: 'Editar projeto',
    createProject: 'Criar projeto',

    form: {
      icon: 'Ícone',
      selectIcon: 'Selecionar ícone {{emoji}}',
      name: 'Nome',
      namePlaceholder: 'Nome do projeto',
      description: 'Descrição',
      descriptionPlaceholder:
        'Descrição opcional',
      color: 'Cor',
      selectColor:
        'Selecionar cor do projeto {{color}}',
      custom: 'Personalizada',
      customColor:
        'Escolher uma cor personalizada para o projeto',
      colorHelp:
        'Escolha uma cor predefinida ou crie a sua própria.',
      saveError:
        'Não foi possível salvar o projeto. Tente novamente.',
      saving: 'Salvando...',
      saveChanges: 'Salvar alterações',
      create: 'Criar projeto',
    },

    delete: {
      title: 'Excluir projeto',
      confirmation:
        'Excluir este projeto permanentemente?',
      error:
        'Não foi possível excluir o projeto. Tente novamente.',
      cancel: 'Cancelar',
      deleting: 'Excluindo...',
      delete: 'Excluir',
    },

    card: {
      edit: 'Editar {{name}}',
      delete: 'Excluir {{name}}',
      complete: 'Concluir {{name}}',
      reopen: 'Reabrir {{name}}',
      completeShort: 'Concluir',
      reopenShort: 'Reabrir',
      completed: 'Concluído',
      completedOn:
        'Concluído em {{date}}',
    },

    empty: {
      title: 'Nenhum projeto ainda',
      description: 'Crie seu primeiro projeto',
      action: 'Criar projeto',
    },
  },

  tasksPage: {
    title: 'Tarefas',
    loading: 'Carregando tarefas',
    unableToLoad:
      'Não foi possível carregar as tarefas',
    loadError:
      'Ocorreu um erro inesperado ao carregar suas tarefas.',
    count_one: '{{count}} tarefa ativa',
    count_other: '{{count}} tarefas ativas',
    add: 'Adicionar tarefa',
    addShort: 'Adicionar',
    updateError:
      'Não foi possível atualizar a tarefa. Tente novamente.',
    empty: 'Nenhuma tarefa ainda',
    emptyAction: 'Criar primeira tarefa',
    reopen: 'Reabrir {{title}}',
    complete: 'Concluir {{title}}',
    edit: 'Editar {{title}}',
    newTask: 'Nova tarefa',
    editTask: 'Editar tarefa',
    placeholder: 'Nome da tarefa...',
    createError:
      'Não foi possível criar a tarefa. Tente novamente.',
    editError:
      'Não foi possível salvar a tarefa. Tente novamente.',
    creating: 'Criando...',
    create: 'Criar tarefa',
    saving: 'Salvando...',
    save: 'Salvar alterações',
    pomodoroCount_one: '{{count}} pomodoro',
    pomodoroCount_other: '{{count}} pomodoros',

    filters: {
      status: 'Filtrar por status',
      pending: 'Pendentes',
      completed: 'Concluídas',
      all: 'Todas',
      empty:
        'Nenhuma tarefa corresponde aos filtros selecionados.',
    },

    categories: {
      all: 'Todas as categorias',

      quick: {
        label: 'Rápida',
        description:
          'Uma ação pequena para resolver em pouco tempo.',
      },

      planned: {
        label: 'Planejada',
        description:
          'Uma tarefa que exige organização e atenção.',
      },

      urgent: {
        label: 'Urgente',
        description:
          'Algo que precisa receber prioridade.',
      },

      long_term: {
        label: 'Longo prazo',
        description:
          'Trabalho para avançar ao longo de vários dias.',
      },
    },

    form: {
      name: 'Nome',
      category: 'Categoria',
      project: 'Projeto',
      noProject: 'Sem projeto',
      estimate: 'Estimativa de foco',
    },

    trash: {
      open: 'Abrir lixeira',
      move: 'Mover {{title}} para a lixeira',
      title: 'Lixeira',
      subtitle:
        'As tarefas são excluídas permanentemente depois de 30 dias.',
      back: 'Voltar para Tarefas',
      empty: 'A lixeira está vazia',
      emptyDescription:
        'As tarefas removidas ficarão disponíveis aqui por 30 dias.',
      daysRemaining_one:
        'Exclusão permanente em {{count}} dia',
      daysRemaining_other:
        'Exclusão permanente em {{count}} dias',
      deleteToday:
        'Exclusão permanente hoje',
      restoreTask: 'Restaurar {{title}}',
      deleteTask:
        'Excluir {{title}} permanentemente',
      confirmTitle:
        'Excluir permanentemente',
      confirmDescription:
        'Excluir “{{title}}” permanentemente? Esta ação não poderá ser desfeita.',
      cancel: 'Cancelar',
      deletePermanently:
        'Excluir permanentemente',
      deleting: 'Excluindo...',
      deleteError:
        'Não foi possível excluir a tarefa permanentemente.',
      loadError:
        'Não foi possível carregar a lixeira.',
    },
  },

  goalsPage: {
    title: 'Metas',
    loading: 'Carregando metas de {{year}}',
    unableToLoad:
      'Não foi possível carregar as metas',
    loadError:
      'Ocorreu um erro inesperado ao carregar suas metas.',
    yearlyGoals: 'Metas anuais de {{year}}',
    add: 'Adicionar meta',

    summary: {
      title: 'Metas concluídas este ano',
      completed:
        '{{completed}} de {{total}} concluídas',
    },

    updateError:
      'Não foi possível atualizar a meta. Tente novamente.',

    list: {
      title: 'Suas metas',
      description:
        'Marque cada meta conforme você a concluir.',
      remaining: 'restantes',
      empty: 'Nenhuma meta ainda',
      emptyDescription:
        'Adicione sua primeira meta para {{year}}.',
      goalFor: 'Meta para {{year}}',
      reopen: 'Reabrir {{title}}',
      complete: 'Concluir {{title}}',
      delete: 'Excluir {{title}}',
    },

    achievements: {
      title: 'Conquistas deste ano',
      description:
        'Cada meta concluída se torna parte da sua jornada anual.',
      empty: 'Nenhuma conquista ainda',
      emptyDescription:
        'Suas metas concluídas aparecerão aqui.',
      label: 'Conquista',
    },

    completed: {
      inYear: 'Concluída em {{year}}',
      onDate: 'Concluída em {{date}}',
    },

    modal: {
      title: 'Nova meta',
      question:
        'O que você quer alcançar?',
      placeholder: 'Meta para {{year}}...',
      createError:
        'Não foi possível criar a meta. Tente novamente.',
      creating: 'Criando...',
      create: 'Criar meta',
    },
  },

  dashboard: {
    error:
      'Ocorreu um erro inesperado ao carregar o painel.',

    greeting: {
      morning: 'Bom dia',
      afternoon: 'Boa tarde',
      evening: 'Boa noite',
    },

    focusedToday:
      'Você focou por {{duration}} hoje.',
    startMomentum:
      'Inicie sua primeira sessão para ganhar ritmo.',

    stats: {
      todayFocus: 'Foco de hoje',
      goal: 'Meta: {{duration}}',
      streak: 'Sequência',
      day: 'dia',
      days: 'dias',
      tasksDone: 'Tarefas concluídas',
      today: 'hoje',
      sessions: 'Sessões',
      pomodoros: 'pomodoros',
    },

    goals: {
      doneThisYear: 'Metas concluídas este ano',
      viewYear: 'Ver suas metas de {{year}}',
    },

    timer: {
      durationsTitle: 'Durações do timer',
      focusSession: 'Sessão de foco',
      shortBreak: 'Pausa curta',
      longBreak: 'Pausa longa',
      resume: 'Continuar',
      startSession: 'Iniciar sessão',
      running: 'Em andamento',
      dailyProgress: 'Progresso diário',
    },

    tasks: {
      pending: 'Tarefas pendentes',
      viewAll: 'Ver todas',
      allComplete: 'Todas as tarefas concluídas 🎉',
    },

    projects: {
      title: 'Projetos',
      viewAll: 'Ver todos',
      empty: 'Nenhum projeto ainda.',
    },
  },

  navigation: {
    dashboard: 'Início',
    timer: 'Timer',
    projects: 'Projetos',
    tasks: 'Tarefas',
    goals: 'Metas',
    streaks: 'Sequências',
    analytics: 'Análises',
    settings: 'Configurações',
    signOut: 'Sair',
    signingOut: 'Saindo...',
    openNavigation: 'Abrir navegação',
    closeMenu: 'Fechar menu',
  },

  timer: {
    session: {
      work: 'Foco',
      shortBreak: 'Pausa Curta',
      longBreak: 'Pausa Longa',
    },
    status: {
      start: 'Iniciar timer',
      pause: 'Pausar timer',
      reset: 'Reiniciar timer',
      resume: 'Continuar',
      startSession: 'Iniciar Sessão',
    },
    sound: {
      mute: 'Desativar som',
      enable: 'Ativar som',
    },
    projects: {
      title: 'Projeto',
      none: 'Sem projeto',
      loadError: 'Não foi possível carregar os projetos.',
    },
    settings: {
      focus: 'Foco',
      shortBreak: 'Pausa Curta',
      longBreak: 'Pausa Longa',
      sessionsUntilLongBreak:
        'Sessões até a pausa longa',
      minutes: 'min',
    },
    sessionNumber: 'Sessão {{current}} de {{total}}',
  },

  focusHomeIdentity: {
    current: 'Sua FocushoMe',
    locked:
      'FocushoMe ainda não revelada',

    archetypes: {
      visionary: 'O Visionário',
      builder: 'O Construtor',
      finisher: 'O Finalizador',
      executor: 'O Executor',
      organizer: 'O Organizador',
      rhythmist: 'O Ritmista',
      restorer: 'O Restaurador',
      planner: 'O Planejador',
      catalyst: 'O Catalisador',
      explorer: 'O Explorador',
      strategist: 'O Estrategista',
      guardian: 'O Guardião',
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
    back: 'Voltar para Configurações',
    reportsSubtitle:
      'Seus relatórios, padrões e descobertas reunidos em um só lugar.',
    subtitle:
      'Uma nova forma de compreender sua jornada de foco.',
    coming: 'Em desenvolvimento no Focus 4.0',

    view: {
      week: 'Semana',
      month: 'Mês',
      label: 'Período do relatório',
    },

    monthlyReport: {
      eyebrow: 'Seu mês até agora',
      description:
        'Acompanhe como seu ritmo está se formando antes da retrospectiva mensal.',
      error:
        'Não foi possível preparar os dados deste mês.',
      focusTime: 'Tempo de foco',
      sessions: 'Sessões',
      activeDays: 'Dias ativos',
      tasksCompleted: 'Tarefas concluídas',
      noComparison: 'Sem mês anterior',
      weeklyEvolution: 'Evolução por semana',
      week: 'S{{number}}',
      noFocus:
        'As semanas aparecerão conforme você concluir sessões.',
      timeDistribution: 'Quando seu foco acontece',
      timeBlocks: {
        morning: 'Manhã',
        afternoon: 'Tarde',
        evening: 'Noite',
        late_night: 'Madrugada',
      },
      tasks: 'Tarefas',
      projects: 'Projetos',
      goals: 'Metas',
      created: 'criadas',
      completed: 'concluídos',
      topProjects: 'Projetos com mais foco',
      eligibility: {
        building: {
          title:
            'Sua análise está ganhando forma',
          description:
            'Continue usando o Focus naturalmente. Cada sessão e conclusão ajuda a construir uma leitura mais confiável do seu mês.',
        },
        ready: {
          title:
            'Dados suficientes para sua análise',
          description:
            'Seu mês já possui profundidade suficiente. Quando ele terminar, sua análise FocushoMe poderá ser realizada.',
        },
        eligible: {
          title:
            'Análise FocushoMe disponível',
          description:
            'Este mês encerrado possui dados suficientes para revelar ou reavaliar sua FocushoMe.',
        },
      },
    },

    weeklyReport: {
      available: 'Disponível agora',
      eyebrow: 'Sua semana até agora',
      title:
        'O que seu foco já conta sobre você',
      loading:
        'Reunindo os dados da sua semana...',
      error:
        'Não foi possível preparar seu resumo agora.',
      focusTime: 'Tempo de foco',
      sessions: 'Sessões',
      activeDays: 'Dias ativos',
      tasksCompleted: 'Tarefas concluídas',
      dailyRhythm: 'Ritmo diário',
      bestDay: 'Dia com mais foco',
      noFocus:
        'Conclua uma sessão para começar a formar seu relatório.',
      tasksTitle: 'Planejamento e execução',
      created: 'Criadas',
      completed: 'Concluídas',
      rhythmTitle: 'Continuidade',
      starts: 'Inícios',
      pauses: 'Pausas',
      resumes: 'Retomadas',
      abandoned: 'Interrompidas',
      topProject: 'Projeto em destaque',
      noProject:
        'Nenhum projeto recebeu sessões nesta semana.',
      currentWeek:
        'Este resumo evolui conforme você usa o Focus.',
      historyTitle: 'Histórico de relatórios',
      historyDescription:
        'Consulte suas retrospectivas semanais e mensais preservadas ao longo do tempo.',
    },


    hero: {
      title:
        'Seu foco conta uma história.',
      description:
        'O FocusMe reunirá suas sessões, tarefas, metas, projetos e conquistas para mostrar não apenas quanto você produziu, mas como sua rotina realmente aconteceu.',
    },

    experience: {
      title: 'Uma retrospectiva só sua',
      subtitle:
        'Cada parte do Focus ajudará a construir uma visão mais completa da sua jornada.',

      items: {
        weekly: {
          title: 'Sua semana',
          description:
            'Entenda seus dias mais focados, tarefas concluídas, projetos em destaque e mudanças no seu ritmo.',
        },

        monthly: {
          title: 'Seu mês',
          description:
            'Receba uma retrospectiva profunda, escrita de forma humana a partir de métricas calculadas pelo Focus.',
        },

        focusHome: {
          title: 'Sua FocushoMe',
          description:
            'Descubra uma classe rara baseada na maneira como você planeja, executa, conclui e mantém seu foco.',
        },

        sharing: {
          title: 'Sua história em uma imagem',
          description:
            'Transforme seus resultados em um recap personalizado pronto para compartilhar.',
        },
      },
    },

    focusHome: {
      title:
        'Mais do que uma insígnia',
      description:
        'Sua FocushoMe será uma identidade construída a partir do uso real do aplicativo. Ela não será definida apenas pelo horário em que você trabalha nem por deixar o timer rodando.',

      items: {
        rare:
          'Conquistada somente depois de um mês com dados suficientes.',
        complete:
          'Baseada em sessões, tarefas, metas, projetos e padrões de conclusão.',
        permanent:
          'Permanece com você e só muda quando um novo teste mensal for solicitado.',
      },
    },

    symbols: {
      title: 'As doze FocushoMes',
      subtitle:
        'Toque em um símbolo para conhecer a identidade, a potência e o ponto de equilíbrio de cada FocushoMe.',
      tap: 'Conhecer',
      open: 'Conhecer a FocushoMe {{name}}',
      close: 'Fechar',
      strength: 'Sua potência',
      balance: 'Ponto de equilíbrio',

      items: {
        aster: {
          essence:
            'A visão que antecede o caminho.',
          description:
            'Aster pertence a quem enxerga possibilidades antes de transformá-las em ações. Metas, ideias e planos costumam nascer com facilidade, formando uma visão ampla do que ainda pode ser construído.',
          strength:
            'Imaginar futuros possíveis, estabelecer direções e dar significado ao trabalho antes mesmo de ele começar.',
          balance:
            'Escolher quais possibilidades realmente merecem avançar, evitando que novos horizontes escondam os caminhos já abertos.',
        },

        atlas: {
          essence:
            'Profundidade para sustentar grandes jornadas.',
          description:
            'Atlas concentra energia em projetos importantes e permanece neles por longos períodos. Em vez de distribuir o foco entre muitas frentes, prefere carregar e desenvolver algo significativo.',
          strength:
            'Acumular profundidade, domínio e muitas horas de atenção em objetivos que exigem continuidade.',
          balance:
            'Reconhecer quando a responsabilidade assumida se tornou pesada demais e quando dividir o caminho pode fortalecer o resultado.',
        },

        forge: {
          essence:
            'Intenção transformada em resultado.',
          description:
            'Forge encontra satisfação em concluir. Tarefas abertas, projetos avançando e metas alcançadas formam o combustível de alguém que transforma planejamento em algo concreto.',
          strength:
            'Finalizar, resolver pendências e converter esforço em entregas que podem ser vistas e reconhecidas.',
          balance:
            'Não transformar toda experiência em obrigação de produzir; algumas ideias precisam de espaço antes de serem levadas ao fogo.',
        },

        pulse: {
          essence:
            'Movimento rápido que mantém o dia vivo.',
          description:
            'Pulse trabalha por impulsos curtos e frequentes. Pequenas tarefas, respostas rápidas e decisões imediatas criam uma sensação constante de progresso e movimento.',
          strength:
            'Destravar o cotidiano, reduzir pequenas pendências e reagir com agilidade ao que precisa acontecer agora.',
          balance:
            'Reservar períodos maiores para trabalhos que não entregam recompensa imediata, mas constroem resultados profundos.',
        },

        loom: {
          essence:
            'Fios diferentes formando uma única história.',
          description:
            'Loom conecta tarefas, projetos, metas e sessões de foco. Seu padrão não depende de uma única ferramenta: cada parte do Focus participa de uma estrutura maior.',
          strength:
            'Integrar planejamento e execução, mantendo diferentes áreas da vida conectadas sem perder o sentido do conjunto.',
          balance:
            'Evitar criar estruturas complexas demais quando uma decisão simples já seria suficiente para continuar.',
        },

        orbit: {
          essence:
            'Constância que cria seu próprio centro.',
          description:
            'Orbit retorna ao foco em horários e ciclos reconhecíveis. A força não está necessariamente em grandes picos, mas na capacidade de voltar ao mesmo eixo com regularidade.',
          strength:
            'Transformar o foco em rotina confiável, reduzindo a dependência de motivação momentânea.',
          balance:
            'Permitir mudanças quando a rotina deixa de servir, sem interpretar adaptação como perda de disciplina.',
        },

        tide: {
          essence:
            'Adaptação sem perder a direção.',
          description:
            'Tide muda de intensidade, horário e estratégia conforme o contexto. Seu ritmo pode variar bastante, mas existe inteligência na forma como responde às condições do momento.',
          strength:
            'Reorganizar prioridades, encontrar novas janelas de produtividade e continuar mesmo quando o plano original não funciona.',
          balance:
            'Criar alguns pontos estáveis para que a adaptação não se transforme em dispersão permanente.',
        },

        ember: {
          essence:
            'Uma intensidade que permanece acesa por dentro.',
          description:
            'Ember nem sempre produz o maior volume visível, mas mantém uma atenção profunda e silenciosa. Seu olho representa consciência: observar antes de agir e proteger a energia essencial.',
          strength:
            'Sustentar concentração interna, perceber detalhes e preservar motivação mesmo em períodos discretos.',
          balance:
            'Permitir que o trabalho interno se torne visível, compartilhando avanços e reconhecendo as próprias conquistas.',
        },

        nova: {
          essence:
            'A energia que inaugura novos caminhos.',
          description:
            'Nova aparece onde projetos, tarefas e possibilidades começam com intensidade. Existe entusiasmo em experimentar, iniciar e provocar movimento onde antes havia apenas intenção.',
          strength:
            'Dar o primeiro passo, gerar impulso e transformar uma ideia parada em algo que já começou a existir.',
          balance:
            'Manter energia depois do brilho inicial, escolhendo quais começos merecem chegar até o fim.',
        },

        prism: {
          essence:
            'Muitas formas de foco atravessando a mesma pessoa.',
          description:
            'Prism distribui atenção entre categorias, projetos, horários e formas diferentes de produzir. Sua identidade nasce da variedade e da capacidade de enxergar por vários ângulos.',
          strength:
            'Combinar perspectivas, alternar habilidades e encontrar soluções que não surgiriam de uma rotina completamente uniforme.',
          balance:
            'Criar prioridade entre tantas possibilidades para que variedade não se transforme em fragmentação.',
        },

        vanguard: {
          essence:
            'Presença firme diante do que não pode esperar.',
          description:
            'Vanguard reage com força quando existe prioridade, urgência ou responsabilidade clara. A pressão não paralisa: ela organiza o campo e indica onde a energia deve ser aplicada.',
          strength:
            'Tomar decisões, proteger o essencial e avançar em situações que exigem resposta rápida e direção.',
          balance:
            'Não depender apenas da urgência para agir e reservar energia para o importante antes que ele se torne emergencial.',
        },

        verdant: {
          essence:
            'Crescimento paciente que se torna duradouro.',
          description:
            'Verdant cultiva metas e projetos ao longo do tempo. Pequenos avanços podem parecer discretos isoladamente, mas formam raízes profundas quando observados durante todo o mês.',
          strength:
            'Construir resultados sustentáveis, respeitar processos longos e continuar mesmo quando a transformação',
          balance:
            'Celebrar etapas intermediárias para que a distância do resultado final não esconda tudo o que já cresceu.',
        },
      },
    },

    privacy: {
      title:
        'Sua rotina continua sendo sua',
      description:
        'O FocusMe utilizará somente as ações registradas dentro do Focus. Nenhum monitoramento constante será necessário.',

      items: {
        location:
          'Sem acesso à sua localização.',
        apps:
          'Sem acesso à atividade de outros aplicativos.',
        device:
          'Sem monitoramento permanente do dispositivo.',
      },
    },

    development: {
      title:
        'O FocusMe está em desenvolvimento',
      description:
        'Esta página será atualizada conforme os recursos do Focus 4.0 forem concluídos.',
    },
  },

  focusMeHistoryPage: {
    back: 'Voltar para o FocusMe',
    title: 'Histórico de relatórios',
    subtitle:
      'Revisite suas semanas, seus meses e a evolução da sua rotina.',
    filterLabel: 'Filtrar relatórios',
    error:
      'Não foi possível carregar seu histórico.',
    sessions: 'sessões',
    tasks: 'tarefas concluídas',
    types: {
      weekly: 'Semanal',
      monthly: 'Mensal',
    },
    filters: {
      all: 'Todos',
      weekly: 'Semanais',
      monthly: 'Mensais',
    },
    empty: {
      title:
        'Seus relatórios aparecerão aqui',
      description:
        'Quando uma semana ou um mês for encerrado, o FocusMe preservará a retrospectiva para que ela não mude com o tempo.',
      schedule:
        'Semanas fecham na segunda-feira',
    },
  },

  focusMeReportPage: {
    back: 'Voltar ao histórico',
    error:
      'Este relatório não foi encontrado ou não pôde ser carregado.',
    types: {
      weekly: 'Retrospectiva semanal',
      monthly: 'Retrospectiva mensal',
    },
    preserved:
      'Relatório encerrado e preservado',
    focusTime: 'Tempo de foco',
    sessions: 'Sessões',
    activeDays: 'Dias ativos',
    tasksCompleted: 'Tarefas concluídas',
    dailyEvolution: 'Evolução diária',
    weeklyEvolution: 'Evolução semanal',
    week: 'S{{number}}',
    noFocus:
      'Nenhuma sessão de foco foi concluída neste período.',
    tasks: 'Tarefas concluídas / criadas',
    projects: 'Projetos concluídos / criados',
    goals: 'Metas concluídas / criadas',
    topProject: 'Projeto em destaque',
    yourStory: 'A história do seu período',
  },

  changesPage: {
    back: 'Voltar para Configurações',
    title: 'Mudanças e novidades',
    subtitle:
      'Acompanhe tudo o que evoluiu no Focus e o que estamos preparando.',
    currentVersion: 'Versão atual',
    currentDescription:
      'Uma nova geração do Focus, com tarefas mais inteligentes, projetos concluíveis e a fundação do FocusMe.',
    new: 'Novo',

    recent: {
      title: 'Novidades recentes',
      subtitle:
        'As melhorias mais novas disponíveis no aplicativo.',

      items: {
        taskCategories: {
          title: 'Nova experiência de tarefas',
          description:
            'As tarefas agora possuem categorias, filtros combináveis, projeto associado e estimativa de Pomodoros.',
        },

        taskTrash: {
          title: 'Lixeira de tarefas',
          description:
            'Tarefas removidas podem ser restauradas durante 30 dias antes da exclusão definitiva.',
        },

        projectLifecycle: {
          title: 'Conclusão de projetos',
          description:
            'Projetos agora podem ser concluídos, consultados separadamente e reabertos sem perder seu histórico.',
        },

        focusMePreview: {
          title: 'Conheça o FocusMe',
          description:
            'Uma nova página apresenta as retrospectivas, a FocushoMe e a visão do Focus para análises pessoais.',
        },

        taskEditing: {
          title: 'Edição de tarefas',
          description:
            'Agora você pode corrigir ou atualizar o nome de uma tarefa sem precisar excluí-la e criar outra.',
        },
        responsive: {
          title: 'Melhorias de responsividade',
          description:
            'Textos, cabeçalhos e espaçamentos foram refinados para oferecer uma experiência melhor em celulares e tablets.',
        },
        changesCenter: {
          title: 'Central de mudanças',
          description:
            'Este novo espaço reúne o histórico do Focus, as novidades recentes e os próximos recursos.',
        },
      },
    },

    history: {
      title: 'Histórico de versões',
      subtitle:
        'Veja como o Focus evoluiu desde sua primeira versão.',
      current: 'Atual',

      versions: {
        v4: {
          description:
            'O Focus começou uma nova fase, conectando organização diária, conclusão e compreensão da rotina.',
          items: {
            taskEditing:
              'Edição completa de tarefas sem precisar excluí-las.',
            taskCategories:
              'Categorias Rápida, Planejada, Urgente e Longo prazo, com filtros e identificação visual minimalista.',
            taskTrash:
              'Lixeira com restauração por 30 dias e exclusão definitiva.',
            projectLifecycle:
              'Conclusão, reabertura e filtros de projetos, preservando horas, tarefas e sessões.',
            focusMePreview:
              'Apresentação do FocusMe, da FocushoMe, das futuras retrospectivas e da política de privacidade.',
          },
        },

        v3: {
          description:
            'O Focus se tornou uma experiência verdadeiramente multiplataforma e bilíngue.',
          items: {
            languages:
              'Aplicativo completo em português e inglês.',
            androidWidgets:
              'Novos widgets para dispositivos Android.',
            autoStart:
              'Opções para iniciar pausas e sessões de foco automaticamente.',
            widgetImprovements:
              'Melhorias de layout, sincronização e responsividade dos widgets.',
          },
        },

        v2: {
          description:
            'A experiência móvel ganhou recursos nativos e maior integração com o sistema.',
          items: {
            android:
              'Versão nativa do Focus para Android.',
            liveNotifications:
              'Timer visível em notificações ao vivo durante as sessões.',
            appleExperience:
              'Live Activity, Dynamic Island e widgets no iPhone.',
            tabletSupport:
              'Layouts e widgets adaptados para iPad.',
          },
        },

        v1: {
          description:
            'A base do Focus nasceu com as ferramentas essenciais para organizar tempo e progresso.',
          items: {
            pomodoro:
              'Timer Pomodoro com durações personalizáveis.',
            organization:
              'Tarefas, projetos e metas anuais.',
            progress:
              'Sequências, insígnias, análises e histórico de foco.',
            accounts:
              'Conta Google com sincronização e modo visitante.',
          },
        },
      },
    },

    roadmap: {
      title: 'Ainda chegando no Focus 4.0',
      subtitle:
        'A base já está disponível. Agora estamos construindo a experiência completa do FocusMe.',

      status: {
        development: 'Em desenvolvimento',
        planned: 'Planejado',
      },

      items: {
        taskExperience: {
          title: 'Nova experiência de tarefas',
          description:
            'Uma tela reorganizada, mais completa e ainda fiel ao minimalismo do Focus.',
        },

        categories: {
          title: 'Categorias de tarefas',
          description:
            'Tarefas rápidas, planejadas, urgentes e de longo prazo com filtros e identificação visual discreta.',
        },

        trash: {
          title: 'Lixeira de tarefas',
          description:
            'Recupere tarefas removidas durante 30 dias antes da exclusão definitiva.',
        },

        weeklyRecaps: {
          title: 'Recaps semanais',
          description:
            'Um resumo completo dos seus dias, sessões, tarefas, metas, projetos e conquistas.',
        },

        monthlyRecaps: {
          title: 'Retrospectivas mensais',
          description:
            'Uma visão profunda do mês com métricas, padrões, comparações e uma narrativa pessoal.',
        },

        focusHome: {
          title: 'FocushoMe',
          description:
            'Uma classe rara e permanente baseada na forma como você planeja, executa e conclui.',
        },

        sharing: {
          title: 'Relatórios compartilháveis',
          description:
            'Recaps personalizados em PNG para compartilhar seus resultados e sua FocushoMe.',
        },

        history: {
          title: 'Histórico do FocusMe',
          description:
            'Consulte recaps semanais, retrospectivas mensais e análises anteriores.',
        },

        notifications: {
          title: 'Novos relatórios disponíveis',
          description:
            'Receba um aviso opcional quando sua semana, seu mês ou sua FocushoMe estiverem prontos.',
        },
      },

      disclaimer:
        'Os recursos restantes serão adicionados progressivamente durante a evolução do Focus 4.0.',
    },
  },

  settings: {
    title: 'Configurações',
    subtitle:
      'Personalize sua experiência de foco',

    language: {
      title: 'Idioma',
      description:
        'Escolha o idioma usado em todo o Focus.',
      english: 'English',
      portugueseBrazil:
        'Português (Brasil)',
    },

    account: {
      title: 'Conta',
      connected: 'Conta conectada',
      googleConnected:
        'Conta Google conectada',
      displayName:
        'Nome de exibição',
      displayNameDescription:
        'Este nome aparecerá na saudação do Dashboard.',
      placeholder: 'Seu nome',
      saving: 'Salvando...',
      save: 'Salvar nome',
      saved: 'Nome salvo.',
      signOut: 'Sair',
      signingOut: 'Saindo...',
      guestMode:
        'Modo visitante',
      guestDescription:
        'Você está usando o Focus sem uma conta. Seus dados são armazenados apenas neste dispositivo.',
      continueGoogle:
        'Continuar com Google',
      redirecting:
        'Redirecionando...',
      exitGuest:
        'Sair do modo visitante',
      noAccount:
        'Nenhuma conta conectada',
      noAccountDescription:
        'Conecte sua conta Google para sincronizar seus dados do Focus.',
    },

    timer: {
      title: 'Duração do timer',
      focus: 'Sessão de foco',
      shortBreak: 'Pausa curta',
      longBreak: 'Pausa longa',
      sessionsUntilLongBreak:
        'Sessões até a pausa longa',
      minutes: 'min',
    },

    preferences: {
      title: 'Preferências',
      sound:
        'Notificações sonoras',
      autoBreak:
        'Iniciar pausas automaticamente',
      autoWork:
        'Iniciar sessões de foco automaticamente',
    },

    focusMe: {
      title: 'Sobre o FocusMe',
      badge: 'Focus 4.0',
      description:
        'Descubra como sua atividade será transformada em retrospectivas pessoais.',
    },

    changes: {
      title: 'Mudanças e novidades',
      description:
        'Conheça a evolução do Focus e veja o que está por vir.',
    },

    about: {
      title: 'Sobre',
      description:
        'Focus v4.0 — Um aplicativo minimalista de Pomodoro e produtividade. Dados do modo visitante são armazenados localmente no dispositivo.',
    },
  },
}

export default ptBR
