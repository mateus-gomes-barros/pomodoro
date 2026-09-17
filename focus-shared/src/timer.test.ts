import { describe, expect, it } from 'vitest'

import {
  createTimerDeadline,
  getRemainingSeconds,
} from './timer'

describe('shared timer helpers', () => {
  it('creates a deadline from remaining seconds', () => {
    expect(
      createTimerDeadline(25, 1_000),
    ).toBe(26_000)
  })

  it('rounds partial seconds up while counting down', () => {
    expect(
      getRemainingSeconds(2_501, 1_000),
    ).toBe(2)
  })

  it('never returns a negative remaining value', () => {
    expect(
      getRemainingSeconds(1_000, 2_000),
    ).toBe(0)
  })
})
