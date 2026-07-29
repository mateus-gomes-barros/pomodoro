import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Timer,
  FolderOpen,
  CheckSquare,
  Flame,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'

import { signOut } from '@/services/authService'
import { cn } from '../../utils'

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

export function SidebarDesktop() {
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    try {
      setIsSigningOut(true)
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
      setIsSigningOut(false)
    }
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
              className={({ isActive }) =>
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

      <div className="px-3 pb-4 border-t border-white/[0.07] pt-3 flex-shrink-0 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
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
      </div>
    </aside>
  )
}