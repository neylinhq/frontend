import { API_URL, IS_BROWSER } from '@/shared/config/env'

type RequestOptions = RequestInit & {
  json?: unknown
  skipAuth?: boolean
  token?: string // For server-side requests
  _isRetry?: boolean // Internal flag to prevent infinite retry loops
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown
  ) {
    super(`API Error: ${status} ${statusText}`)
  }
}

// Refresh token via server action (updates httpOnly cookie)
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

const refreshTokens = async (): Promise<boolean> => {
  try {
    // Call our resource route which updates the httpOnly cookie
    const response = await fetch('/api/refresh', {
      method: 'POST',
      credentials: 'include'
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    return data.success === true
  } catch {
    return false
  }
}

const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { json, headers, skipAuth, token: serverToken, _isRetry, ...customOptions } = options

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers
  }

  // Server-side: use provided token
  // Client-side: rely on httpOnly cookies (credentials: 'include')
  if (!skipAuth && serverToken) {
    ;(requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${serverToken}`
  }

  const config: RequestInit = {
    headers: requestHeaders,
    credentials: 'include', // Always include cookies
    ...customOptions
  }

  if (json) {
    config.body = JSON.stringify(json)
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)

  // Handle 401 - try to refresh token (only on client, only once)
  if (response.status === 401 && IS_BROWSER && !skipAuth && !_isRetry) {
    // Ensure only one refresh request at a time
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshTokens().finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
    }

    const refreshed = await refreshPromise
    if (refreshed) {
      // Retry the original request with new cookie
      return request<T>(endpoint, { ...options, _isRetry: true })
    }
  }

  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = null
    }
    throw new ApiError(response.status, response.statusText, errorData)
  }

  if (response.status === 204) {
    return null as T
  }

  return response.json()
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, json: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', json }),

  put: <T>(endpoint: string, json: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', json }),

  patch: <T>(endpoint: string, json: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', json }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' })
}
