import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/utils'

// ─────────────────────────────────────────────────────────────
// Design Tokens
// ─────────────────────────────────────────────────────────────

const CARD_BASE =
  'bg-[#161616] rounded-2xl border border-white/[0.07] shadow-[0_1px_3px_rgba(0,0,0,0.4),0_6px_20px_rgba(0,0,0,0.25)]'

const CARD_HOVER =
  'hover:border-white/[0.12] hover:shadow-[0_4px_12px_rgba(0,0,0,0.5),0_12px_32px_rgba(0,0,0,0.3)] transition-all duration-300'

// ─────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  animate?: boolean
}

export function Card({
  children,
  className,
  hover = false,
  onClick,
  animate = true,
}: CardProps) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 6 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={
        animate
          ? {
              duration: 0.28,
              ease: [0.16, 1, 0.3, 1],
            }
          : undefined
      }
      whileHover={
        hover
          ? {
              y: -2,
              transition: {
                duration: 0.18,
              },
            }
          : undefined
      }
      onClick={onClick}
      className={cn(
        CARD_BASE,
        hover && CARD_HOVER,
        hover && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  accent?: boolean
  delay?: number
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  accent = false,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        CARD_BASE,
        'p-6 flex flex-col justify-between min-h-[124px]',
      )}
    >
      {/* Header */}

      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">
          {label}
        </span>

        {icon && (
          <div
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
              accent
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-white/5 text-white/40',
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Body */}

      <div className="mt-4">
        <div
          className={cn(
            'text-[30px] font-bold tracking-tight leading-none',
            accent ? 'text-emerald-400' : 'text-white',
          )}
        >
          {value}
        </div>

        {sub && (
          <p className="mt-2 text-[12px] leading-relaxed text-white/35">
            {sub}
          </p>
        )}
      </div>
    </motion.div>
  )
}