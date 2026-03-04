import { describe, expect, it } from 'vitest'

import { commitSession, destroySession, getSession, sessionCookie } from '../server/session.server'
import type { SessionData } from '../session.types'

const createRequest = (cookie?: string) =>
  new Request('http://localhost', {
    headers: cookie ? { Cookie: cookie } : undefined
  })

describe('session.server', () => {
  it('returns null when cookie is missing', async () => {
    const session = await getSession(createRequest())
    expect(session).toBeNull()
  })

  it('returns null for invalid session data', async () => {
    const cookie = await sessionCookie.serialize({ foo: 'bar' } as unknown as SessionData)
    const session = await getSession(createRequest(cookie))
    expect(session).toBeNull()
  })

  it('parses session cookie and supports commit/destroy', async () => {
    const session = {
      token: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'user-1' }
    } as SessionData

    const cookie = await commitSession(session)
    const parsed = await getSession(createRequest(cookie))

    expect(parsed).toMatchObject({ token: 'access-token', refreshToken: 'refresh-token' })
    expect(cookie).toContain('neylin-session=')

    const destroyed = await destroySession()
    expect(destroyed).toContain('Max-Age=0')
  })
})
