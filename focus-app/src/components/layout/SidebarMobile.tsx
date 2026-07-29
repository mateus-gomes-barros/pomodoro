import { useRef } from 'react'
import type { TouchEvent } from 'react'
import { NavLink } from 'react-router-dom'
import {
  AnimatePresence,
  motion,
} from 'framer-motion'
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

const SWIPE_DISTANCE = 60
const VERTICAL_TOLERANCE = 80

interface SidebarMobileProps {
  open: boolean
  onClose: () => void
}

export function SidebarMobile({
  open,
  onClose,
}: SidebarMobileProps) {
  const touchStartXRef =
    useRef<number | null>(null)

  const touchStartYRef =
    useRef<number | null>(null)

  function handleTouchStart(
    event: TouchEvent<HTMLElement>,
  ) {
    const touch = event.touches[0]

    if (!touch) {
      return
    }

    touchStartXRef.current =
      touch.clientX

    touchStartYRef.current =
      touch.clientY
  }

  function handleTouchEnd(
    event: TouchEvent<HTMLElement>,
  ) {
    if (
      touchStartXRef.current === null ||
      touchStartYRef.current === null
    ) {
      resetSwipe()
      return
    }

    const touch =
      event.changedTouches[0]

    if (!touch) {
      resetSwipe()
      return
    }

    const horizontalDistance =
      touch.clientX -
      touchStartXRef.current

    const verticalDistance =
      Math.abs(
        touch.clientY -
          touchStartYRef.current,
      )

    const isLeftSwipe =
      horizontalDistance <=
        -SWIPE_DISTANCE &&
      verticalDistance <=
        VERTICAL_TOLERANCE

    if (isLeftSwipe) {
      onClose()
    }

    resetSwipe()
  }

  function handleTouchCancel() {
    resetSwipe()
  }

  function resetSwipe() {
    touchStartXRef.current = null
    touchStartYRef.current = null
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.18,
            }}
            onClick={onClose}
            aria-hidden="true"
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
            key="drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{
              type: 'tween',
              duration: 0.22,
              ease: [
                0.32,
                0,
                0.67,
                0,
              ],
            }}
            onTouchStart={
              handleTouchStart
            }
            onTouchEnd={handleTouchEnd}
            onTouchCancel={
              handleTouchCancel
            }
            className={cn(
              'lg:hidden fixed top-0 left-0 z-50',
              'flex flex-col w-64 h-screen',
              'bg-[#111111] border-r border-white/[0.07]',
            )}
          >
            <div
              className="
                h-14
                flex
                items-center
                justify-between
                px-5
                border-b
                border-white/[0.07]
                flex-shrink-0
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    w-7
                    h-7
                    rounded-lg
                    bg-gradient-to-br
                    from-emerald-400
                    to-emerald-600
                    flex
                    items-center
                    justify-center
                  "
                >
                  <Timer
                    size={14}
                    className="text-black"
                  />
                </div>

                <span
                  className="
                    font-semibold
                    text-white
                    text-sm
                    tracking-tight
                  "
                >
                  Focus
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="
                  p-1.5
                  rounded-lg
                  text-white/40
                  hover:text-white
                  hover:bg-white/5
                  transition-colors
                "
              >
                <X size={16} />
              </button>
            </div>

            <nav
              className="
                flex-1
                px-3
                py-3
                space-y-0.5
                overflow-y-auto
              "
            >
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
                    onClick={onClose}
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

                    <span>
                      {label}
                    </span>
                  </NavLink>
                ),
              )}
            </nav>

            <div
              className="
                px-3
                pb-4
                border-t
                border-white/[0.07]
                pt-3
                flex-shrink-0
              "
            >
              <NavLink
                to="/settings"
                onClick={onClose}
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

                <span>
                  Settings
                </span>
              </NavLink>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}