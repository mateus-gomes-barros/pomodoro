import type { ReactNode } from 'react'

interface CircularProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: ReactNode
}

export function CircularProgress({
  progress,
  size = 240,
  strokeWidth = 6,
  color = '#7EE081',
  bgColor = '#1E1E1E',
  children,
}: CircularProgressProps) {

  const radius = (size - strokeWidth) / 2

  const circumference = 2 * Math.PI * radius

  const offset =
    circumference -
    progress * circumference

  return (
    <div
      className="
      relative
      inline-flex
      items-center
      justify-center
      "
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        className="absolute -rotate-90"
      >

        {/* Background */}

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress */}

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s linear',
          }}
        />

      </svg>

      <div
        className="
        relative
        z-10
        flex
        flex-col
        items-center
        justify-center
        "
      >
        {children}
      </div>

    </div>
  )
}