import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Timer,
  FolderOpen,
  CheckSquare,
  Flame,
  BarChart3,
  Settings,
} from 'lucide-react'

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

export function SidebarDesktop() {
  return (
    <aside
      className="
        hidden
        lg:flex
        lg:flex-col
        w-72
        h-screen
        sticky
        top-0
        bg-[#111111]
        border-r
        border-white/10
        flex-shrink-0
      "
    >
      <div
        className="
          h-16
          flex
          items-center
          px-5
          border-b
          border-white/10
        "
      >
        <div
          className="
            w-8
            h-8
            rounded-xl
            bg-gradient-to-br
            from-emerald-400
            to-emerald-600
            flex
            items-center
            justify-center
          "
        >
          <Timer
            size={16}
            className="text-black"
          />
        </div>

        <span className="ml-3 font-semibold text-white">
          Focus
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">

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
                  `
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  rounded-xl
                  text-sm
                  font-medium
                  transition-colors
                  `,
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Icon size={18}/>

              <span>
                {label}
              </span>

            </NavLink>

          )
        )}

      </nav>

      <div className="p-3 border-t border-white/10">

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              `
              flex
              items-center
              gap-3
              px-3
              py-2.5
              rounded-xl
              text-sm
              font-medium
              transition-colors
              `,
              isActive
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            )
          }
        >

          <Settings size={18}/>

          <span>
            Settings
          </span>

        </NavLink>

      </div>

    </aside>
  )
}