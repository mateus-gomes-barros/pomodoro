export function generateId() {
  return crypto.randomUUID()
}

export function formatLocalDate(
  date: Date,
): string {
  const year = date.getFullYear()

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, '0')

  const day = String(
    date.getDate(),
  ).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getTodayString() {
  return formatLocalDate(
    new Date(),
  )
}

export function getLast30Days() {
  const dates: string[] = []

  for (let i = 29; i >= 0; i--) {
    const date = new Date()

    date.setDate(date.getDate() - i)

    dates.push(
      formatLocalDate(date),
    )
  }

  return dates
}

export function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${String(mins).padStart(
    2,
    '0',
  )}:${String(secs).padStart(2, '0')}`
}

export function formatDuration(
  minutes: number,
) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) {
    return `${mins}m`
  }

  if (mins === 0) {
    return `${hours}h`
  }

  return `${hours}h ${mins}m`
}

export function cn(
  ...classes: (
    | string
    | undefined
    | false
  )[]
) {
  return classes.filter(Boolean).join(' ')
}

export const PROJECT_COLORS = [
  '#7EE081',
  '#7EA8E0',
  '#E07E7E',
  '#E0A87E',
  '#B67EE0',
]

export const PROJECT_EMOJIS = [
  '⌨️',
  '📚',
  '🎨',
  '🚀',
  '⚡',
  '🏋️',
  '🛒',
  '📱',
  '🎵',
  '👟',
  '✏️',
  '🧹',
  '🎮',
  '🎧',
]