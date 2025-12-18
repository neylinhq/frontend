import { useState, useEffect, useCallback } from 'react'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

const setCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined
  return document.cookie
    .split(';')
    .find(c => c.trim().startsWith(`${name}=`))
    ?.split('=')[1]
    ?.trim()
}

/**
 * Hook for persisting state in localStorage + cookie with SSR support
 * Cookie is read on first render to avoid hydration mismatch flash
 *
 * @param key - storage key (used for both localStorage and cookie)
 * @param initialValue - default value if key doesn't exist
 * @returns [value, setValue] tuple like useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Read from cookie on first render (available before hydration)
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof document === 'undefined') return initialValue

    // Try cookie first (synced with SSR)
    const cookieValue = getCookie(key)
    if (cookieValue) {
      try {
        return JSON.parse(cookieValue) as T
      } catch {
        // Invalid JSON in cookie
      }
    }

    // Fall back to localStorage
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  // Persist to localStorage + cookie
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value
        const serialized = JSON.stringify(valueToStore)

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, serialized)
            setCookie(key, serialized)
          } catch {
            // Ignore storage errors (quota exceeded, etc.)
          }
        }

        return valueToStore
      })
    },
    [key]
  )

  // Sync with other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue) as T)
        } catch {
          // Ignore parse errors
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
