import { useEffect } from 'react'

interface UseChatKeyboardShortcutsParams {
  isOpen?: boolean
  canCloseCurrent: boolean
  onCreateSession: () => void
  onCloseSession: () => void
  onCloseAll?: () => void
  onNextTab: () => void
  onPrevTab: () => void
  onOpenSelector?: () => void
}

export const useChatKeyboardShortcuts = ({
  isOpen = true,
  canCloseCurrent,
  onCreateSession,
  onCloseSession,
  onCloseAll,
  onNextTab,
  onPrevTab,
  onOpenSelector
}: UseChatKeyboardShortcutsParams) => {
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      if (isMod && e.key === 't') {
        e.preventDefault()
        onCreateSession()
        return
      }

      if (onOpenSelector && isMod && e.key === 'k') {
        e.preventDefault()
        onOpenSelector()
        return
      }

      if (isMod && e.key === 'w' && !e.shiftKey && canCloseCurrent) {
        e.preventDefault()
        onCloseSession()
        return
      }

      if (onCloseAll && isMod && e.shiftKey && e.key === 'W') {
        e.preventDefault()
        onCloseAll()
        return
      }

      if (isMod && (e.key === '[' || e.key === ']')) {
        e.preventDefault()
        if (e.key === '[') {
          onPrevTab()
        } else {
          onNextTab()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, canCloseCurrent, onCreateSession, onCloseSession, onCloseAll, onNextTab, onPrevTab, onOpenSelector])
}
