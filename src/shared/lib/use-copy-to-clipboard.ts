import { useCallback, useState } from 'react'

interface UseCopyToClipboardOptions {
  /** Duration to show "copied" state in ms (default: 2000) */
  timeout?: number
}

interface UseCopyToClipboardReturn {
  /** Whether the text was recently copied */
  copied: boolean
  /** Copy text to clipboard. Returns true on success. */
  copy: (text: string) => Promise<boolean>
}

/**
 * Hook for copying text to clipboard with feedback state
 *
 * @example
 * const { copied, copy } = useCopyToClipboard()
 *
 * <Button onClick={() => copy(text)}>
 *   {copied ? <Check /> : <Copy />}
 *   {copied ? 'Copied!' : 'Copy'}
 * </Button>
 */
export const useCopyToClipboard = (
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardReturn => {
  const { timeout = 2000 } = options
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        // Try modern clipboard API first
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), timeout)
          return true
        }

        // Fallback for older browsers or non-HTTPS contexts
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        textarea.style.pointerEvents = 'none'
        document.body.appendChild(textarea)
        textarea.select()
        const success = document.execCommand('copy')
        document.body.removeChild(textarea)

        if (success) {
          setCopied(true)
          setTimeout(() => setCopied(false), timeout)
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [timeout]
  )

  return { copied, copy }
}
