import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

export function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div
      className="
        flex
        flex-col
        gap-5
        md:flex-row
        md:items-start
        md:justify-between
        mb-8
      "
    >
      <div className="min-w-0">
        <h1
          className="
            text-3xl
            font-bold
            tracking-tight
            text-white
          "
        >
          {title}
        </h1>

        {subtitle && (
          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-relaxed
              text-white/50
            "
          >
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}