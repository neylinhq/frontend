const DEFAULT_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

// ── Client-side ──────────────────────────────────────────────

/**
 * Read a cookie value by name from `document.cookie`.
 * Returns `undefined` if the cookie does not exist or we are on the server.
 */
export const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined
  return document.cookie
    .split(';')
    .find(c => c.trim().startsWith(`${name}=`))
    ?.split('=')[1]
    ?.trim()
}

/**
 * Write a cookie via `document.cookie`.
 */
export const setCookie = (
  name: string,
  value: string,
  opts?: { maxAge?: number; path?: string }
): void => {
  const maxAge = opts?.maxAge ?? DEFAULT_MAX_AGE
  const path = opts?.path ?? '/'
  document.cookie = `${name}=${value}; path=${path}; max-age=${maxAge}; SameSite=Lax`
}

// ── Server-side ──────────────────────────────────────────────

/**
 * Parse a specific cookie from a raw `Cookie` header string.
 */
export const parseCookieHeader = (header: string, name: string): string | undefined =>
  header
    .split(';')
    .find(c => c.trim().startsWith(`${name}=`))
    ?.split('=')[1]
    ?.trim()

/**
 * Extract the `Cookie` header value from a `Request` object.
 * Returns an empty string when the header is absent.
 */
export const getCookieHeader = (request: Request): string =>
  request.headers.get('Cookie') ?? ''
