import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SessionData } from '../session.types'

let refreshSession: typeof import('../server/session.refresh.server').refreshSession
let getSession: ReturnType<typeof vi.fn>
let commitSession: ReturnType<typeof vi.fn>
let logger: { error: ReturnType<typeof vi.fn> }
let redirect: ReturnType<typeof vi.fn>

const makeSession = (overrides: Partial<SessionData> = {}): SessionData => ({
  token: 'access-token',
  refreshToken: 'refresh-token',
  user: { id: 'user-1' } as SessionData['user'],
  ...overrides
})

beforeEach(async () => {
  vi.resetModules()
  vi.doMock('../server/session.server', () => ({
    getSession: vi.fn(),
    commitSession: vi.fn()
  }))
  vi.doMock('@/shared/lib/logger', () => ({
    logger: { error: vi.fn() }
  }))
  vi.doMock('react-router', () => ({
    redirect: vi.fn((path: string) => new Response(null, { status: 302, headers: { Location: path } }))
  }))

  ;({ refreshSession } = await import('../server/session.refresh.server'))
  ;({ getSession, commitSession } = await import('../server/session.server'))
  ;({ logger } = await import('@/shared/lib/logger'))
  ;({ redirect } = await import('react-router'))
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('refreshSession', () => {
  it('redirects when refresh token is missing', async () => {
    vi.mocked(getSession).mockResolvedValue(makeSession({ refreshToken: undefined }))

    await expect(refreshSession(new Request('http://localhost'))).rejects.toBeInstanceOf(Response)
    expect(redirect).toHaveBeenCalledWith('/auth/sign-in')
  })

  it('redirects when backend refresh fails', async () => {
    vi.mocked(getSession).mockResolvedValue(makeSession())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401
      })
    )

    await expect(refreshSession(new Request('http://localhost'))).rejects.toBeInstanceOf(Response)
    expect(logger.error).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/auth/sign-in')
  })

  it('redirects when response lacks access token', async () => {
    vi.mocked(getSession).mockResolvedValue(makeSession())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { refreshToken: 'new-refresh' } })
      })
    )

    await expect(refreshSession(new Request('http://localhost'))).rejects.toBeInstanceOf(Response)
    expect(logger.error).toHaveBeenCalled()
  })

  it('returns updated session and cookie', async () => {
    vi.mocked(getSession).mockResolvedValue(makeSession())
    vi.mocked(commitSession).mockResolvedValue('cookie=1')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { accessToken: 'new-access' } })
      })
    )

    const result = await refreshSession(new Request('http://localhost'))
    expect(result.cookie).toBe('cookie=1')
    expect(result.session.token).toBe('new-access')
    expect(result.session.refreshToken).toBe('refresh-token')
  })

  it('uses refreshed token from backend when provided', async () => {
    vi.mocked(getSession).mockResolvedValue(makeSession({ refreshToken: 'old-refresh' }))
    vi.mocked(commitSession).mockResolvedValue('cookie=2')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { accessToken: 'access-2', refreshToken: 'new-refresh' } })
      })
    )

    const result = await refreshSession(new Request('http://localhost'))
    expect(result.session.refreshToken).toBe('new-refresh')
  })

  it('redirects on unexpected errors', async () => {
    vi.mocked(getSession).mockResolvedValue(makeSession())
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(Object.assign(new Error('boom'), { name: 'NetworkError' }))
    )

    await expect(refreshSession(new Request('http://localhost'))).rejects.toBeInstanceOf(Response)
    expect(logger.error).toHaveBeenCalled()
    expect(redirect).toHaveBeenCalledWith('/auth/sign-in')
  })
})
