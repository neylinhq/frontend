const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
// Мы можем переиспользовать VITE_API_URL из shared/config, но пока что здесь старый код.
// Рефакторинг api-client лучше делать отдельным шагом, чтобы не сломать типизацию ApiError.
// Оставлю пока как есть, чтобы не трогать лишнего, но в будущем надо заменить на импорт из config.

type RequestOptions = RequestInit & {
  json?: unknown
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

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { json, headers, ...customOptions } = options

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    ...customOptions
  }

  if (json) {
    config.body = JSON.stringify(json)
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)

  if (!response.ok) {
    let errorData
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
