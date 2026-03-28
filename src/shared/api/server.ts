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

// Cookie utilities re-exported for backward compatibility
export { getCookieHeader, parseCookieHeader } from '@/shared/lib/cookies'
