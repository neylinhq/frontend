import { redirect } from 'react-router'
import { destroySession, getSession } from '@/entities/session/session.server'
import { ApiError, api } from './api-client'

/**
 * Wraps an async function and redirects to sign-in on 401 errors.
 * Used in loaders to handle expired/invalid tokens.
 */
export const withAuthRedirect = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      // Token is invalid/expired - clear session and redirect
      throw redirect('/auth/sign-in', {
        headers: {
          'Set-Cookie': await destroySession()
        }
      })
    }
    throw error
  }
}

/**
 * Creates an authenticated API client for server-side requests.
 * Automatically extracts token from session cookie.
 *
 * Usage in loaders:
 * ```ts
 * export const loader = async ({ request }: LoaderFunctionArgs) => {
 *   const serverApi = await createServerApi(request)
 *   const data = await serverApi.get('/endpoint')
 *   return { data }
 * }
 * ```
 */
export const createServerApi = async (
  request: Request,
  options?: { redirectOnUnauth?: boolean }
) => {
  const session = await getSession(request)
  const { redirectOnUnauth = true } = options ?? {}

  if (!session && redirectOnUnauth) {
    throw redirect('/sign-in')
  }

  const token = session?.token

  return {
    get: <T>(endpoint: string) => api.get<T>(endpoint, { token }),
    post: <T>(endpoint: string, json: unknown) => api.post<T>(endpoint, json, { token }),
    put: <T>(endpoint: string, json: unknown) => api.put<T>(endpoint, json, { token }),
    patch: <T>(endpoint: string, json: unknown) => api.patch<T>(endpoint, json, { token }),
    delete: <T>(endpoint: string) => api.delete<T>(endpoint, { token }),
    token,
    session
  }
}

/**
 * Helper to require authentication in a loader.
 * Returns session or throws redirect.
 */
export const requireAuth = async (request: Request) => {
  const session = await getSession(request)

  if (!session) {
    throw redirect('/auth/sign-in')
  }

  return session
}
