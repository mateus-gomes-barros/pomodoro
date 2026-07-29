import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  animate?: boolean
}

export function Card({
  children,
  className = '',
  hover = false,
  onClick,
  animate = true,
}: CardProps) {

  const Comp = animate ? motion.div : 'div'

  return (
    <Comp
      initial={animate ? { opacity: 0, y: 8 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={
        animate
          ? {
              duration: 0.3,
            }
          : undefined
      }
      whileHover={
        hover
          ? {
              y: -2,
            }
          : undefined
      }
      onClick={onClick}
      className={`
        bg-[#161616]
        border
        border-[#2A2A2A]
        rounded-3xl
        shadow-lg
        ${hover ? 'cursor-pointer hover:bg-[#1E1E1E]' : ''}
        ${className}
      `}
    >
      {children}
    </Comp>
  )
}

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
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay,
        duration: .35,
      }}
      className="
      bg-[#161616]
      border
      border-[#2A2A2A]
      rounded-3xl
      p-5
      flex
      flex-col
      gap-3
      "
    >

      <div className="flex items-center justify-between">

        <span className="text-xs uppercase tracking-widest text-gray-500">
          {label}
        </span>

        {icon && (
          <div
            className={`
            w-8
            h-8
            rounded-xl
            flex
            items-center
            justify-center
            ${
              accent
                ? 'bg-green-500/20 text-green-400'
                : 'bg-[#1E1E1E] text-gray-400'
            }
            `}
          >
            {icon}
          </div>
        )}

      </div>

      <div>

        <div
          className={`
          text-3xl
          font-bold
          ${
            accent
              ? 'text-green-400'
              : 'text-white'
          }
          `}
        >
          {value}
        </div>

        {sub && (
          <div className="text-xs text-gray-500 mt-1">
            {sub}
          </div>
        )}

      </div>

    </motion.div>
  )
}