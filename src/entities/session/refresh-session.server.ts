import { redirect } from 'react-router'
import { API_URL } from '@/shared/config/env'
import { commitSession, getSession } from './session.server'
import type { SessionData } from './session.types'

interface RefreshResult {
  session: SessionData
  cookie: string
}

/**
 * Try to refresh the session token on the server.
 * Returns new session and Set-Cookie header if successful.
 * Throws redirect to sign-in if refresh fails.
 */
export async function refreshSession(request: Request): Promise<RefreshResult> {
  const session = await getSession(request)

  if (!session?.refreshToken) {
    throw redirect('/auth/sign-in')
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken })
    })

    if (!response.ok) {
      console.error('[refreshSession] Backend refresh failed:', response.status)
      throw redirect('/auth/sign-in')
    }

    const data = await response.json()
    const { accessToken, refreshToken } = data.data

    if (!accessToken) {
      console.error('[refreshSession] No access token in response')
      throw redirect('/auth/sign-in')
    }

    const newSession: SessionData = {
      ...session,
      token: accessToken,
      refreshToken: refreshToken || session.refreshToken
    }

    const cookie = await commitSession(newSession)

    return { session: newSession, cookie }
  } catch (error) {
    if (error instanceof Response) {
      throw error // Re-throw redirects
    }
    console.error('[refreshSession] Error:', error)
    throw redirect('/auth/sign-in')
  }
}
