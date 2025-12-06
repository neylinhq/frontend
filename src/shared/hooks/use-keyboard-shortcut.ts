import { useEffect } from 'react'

export interface KeyboardShortcutOptions {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  enabled?: boolean
}

/**
 * Hook for handling keyboard shortcuts
 *
 * @example
 * useKeyboardShortcut({ key: 'n', meta: true }, () => {
 *   console.log('Cmd+N pressed')
 * })
 */
export const useKeyboardShortcut = (
  options: KeyboardShortcutOptions,
  callback: (event: KeyboardEvent) => void
) => {
  const { key, ctrl = false, shift = false, alt = false, meta = false, enabled = true } = options

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const matchesKey = event.key.toLowerCase() === key.toLowerCase()
      const matchesCtrl = ctrl === event.ctrlKey
      const matchesShift = shift === event.shiftKey
      const matchesAlt = alt === event.altKey
      const matchesMeta = meta === event.metaKey

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
        event.preventDefault()
        callback(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [key, ctrl, shift, alt, meta, enabled, callback])
}
