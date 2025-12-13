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
      if (!navigator?.clipboard) {
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), timeout)
        return true
      } catch {
        return false
      }
    },
    [timeout]
  )

  return { copied, copy }
}
