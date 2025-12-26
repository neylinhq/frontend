import { API_URL } from '@/shared/config/env'

interface ServerFetchOptions extends RequestInit {
  cookies?: string | null
}

class ServerFetchError extends Error {
  constructor(
    public status: number,
    public response: Response
  ) {
    super(`API Error: ${status}`)
  }
}

/**
 * Server-side fetch helper that forwards cookies to Go API
 * Use in React Router loaders/actions
 */
export const serverFetch = async <T>(
  endpoint: string,
  request: Request,
  options: ServerFetchOptions = {}
): Promise<T> => {
  const cookies = request.headers.get('Cookie')

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookies && { Cookie: cookies }),
      ...options.headers
    }
  })

  if (!response.ok) {
    throw new ServerFetchError(response.status, response)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

/**
 * Get cookies from request for passing to API calls
 */
export const getCookies = (request: Request): string | undefined => {
  return request.headers.get('Cookie') || undefined
}

/**
 * Get a specific cookie value from cookie header string
 * Works both server-side (from request.headers) and client-side (from document.cookie)
 */
export const getCookie = (cookieHeader: string, name: string): string | undefined =>
  cookieHeader
    .split(';')
    .find(c => c.trim().startsWith(`${name}=`))
    ?.split('=')[1]
    ?.trim()
