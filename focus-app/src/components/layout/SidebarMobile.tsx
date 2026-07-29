import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  Timer,
  FolderOpen,
  CheckSquare,
  Flame,
  BarChart3,
  Settings,
  X,
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

interface SidebarMobileProps {
  open: boolean
  onClose: () => void
}

export function SidebarMobile({
  open,
  onClose,
}: SidebarMobileProps) {
  return (
    <AnimatePresence>

      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="
              lg:hidden
              fixed
              inset-0
              z-40
              bg-black/60
              backdrop-blur-sm
            "
          />

          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'tween',
              duration: 0.25,
            }}
            className="
              lg:hidden
              fixed
              top-0
              left-0
              z-50
              flex
              flex-col
              h-screen
              w-72
              bg-[#111111]
              border-r
              border-white/10
            "
          >

            <div className="
              flex
              items-center
              justify-between
              px-5
              h-16
              border-b
              border-white/10
            ">
              <span className="font-semibold text-white">
                Focus
              </span>

              <button
                onClick={onClose}
                className="p-2 rounded-lg"
              >
                <X size={18}/>
              </button>
            </div>

            <nav className="
              flex-1
              px-3
              py-4
              space-y-1
            ">
              {navItems.map(
                ({
                  icon: Icon,
                  label,
                  path,
                }) => (

                  <NavLink
                    key={path}
                    to={path}
                    onClick={onClose}
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
                        `,
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/60'
                      )
                    }
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </NavLink>

                )
              )}
            </nav>

            <div className="p-3 border-t border-white/10">

              <NavLink
                to="/settings"
                onClick={onClose}
                className="
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  rounded-xl
                  text-white/60
                "
              >
                <Settings size={18}/>
                <span>Settings</span>
              </NavLink>

            </div>

          </motion.aside>
        </>
      )}

    </AnimatePresence>
  )
}