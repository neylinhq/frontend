import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('react-router', () => ({
  useMatches: vi.fn()
}))

import { useMatches } from 'react-router'
import { useLoaderUser } from '../user.hooks'

describe('useLoaderUser', () => {
  it('returns user from matches', () => {
    vi.mocked(useMatches).mockReturnValue([
      { data: { user: { id: '1', email: 'test@example.com', role: 'user', createdAt: 'now' } } }
    ])

    const { result } = renderHook(() => useLoaderUser())
    expect(result.current?.id).toBe('1')
  })

  it('returns null when no user is present', () => {
    vi.mocked(useMatches).mockReturnValue([{ data: {} }])

    const { result } = renderHook(() => useLoaderUser())
    expect(result.current).toBeNull()
  })
})