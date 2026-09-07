import type {
  SVGProps,
} from 'react'

export const FOCUS_HOME_KEYS = [
  'aster',
  'atlas',
  'forge',
  'pulse',
  'loom',
  'orbit',
  'tide',
  'ember',
  'nova',
  'prism',
  'vanguard',
  'verdant',
] as const

export type FocusHomeKey =
  typeof FOCUS_HOME_KEYS[number]

export const FOCUS_HOME_COLORS: Record<
  FocusHomeKey,
  string
> = {
  aster: '#A78BFA',
  atlas: '#4F8EF7',
  forge: '#F59E0B',
  pulse: '#FB7185',
  loom: '#22D3EE',
  orbit: '#818CF8',
  tide: '#2DD4BF',
  ember: '#F97316',
  nova: '#FBBF24',
  prism: '#E879F9',
  vanguard: '#F43F5E',
  verdant: '#34D399',
}

interface FocusHomeSymbolProps
  extends SVGProps<SVGSVGElement> {
  type: FocusHomeKey
  size?: number
  compact?: boolean
  colored?: boolean
}

function SymbolCore({
  type,
}: {
  type: FocusHomeKey
}) {
  switch (type) {
    case 'aster':
      return (
        <g>
          <circle
            cx="32"
            cy="32"
            r="3.5"
          />
          <path d="M32 28.5C31 22 33 17 38 13" />
          <path d="M28.8 30C23 26 18 26 13 29" />
          <path d="M29.5 35C25 40 24 45 26 51" />
          <path d="M35 34C40 38 45 38 51 35" />
          <path d="M34.5 29C39 25 43 21 44 16" />
        </g>
      )

    case 'atlas':
      return (
        <g>
          <path d="M14 43L24 29L32 39L40 23L51 43" />
          <path d="M18 47H47" />
          <path d="M21 21C28 16 38 16 45 21" />
          <path d="M26 43V38M38 43V35" />
        </g>
      )

    case 'forge':
      return (
        <g>
          <path d="M32 20L42 31L32 43L22 31Z" />
          <path d="M12 20L24 28" />
          <path d="M52 20L40 28" />
          <path d="M12 43L24 35" />
          <path d="M52 43L40 35" />
          <circle
            cx="32"
            cy="31.5"
            r="3"
          />
        </g>
      )

    case 'pulse':
      return (
        <g>
          <path d="M11 34H20L25 23L31 44L37 18L42 34H53" />
          <path d="M15 41C22 48 42 49 49 40" />
        </g>
      )

    case 'loom':
      return (
        <g>
          <path d="M18 16C18 28 46 35 46 48" />
          <path d="M46 16C46 28 18 35 18 48" />
          <path d="M14 24H50" />
          <path d="M14 40H50" />
          <circle
            cx="32"
            cy="32"
            r="3"
          />
        </g>
      )

    case 'orbit':
      return (
        <g>
          <ellipse
            cx="32"
            cy="32"
            rx="20"
            ry="9"
            transform="rotate(-18 32 32)"
          />
          <ellipse
            cx="32"
            cy="32"
            rx="9"
            ry="20"
            transform="rotate(28 32 32)"
          />
          <circle
            cx="32"
            cy="32"
            r="3.5"
          />
          <circle
            cx="48"
            cy="24"
            r="2"
            fill="currentColor"
            stroke="none"
          />
        </g>
      )

    case 'tide':
      return (
        <g>
          <path d="M11 26C18 18 25 18 32 26C39 34 46 34 53 26" />
          <path d="M11 35C18 27 25 27 32 35C39 43 46 43 53 35" />
          <path d="M16 44C22 39 27 39 32 44C37 49 42 49 48 44" />
        </g>
      )

    case 'ember':
      return (
        <g>
          <path d="M32 12C35 22 44 25 43 36C42 46 36 51 32 52C24 50 19 44 20 36C21 28 27 25 27 18C30 20 32 24 32 28C36 25 36 19 32 12Z" />
          <path d="M23 36C27 31 37 31 41 36C37 41 27 41 23 36Z" />
          <circle
            cx="32"
            cy="36"
            r="2.7"
          />
          <circle
            cx="32"
            cy="36"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </g>
      )

    case 'nova':
      return (
        <g>
          <circle
            cx="32"
            cy="32"
            r="7"
          />
          <path d="M32 11V20" />
          <path d="M32 44V53" />
          <path d="M11 32H20" />
          <path d="M44 32H53" />
          <path d="M17 17L23 23" />
          <path d="M41 41L47 47" />
          <path d="M47 17L41 23" />
          <path d="M23 41L17 47" />
        </g>
      )

    case 'prism':
      return (
        <g>
          <path d="M32 12L51 45H13Z" />
          <path d="M32 12L32 45" />
          <path d="M20 33L44 33" />
          <path d="M32 45L43 33L32 24L20 33Z" />
        </g>
      )

    case 'vanguard':
      return (
        <g>
          <path d="M17 14H47V30C47 40 41 48 32 52C23 48 17 40 17 30Z" />
          <path d="M22 34L32 24L42 34" />
          <path d="M32 24V44" />
        </g>
      )

    case 'verdant':
      return (
        <g>
          <path d="M32 51V18" />
          <path d="M32 29C26 23 21 22 16 24C18 30 23 33 32 33" />
          <path d="M32 39C39 32 45 31 50 34C47 41 41 44 32 44" />
          <path d="M32 23C35 18 38 15 43 14C44 20 40 24 32 27" />
          <circle
            cx="32"
            cy="52"
            r="2"
            fill="currentColor"
            stroke="none"
          />
        </g>
      )
  }
}

export function FocusHomeSymbol({
  type,
  size = 88,
  compact = false,
  colored = true,
  className,
  style,
  ...props
}: FocusHomeSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{
        color: colored
          ? FOCUS_HOME_COLORS[type]
          : undefined,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    >
      {!compact && (
        <g>
          <path
            d="M13 10.5C5.5 17.4 2.8 27.8 4.9 38.2C7.5 51.2 18.6 59.2 31.4 60.5C44.9 61.9 56.9 54.1 60.2 41.5C61.1 38.1 61.4 34.8 61 31.6"
            strokeWidth="1.45"
            opacity="0.72"
          />

          <path
            d="M9 35C7.5 22 15 11 26 7C39 3 52 8 58 20C64 32 60 47 50 55"
            strokeWidth="1.15"
            opacity="0.34"
          />
        </g>
      )}

      <g
        strokeWidth={
          compact ? 2.2 : 1.8
        }
      >
        <SymbolCore type={type} />
      </g>
    </svg>
  )
}
