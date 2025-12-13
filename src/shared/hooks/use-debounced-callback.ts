import { useCallback, useEffect, useRef } from 'react'

/**
 * Returns a debounced version of the callback.
 * Useful for auto-save, slider changes, search inputs, etc.
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds (default: 300ms)
 */
export const useDebouncedCallback = <T>(callback: (value: T) => void, delay = 300) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const callbackRef = useRef(callback)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const debouncedFn = useCallback(
    (value: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(value)
      }, delay)
    },
    [delay]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedFn
}
