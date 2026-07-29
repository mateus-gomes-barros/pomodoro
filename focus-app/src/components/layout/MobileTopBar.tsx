import { Menu } from 'lucide-react'

import { usePomodoroSessions } from '@/hooks/pomodoro/usePomodoroSessions'
import {
  getStreakBadge,
} from '@/lib/streakBadges'
import {
  format,
  subDays,
} from 'date-fns'

type MobileTopBarProps = {
  onOpenMenu: () => void
}

function calculateCurrentStreak(
  activeDates: string[],
): number {
  const uniqueDates = new Set(activeDates)

  const today = new Date()
  const todayString = format(
    today,
    'yyyy-MM-dd',
  )

  const yesterday = subDays(today, 1)
  const yesterdayString = format(
    yesterday,
    'yyyy-MM-dd',
  )

  let currentDate: Date | null =
    uniqueDates.has(todayString)
      ? today
      : uniqueDates.has(yesterdayString)
        ? yesterday
        : null

  let currentStreak = 0

  while (currentDate) {
    const dateString = format(
      currentDate,
      'yyyy-MM-dd',
    )

    if (!uniqueDates.has(dateString)) {
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

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-16
        items-center
        justify-between
        border-b
        border-white/[0.06]
        bg-[#0a0a0a]/90
        px-5
        backdrop-blur-xl
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
          items-center
          justify-center
          rounded-2xl
          border
          border-white/[0.08]
          bg-[#161616]
          text-white/70
          shadow-lg
          transition
          hover:text-white
          active:scale-95
        "
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-4">
        <div
          className="
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-white/[0.06]
            bg-white/[0.035]
            px-3
            py-1.5
          "
          aria-label={`${currentStreak} day streak`}
        >
          <span
            className="text-base"
            aria-hidden="true"
          >
            {badge.icon}
          </span>

          <span className="font-mono text-sm font-semibold text-white/80">
            {currentStreak}
          </span>
        </div>

        <div
          className="
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-white/[0.06]
            bg-white/[0.035]
            px-3
            py-1.5
          "
          aria-label={`${totalPomodoros} completed pomodoros`}
        >
          <span
            className="text-sm"
            aria-hidden="true"
          >
            🍅
          </span>

          <span className="font-mono text-sm font-semibold text-white/80">
            {totalPomodoros}
          </span>
        </div>
      </div>
    </header>
  )
}