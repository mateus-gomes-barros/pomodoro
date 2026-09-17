import type { ReactNode } from 'react'

export function CircularProgress({
  progress,
  size = 260,
  strokeWidth = 5,
  color = '#34d399',
  bgColor = 'rgba(255,255,255,0.075)',
  children,
}: {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  bgColor?: string
  children?: ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - progress * circumference

  return (
    <div className="focus-circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="focus-progress-svg">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth}/>
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
          style={{ transition: 'stroke-dashoffset 1s linear' }}
        />
      </svg>
      <div className="focus-progress-content">{children}</div>
    </div>
  )
}
