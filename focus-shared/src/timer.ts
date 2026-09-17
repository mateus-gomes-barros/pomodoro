export function createTimerDeadline(
  secondsLeft: number,
  now = Date.now(),
): number {
  return now + Math.max(0, secondsLeft) * 1000
}

export function getRemainingSeconds(
  endsAt: number,
  now = Date.now(),
): number {
  return Math.max(
    0,
    Math.ceil((endsAt - now) / 1000),
  )
}
