import { API_URL, IS_BROWSER } from '@/shared/config/env'

type RequestOptions = RequestInit & {
  json?: unknown
  skipAuth?: boolean
  token?: string // For server-side requests
  _isRetry?: boolean // Internal flag to prevent infinite retry loops
}

// Token storage keys
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'

export const setAuthToken = (token: string | null) => {
  if (!IS_BROWSER) return
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export const getAuthToken = (): string | null => {
  if (!IS_BROWSER) return null
  return localStorage.getItem(TOKEN_KEY)
}

export const setRefreshToken = (token: string | null) => {
  if (!IS_BROWSER) return
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}

export const getRefreshToken = (): string | null => {
  if (!IS_BROWSER) return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
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

// Refresh token and retry request
let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

const refreshTokens = async (): Promise<boolean> => {
  try {
    // Call our resource route which updates the httpOnly cookie
    // and returns new accessToken for localStorage
    const response = await fetch('/api/refresh', {
      method: 'POST',
      credentials: 'include' // Include cookies
    })

    if (!response.ok) {
      // Fallback to direct API call with localStorage refresh token
      return refreshTokensDirectly()
    }

    const data = await response.json()
    if (data.success && data.accessToken) {
      setAuthToken(data.accessToken)
      return true
    }
    return false
  } catch {
    return refreshTokensDirectly()
  }
}

// Fallback: direct refresh using localStorage token (won't update httpOnly cookie)
const refreshTokensDirectly = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) return false

    const data = await response.json()
    if (data.data?.accessToken) {
      setAuthToken(data.data.accessToken)
      if (data.data.refreshToken) {
        setRefreshToken(data.data.refreshToken)
      }
      return true
    }
    return false
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

  // Add Authorization header if token exists and skipAuth is not set
  if (!skipAuth) {
    // Use provided token (server-side) or get from localStorage (client-side)
    const token = serverToken || getAuthToken()
    if (token) {
      ;(requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }

  const config: RequestInit = {
    headers: requestHeaders,
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
      // Retry the original request with new token
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
