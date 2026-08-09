import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount((value) => value + 1)}>{count}</button>
}

describe('test tooling smoke test', () => {
  it('renders in jsdom and asserts with jest-dom matchers', () => {
    render(<Counter />)
    expect(screen.getByRole('button', { name: '0' })).toBeInTheDocument()
  })

  it('drives interaction with user-event', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    await user.click(screen.getByRole('button', { name: '0' }))
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
  })
})
