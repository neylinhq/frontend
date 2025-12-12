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
      // Log actual backend error for debugging
      let errorData: unknown
      try {
        errorData = await response.json()
      } catch {
        errorData = await response.text()
      }
      console.error('[api.refresh] Backend error:', response.status, errorData)
      return Response.json({ success: false, error: 'Refresh failed' }, { status: 401 })
    }

    // Forward ALL Set-Cookie headers from Go backend
    // headers.get('Set-Cookie') only returns the first header!
    // We need getSetCookie() to get all cookies (access + refresh)
    const setCookieHeaders = response.headers.getSetCookie()

    const headers = new Headers()
    for (const cookie of setCookieHeaders) {
      headers.append('Set-Cookie', cookie)
    }
    headers.set('Content-Type', 'application/json')

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('[api.refresh] Error:', error)
    return Response.json({ success: false, error: 'Refresh failed' }, { status: 500 })
  }
}
