import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App'

describe('Focus Horizon popup', () => {
  it('renders the default focus timer', () => {
    render(<App />)

    expect(
      screen.getByText('25:00'),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: /start focus/i,
      }),
    ).toBeInTheDocument()
  })
})
