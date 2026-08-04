import {
    motion,
  } from 'framer-motion'
  import {
    Menu,
  } from 'lucide-react'
  import {
    format,
    subDays,
  } from 'date-fns'
  
  import {
    usePomodoroSessions,
  } from '@/hooks/pomodoro/usePomodoroSessions'
  import {
    getStreakBadge,
  } from '@/lib/streakBadges'
  
  type MobileTopBarProps = {
    onOpenMenu: () => void
  }
  
  function calculateCurrentStreak(
    activeDates: string[],
  ): number {
    const uniqueDates = new Set(
      activeDates,
    )
  
    const today = new Date()
  
    const todayString = format(
      today,
      'yyyy-MM-dd',
    )
  
    const yesterday = subDays(
      today,
      1,
    )
  
    const yesterdayString = format(
      yesterday,
      'yyyy-MM-dd',
    )
  
    let currentDate: Date | null =
      uniqueDates.has(todayString)
        ? today
        : uniqueDates.has(
              yesterdayString,
            )
          ? yesterday
          : null
  
    let currentStreak = 0
  
    while (currentDate) {
      const dateString = format(
        currentDate,
        'yyyy-MM-dd',
      )
  
      if (
        !uniqueDates.has(dateString)
      ) {
        break
      }
  
      currentStreak += 1
  
      currentDate = subDays(
        currentDate,
        1,
      )
    }
  
    return currentStreak
  }
  
  export function MobileTopBar({
    onOpenMenu,
  }: MobileTopBarProps) {
    const sessionsQuery =
      usePomodoroSessions()
  
    const sessions =
      sessionsQuery.data ?? []
  
    const workSessions =
      sessions.filter(
        (session) =>
          session.type === 'work',
      )
  
    const currentStreak =
      calculateCurrentStreak(
        workSessions.map(
          (session) => session.date,
        ),
      )
  
    const totalPomodoros =
      workSessions.length
  
    const badge =
      getStreakBadge(currentStreak)
  
    const streakLabel =
      currentStreak === 1
        ? '1 day'
        : `${currentStreak} days`
  
    return (
      <header
        className="
          sticky
          top-0
          z-30
          flex
          h-[calc(72px+env(safe-area-inset-top))]
          pt-[env(safe-area-inset-top)]
          items-center
          justify-between
          border-b
          border-white/[0.06]
          bg-[#0a0a0a]/85
          px-5
          backdrop-blur-2xl
          lg:hidden
        "
      >
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-2xl
            border
            border-white/[0.08]
            bg-white/[0.04]
            text-white/65
            shadow-[0_8px_30px_rgba(0,0,0,0.18)]
            transition
            duration-200
            hover:border-white/[0.12]
            hover:bg-white/[0.06]
            hover:text-white
            active:scale-95
          "
        >
          <Menu size={20} />
        </button>
  
        <motion.div
          initial={{
            opacity: 0,
            y: -6,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.35,
            ease: 'easeOut',
          }}
          className="
            ml-4
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <motion.div
            key={badge.name}
            initial={{
              opacity: 0,
              scale: 0.82,
              rotate: -5,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
            }}
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.045]
              text-xl
              leading-none
              shadow-[0_8px_25px_rgba(0,0,0,0.16)]
            "
            aria-hidden="true"
          >
            {badge.icon}
          </motion.div>
  
          <div
            className="
              min-w-0
              text-right
            "
          >
            <motion.p
              key={badge.name}
              initial={{
                opacity: 0,
                x: 5,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
              className="
                truncate
                text-sm
                font-semibold
                tracking-[-0.01em]
                text-white/90
              "
            >
              {badge.name}
            </motion.p>
  
            <p
              className="
                mt-1
                truncate
                text-[11px]
                font-medium
                tracking-[0.01em]
                text-white/35
              "
            >
              {streakLabel} streak
              <span
                className="
                  mx-1.5
                  text-white/15
                "
                aria-hidden="true"
              >
                •
              </span>
              {totalPomodoros}
              <span
                className="ml-1"
                aria-hidden="true"
              >
                🍅
              </span>
            </p>
          </div>
        </motion.div>
      </header>
    )
  }