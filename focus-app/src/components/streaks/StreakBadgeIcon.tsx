import {
  useId,
  type ReactNode,
} from 'react'

import { cn } from '@/utils'

interface StreakBadgeIconProps {
  minimumDays: number
  size?: number
  className?: string
}

const BADGE_COLORS: Record<
  number,
  {
    primary: string
    secondary: string
  }
> = {
  0: {
    primary: '#67e8f9',
    secondary: '#0e7490',
  },
  3: {
    primary: '#6ee7b7',
    secondary: '#047857',
  },
  7: {
    primary: '#fb923c',
    secondary: '#dc2626',
  },
  14: {
    primary: '#fb7185',
    secondary: '#be123c',
  },
  30: {
    primary: '#fde047',
    secondary: '#d97706',
  },
  50: {
    primary: '#5eead4',
    secondary: '#0284c7',
  },
  75: {
    primary: '#a5b4fc',
    secondary: '#6366f1',
  },
  100: {
    primary: '#fef08a',
    secondary: '#eab308',
  },
  150: {
    primary: '#fcd34d',
    secondary: '#f97316',
  },
  200: {
    primary: '#86efac',
    secondary: '#059669',
  },
  300: {
    primary: '#fdba74',
    secondary: '#9a3412',
  },
  365: {
    primary: '#e2e8f0',
    secondary: '#64748b',
  },
  500: {
    primary: '#fde68a',
    secondary: '#ca8a04',
  },
  600: {
    primary: '#a5f3fc',
    secondary: '#0891b2',
  },
  750: {
    primary: '#d8b4fe',
    secondary: '#7c3aed',
  },
  1000: {
    primary: '#fef3c7',
    secondary: '#d97706',
  },
  1500: {
    primary: '#6ee7b7',
    secondary: '#0f766e',
  },
  2000: {
    primary: '#d1fae5',
    secondary: '#10b981',
  },
}

function BadgeGlyph({
  minimumDays,
  stroke,
}: {
  minimumDays: number
  stroke: string
}): ReactNode {
  const common = {
    fill: 'none',
    stroke,
    strokeWidth: 4,
    strokeLinecap:
      'round' as const,
    strokeLinejoin:
      'round' as const,
  }

  switch (minimumDays) {
    case 0:
      return (
        <path
          {...common}
          d="M48 25C41 35 35 42 35 51a13 13 0 0 0 26 0c0-9-6-16-13-26Z"
        />
      )

    case 3:
      return (
        <g {...common}>
          <path d="M48 69V45" />
          <path d="M48 49c-12 0-18-7-18-17 11 0 18 5 18 17Z" />
          <path d="M48 57c12 0 18-7 18-17-11 0-18 5-18 17Z" />
        </g>
      )

    case 7:
      return (
        <path
          {...common}
          d="M51 22c3 13-8 16-3 28 3-7 9-9 11-17 8 9 12 19 8 29a20 20 0 0 1-38-4c-2-12 6-23 16-31-1 9 2 13 6 16 2-7 2-14 0-21Z"
        />
      )

    case 14:
      return (
        <g {...common}>
          <path d="M48 68S27 57 27 41c0-8 10-13 17-5l4 5 4-5c7-8 17-3 17 5 0 16-21 27-21 27Z" />
          <path d="M49 32c5-6 2-11 0-15 8 4 13 12 9 20" />
        </g>
      )

    case 30:
      return (
        <path
          {...common}
          d="m54 20-22 31h14l-4 25 22-34H50l4-22Z"
        />
      )

    case 50:
      return (
        <g {...common}>
          <path d="M48 22c13 8 20 20 18 34L53 69 39 57c-2-14 1-26 9-35Z" />
          <path d="M40 55 29 61l7-13" />
          <path d="m55 64 1 11 8-10" />
          <circle
            cx="51"
            cy="41"
            r="5"
          />
        </g>
      )

    case 75:
      return (
        <g {...common}>
          <circle
            cx="48"
            cy="48"
            r="8"
          />
          <ellipse
            cx="48"
            cy="48"
            rx="27"
            ry="12"
            transform="rotate(-22 48 48)"
          />
          <circle
            cx="72"
            cy="38"
            r="3"
            fill={stroke}
            stroke="none"
          />
        </g>
      )

    case 100:
      return (
        <path
          {...common}
          d="m48 20 8 18 20 2-15 13 5 20-18-11-18 11 5-20-15-13 20-2 8-18Z"
        />
      )

    case 150:
      return (
        <g {...common}>
          <path d="m48 23 6 14 15-5-5 15 13 8-16 4 1 16-14-9-14 9 1-16-16-4 13-8-5-15 15 5 6-14Z" />
          <circle
            cx="48"
            cy="51"
            r="7"
          />
        </g>
      )

    case 200:
      return (
        <g {...common}>
          <circle
            cx="48"
            cy="45"
            r="18"
          />
          <path d="m36 62-3 14 15-7 15 7-3-14" />
          <path d="m48 32 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z" />
        </g>
      )

    case 300:
      return (
        <g {...common}>
          <circle
            cx="48"
            cy="46"
            r="22"
          />
          <circle
            cx="48"
            cy="46"
            r="13"
          />
          <path d="M42 41c2-5 12-5 12 1 0 3-3 5-6 5 4 0 8 2 8 6 0 7-12 8-15 2" />
        </g>
      )

    case 365:
      return (
        <g {...common}>
          <circle
            cx="48"
            cy="48"
            r="25"
          />
          <path d="M48 27v8M48 61v8M27 48h8M61 48h8" />
          <path d="M48 39v11l8 5" />
        </g>
      )

    case 500:
      return (
        <g {...common}>
          <circle
            cx="48"
            cy="48"
            r="14"
          />
          <path d="M48 19v9M48 68v9M19 48h9M68 48h9M27 27l7 7M62 62l7 7M69 27l-7 7M34 62l-7 7" />
        </g>
      )

    case 600:
      return (
        <path
          {...common}
          d="m48 20 20 18-20 38-20-38 20-18Zm-20 18h40M39 38l9 38 9-38M36 27l12 11 12-11"
        />
      )

    case 750:
      return (
        <g {...common}>
          <path d="M48 20 66 31v22c0 12-8 19-18 24-10-5-18-12-18-24V31l18-11Z" />
          <path d="M38 51c6-10 14-10 20 0-6 10-14 10-20 0Z" />
          <circle
            cx="48"
            cy="51"
            r="3"
            fill={stroke}
            stroke="none"
          />
        </g>
      )

    case 1000:
      return (
        <g {...common}>
          <path d="m24 35 13 10 11-21 11 21 13-10-5 31H29l-5-31Z" />
          <path d="M31 58h34" />
          <circle
            cx="48"
            cy="46"
            r="3"
            fill={stroke}
            stroke="none"
          />
        </g>
      )

    case 1500:
      return (
        <g {...common}>
          <path d="M32 27h32v12c0 12-6 21-16 25-10-4-16-13-16-25V27Z" />
          <path d="M32 34H22v7c0 9 6 14 15 14M64 34h10v7c0 9-6 14-15 14M48 64v9M37 75h22" />
          <path d="m48 35 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1 3-7Z" />
        </g>
      )

    default:
      return (
        <g {...common}>
          <path d="M48 48c-7-12-13-18-21-18-9 0-14 8-10 17 5 11 17 11 31 1Z" />
          <path d="M48 48c7-12 13-18 21-18 9 0 14 8 10 17-5 11-17 11-31 1Z" />
          <path d="M48 48c-7 12-13 18-21 18-9 0-14-8-10-17 5-11 17-11 31-1Z" />
          <path d="M48 48c7 12 13 18 21 18 9 0 14-8 10-17-5-11-17-11-31 1Z" />
        </g>
      )
  }
}

export function StreakBadgeIcon({
  minimumDays,
  size = 64,
  className,
}: StreakBadgeIconProps) {
  const rawId = useId()
  const id = rawId.replace(
    /:/g,
    '',
  )
  const colors =
    BADGE_COLORS[minimumDays] ??
    BADGE_COLORS[2000]

  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      className={cn(
        'shrink-0',
        className,
      )}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient
          id={`badge-surface-${id}`}
          cx="35%"
          cy="25%"
          r="80%"
        >
          <stop
            offset="0%"
            stopColor="#ffffff"
            stopOpacity="0.17"
          />
          <stop
            offset="42%"
            stopColor={colors.primary}
            stopOpacity="0.11"
          />
          <stop
            offset="100%"
            stopColor="#020706"
            stopOpacity="0.58"
          />
        </radialGradient>

        <linearGradient
          id={`badge-edge-${id}`}
          x1="18"
          y1="15"
          x2="78"
          y2="82"
        >
          <stop
            stopColor="#ffffff"
            stopOpacity="0.5"
          />
          <stop
            offset="45%"
            stopColor={colors.primary}
            stopOpacity="0.52"
          />
          <stop
            offset="100%"
            stopColor={colors.secondary}
            stopOpacity="0.8"
          />
        </linearGradient>

        <linearGradient
          id={`badge-glyph-${id}`}
          x1="28"
          y1="20"
          x2="68"
          y2="77"
        >
          <stop
            stopColor="#ffffff"
            stopOpacity="0.95"
          />
          <stop
            offset="38%"
            stopColor={colors.primary}
          />
          <stop
            offset="100%"
            stopColor={colors.secondary}
          />
        </linearGradient>
      </defs>

      <circle
        cx="48"
        cy="50"
        r="39"
        fill="#000000"
        opacity="0.3"
      />

      <circle
        cx="48"
        cy="47"
        r="39"
        fill={`url(#badge-surface-${id})`}
        stroke={`url(#badge-edge-${id})`}
        strokeWidth="2"
      />

      <circle
        cx="48"
        cy="47"
        r="32"
        fill="none"
        stroke={colors.primary}
        strokeOpacity="0.16"
      />

      <path
        d="M25 31c11-14 31-20 48-8"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.24"
      />

      <g transform="translate(0 -1)">
        <BadgeGlyph
          minimumDays={
            minimumDays
          }
          stroke={`url(#badge-glyph-${id})`}
        />
      </g>

      <circle
        cx="34"
        cy="28"
        r="2"
        fill="#ffffff"
        opacity="0.45"
      />
    </svg>
  )
}
