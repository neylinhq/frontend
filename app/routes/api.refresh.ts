import type { ActionFunctionArgs } from 'react-router'
import { API_URL } from '@/shared/config/env'

/**
 * Resource route for refreshing auth tokens.
 * Go backend handles cookie refresh - we just proxy the request.
 */
export const action = async ({ request }: ActionFunctionArgs) => {
  const cookieHeader = request.headers.get('Cookie')

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader })
      }
    })

    if (!response.ok) {
      return Response.json({ success: false, error: 'Refresh failed' }, { status: 401 })
    }

    // Forward Set-Cookie headers from Go backend
    const setCookieHeader = response.headers.get('Set-Cookie')

    return Response.json(
      { success: true },
      {
        headers: setCookieHeader ? { 'Set-Cookie': setCookieHeader } : {}
      }
    )
  } catch (error) {
    console.error('[api.refresh] Error:', error)
    return Response.json({ success: false, error: 'Refresh failed' }, { status: 500 })
  }
}
