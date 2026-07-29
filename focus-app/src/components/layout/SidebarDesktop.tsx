import {
  useMemo,
  useState,
} from 'react'
import {
  NavLink,
  useNavigate,
} from 'react-router-dom'
import {
  BarChart3,
  CheckSquare,
  Flame,
  FolderOpen,
  LayoutDashboard,
  LogIn,
  LogOut,
  Settings,
  Timer,
} from 'lucide-react'
import {
  format,
  subDays,
} from 'date-fns'

import { useAuth } from '@/contexts/AuthContext'
import { usePomodoroSessions } from '@/hooks/pomodoro/usePomodoroSessions'
import { getStreakBadge } from '@/lib/streakBadges'
import { signOut } from '@/services/authService'
import { cn } from '@/utils'

const navItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/',
  },
  {
    icon: Timer,
    label: 'Timer',
    path: '/timer',
  },
  {
    icon: FolderOpen,
    label: 'Projects',
    path: '/projects',
  },
  {
    icon: CheckSquare,
    label: 'Tasks',
    path: '/tasks',
  },
  {
    icon: Flame,
    label: 'Streaks',
    path: '/streaks',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    path: '/analytics',
  },
]

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

export function SidebarDesktop() {
  const navigate = useNavigate()

  const {
    user,
    isDemoMode,
    exitDemoMode,
  } = useAuth()

  const sessionsQuery =
    usePomodoroSessions()

  const [
    isSigningOut,
    setIsSigningOut,
  ] = useState(false)

  const workSessions = useMemo(
    () =>
      (sessionsQuery.data ?? []).filter(
        (session) =>
          session.type === 'work',
      ),
    [sessionsQuery.data],
  )

  const currentStreak = useMemo(
    () =>
      calculateCurrentStreak(
        workSessions.map(
          (session) => session.date,
        ),
      ),
    [workSessions],
  )

  const currentBadge =
    getStreakBadge(currentStreak)

  const totalPomodoros =
    workSessions.length

  const streakLabel =
    currentStreak === 1
      ? '1 day streak'
      : `${currentStreak} days streak`

  async function handleSignOut() {
    try {
      setIsSigningOut(true)

      await signOut()

      navigate(
        '/login',
        {
          replace: true,
        },
      )
    } catch (error) {
      console.error(
        'Failed to sign out:',
        error,
      )
    } finally {
      setIsSigningOut(false)
    }
  }

  function handleLogin() {
    navigate('/login')
  }

  function handleExitDemoMode() {
    exitDemoMode()

    navigate(
      '/login',
      {
        replace: true,
      },
    )
  }

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col',
        'w-64 flex-shrink-0',
        'h-screen sticky top-0',
        'bg-[#111111] border-r border-white/[0.07]',
      )}
    >
      <div className="h-14 flex items-center px-5 border-b border-white/[0.07] flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
          <Timer
            size={14}
            className="text-black"
          />
        </div>

        <span className="ml-3 font-semibold text-white text-sm tracking-tight">
          Focus
        </span>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(
          ({
            icon: Icon,
            label,
            path,
          }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({
                isActive,
              }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5',
                )
              }
            >
              <Icon
                size={16}
                className="flex-shrink-0"
              />

              <span className="truncate">
                {label}
              </span>
            </NavLink>
          ),
        )}
      </nav>

      <div className="px-3 pb-3 flex-shrink-0">
        <NavLink
          to="/streaks"
          className={({
            isActive,
          }) =>
            cn(
              `
                group
                block
                overflow-hidden
                rounded-2xl
                border
                p-3
                transition
                duration-200
              `,
              isActive
                ? `
                    border-emerald-400/25
                    bg-emerald-400/[0.08]
                  `
                : `
                    border-white/[0.07]
                    bg-white/[0.025]
                    hover:border-white/[0.11]
                    hover:bg-white/[0.045]
                  `,
            )
          }
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-white/[0.07]
                bg-white/[0.045]
                text-2xl
                shadow-[0_8px_24px_rgba(0,0,0,0.18)]
                transition
                duration-200
                group-hover:scale-[1.03]
              "
              aria-hidden="true"
            >
              {currentBadge.icon}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="
                  truncate
                  text-[13px]
                  font-semibold
                  tracking-[-0.01em]
                  text-white/90
                "
              >
                {currentBadge.name}
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-[11px]
                  font-medium
                  text-white/35
                "
              >
                {streakLabel}
              </p>
            </div>

            <Flame
              size={15}
              className={cn(
                'shrink-0 transition-colors',
                currentStreak > 0
                  ? 'text-emerald-400'
                  : 'text-white/20',
              )}
            />
          </div>

          <div
            className="
              mt-3
              flex
              items-center
              justify-between
              border-t
              border-white/[0.06]
              pt-3
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-white/25
                "
              >
                Streak
              </p>

              <p
                className="
                  mt-0.5
                  text-sm
                  font-semibold
                  text-white/80
                "
              >
                {currentStreak}
              </p>
            </div>

            <div className="text-right">
              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-white/25
                "
              >
                Pomodoros
              </p>

              <p
                className="
                  mt-0.5
                  text-sm
                  font-semibold
                  text-white/80
                "
              >
                {totalPomodoros}
                <span
                  className="ml-1 text-xs"
                  aria-hidden="true"
                >
                  🍅
                </span>
              </p>
            </div>
          </div>
        </NavLink>
      </div>

      <div className="px-3 pb-4 border-t border-white/[0.07] pt-3 flex-shrink-0 space-y-1">
        <NavLink
          to="/settings"
          className={({
            isActive,
          }) =>
            cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150',
              isActive
                ? 'bg-white/10 text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5',
            )
          }
        >
          <Settings
            size={16}
            className="flex-shrink-0"
          />

          <span className="truncate">
            Settings
          </span>
        </NavLink>

        {user && (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className={cn(
              'flex w-full items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150',
              'text-white/50 hover:text-red-300 hover:bg-red-500/10',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <LogOut
              size={16}
              className="flex-shrink-0"
            />

            <span className="truncate">
              {isSigningOut
                ? 'Signing out...'
                : 'Sign out'}
            </span>
          </button>
        )}

        {!user && isDemoMode && (
          <>
            <button
              type="button"
              onClick={handleLogin}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150',
                'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10',
              )}
            >
              <LogIn
                size={16}
                className="flex-shrink-0"
              />

              <span className="truncate">
                Log in
              </span>
            </button>

            <button
              type="button"
              onClick={handleExitDemoMode}
              className={cn(
                'flex w-full items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150',
                'text-white/50 hover:text-red-300 hover:bg-red-500/10',
              )}
            >
              <LogOut
                size={16}
                className="flex-shrink-0"
              />

              <span className="truncate">
                Exit guest mode
              </span>
            </button>
          </>
        )}
      </div>
    </aside>
  )
}