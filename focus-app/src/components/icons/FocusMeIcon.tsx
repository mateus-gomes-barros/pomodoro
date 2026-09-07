import type {
  SVGProps,
} from 'react'

interface FocusMeIconProps
  extends SVGProps<SVGSVGElement> {
  size?: number
}

export function FocusMeIcon({
  size = 20,
  className,
  ...props
}: FocusMeIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M13 10.5C5.5 17.4 2.8 27.8 4.9 38.2C7.5 51.2 18.6 59.2 31.4 60.5C44.9 61.9 56.9 54.1 60.2 41.5C61.1 38.1 61.4 34.8 61 31.6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      <path
        d="M8.5 34.6C7.4 22.4 14.5 11 25.9 7.1C38.6 2.8 52.3 8.4 58.2 20.4C64.1 32.4 60.2 47 49.8 55C39.4 63 24.7 61.5 15.5 53.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.82"
      />

      <path
        d="M9.5 39.2C6.1 27.6 10.8 15 21 8.8C31.4 2.5 45.1 4.7 53.7 13.7C62.5 22.8 63.7 36.8 56.8 47.2C50.1 57.5 37.2 62.2 25.3 58.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.58"
      />
    </svg>
  )
}
