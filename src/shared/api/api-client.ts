import { API_URL, IS_BROWSER } from '@/shared/config/env'

type RequestOptions = RequestInit & {
  json?: unknown
  skipAuth?: boolean
  token?: string // For server-side requests
}

// Token storage key
const TOKEN_KEY = 'auth_token'

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

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data: unknown
  ) {
    super(`API Error: ${status} ${statusText}`)
  }
}

const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { json, headers, skipAuth, token: serverToken, ...customOptions } = options

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
