import type { ActionFunctionArgs } from 'react-router'
import { getSession, commitSession } from '@/entities/session/session.server'
import { API_URL } from '@/shared/config/env'

/**
 * Resource route for refreshing auth tokens.
 * Updates the httpOnly session cookie with new tokens.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const session = await getSession(request)

  if (!session?.refreshToken) {
    return Response.json({ success: false, error: 'No refresh token' }, { status: 401 })
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken })
    })

    if (!response.ok) {
      return Response.json({ success: false, error: 'Refresh failed' }, { status: 401 })
    }

    const data = await response.json()
    const { accessToken, refreshToken } = data.data

    if (!accessToken) {
      return Response.json({ success: false, error: 'No access token in response' }, { status: 401 })
    }

    // Update session with new tokens
    const newSession = {
      ...session,
      token: accessToken,
      refreshToken: refreshToken || session.refreshToken
    }

    const cookie = await commitSession(newSession)

    return Response.json(
      { success: true },
      {
        headers: {
          'Set-Cookie': cookie
        }
      }
    )
  } catch (error) {
    console.error('[api.refresh] Error:', error)
    return Response.json({ success: false, error: 'Refresh failed' }, { status: 500 })
  }
}
