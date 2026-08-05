import { motion } from 'framer-motion'
import {
  BarChart3,
  CheckSquare,
  Flame,
  FolderOpen,
  LayoutDashboard,
  Settings,
  Target,
  Timer,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

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
    icon: Target,
    label: 'Goals',
    path: '/goals',
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

export const MOBILE_DRAWER_WIDTH = 256

const CLOSE_DISTANCE = 70
const CLOSE_VELOCITY = -500

interface SidebarMobileProps {
  open: boolean
  dragProgress: number
  isDragging: boolean
  onClose: () => void
}

export function SidebarMobile({
  open,
  dragProgress,
  isDragging,
  onClose,
}: SidebarMobileProps) {
  const visibleProgress = open
    ? 1
    : dragProgress

  const drawerPosition =
    -MOBILE_DRAWER_WIDTH +
    MOBILE_DRAWER_WIDTH *
      visibleProgress

  const isVisible =
    open || dragProgress > 0

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          opacity:
            visibleProgress * 0.9,
        }}
        transition={
          isDragging
            ? {
                duration: 0,
              }
            : {
                duration: 0.2,
                ease: 'easeOut',
              }
        }
        onClick={onClose}
        aria-hidden="true"
        style={{
          pointerEvents: isVisible
            ? 'auto'
            : 'none',
        }}
        className="
          fixed
          inset-0
          z-40
          bg-black/60
          backdrop-blur-sm
          lg:hidden
        "
      />

      <motion.aside
        initial={false}
        animate={{
          x: drawerPosition,
        }}
        transition={
          isDragging
            ? {
                duration: 0,
              }
            : {
                type: 'tween',
                duration: 0.24,
                ease: [
                  0.32,
                  0,
                  0.2,
                  1,
                ],
              }
        }
        drag={open ? 'x' : false}
        dragDirectionLock
        dragConstraints={{
          left: -MOBILE_DRAWER_WIDTH,
          right: 0,
        }}
        dragElastic={0.04}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          const draggedFarEnough =
            info.offset.x <=
            -CLOSE_DISTANCE

          const draggedFastEnough =
            info.velocity.x <=
            CLOSE_VELOCITY

          if (
            draggedFarEnough ||
            draggedFastEnough
          ) {
            onClose()
          }
        }}
        aria-hidden={!isVisible}
        style={{
          pointerEvents: isVisible
            ? 'auto'
            : 'none',
        }}
        className={cn(
          'fixed left-0 top-0 z-50 lg:hidden',
          'flex h-[100dvh] w-64 flex-col',
          'pt-[env(safe-area-inset-top)]',
          'pb-[env(safe-area-inset-bottom)]',
          'border-r border-white/[0.07] bg-[#111111]',
          'touch-pan-y',
          'will-change-transform',
        )}
      >
        <div
          className="
            flex
            h-14
            flex-shrink-0
            items-center
            justify-between
            border-b
            border-white/[0.07]
            px-5
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
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg
                bg-gradient-to-br
                from-emerald-400
                to-emerald-600
              "
            >
              <Timer
                size={14}
                className="text-black"
              />
            </div>

            <span
              className="
                text-sm
                font-semibold
                tracking-tight
                text-white
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
              rounded-lg
              p-1.5
              text-white/40
              transition-colors
              hover:bg-white/5
              hover:text-white
            "
          >
            <X size={16} />
          </button>
        </div>

        <nav
          className="
            flex-1
            space-y-0.5
            overflow-y-auto
            px-3
            py-3
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
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80',
                  )
                }
              >
                <Icon
                  size={16}
                  className="flex-shrink-0"
                />

                <span>{label}</span>
              </NavLink>
            ),
          )}
        </nav>

        <div
          className="
            flex-shrink-0
            border-t
            border-white/[0.07]
            px-3
            pb-4
            pt-3
          "
        >
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({
              isActive,
            }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors duration-150',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/80',
              )
            }
          >
            <Settings
              size={16}
              className="flex-shrink-0"
            />

            <span>Settings</span>
          </NavLink>
        </div>
      </motion.aside>
    </>
  )
}