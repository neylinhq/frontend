import { createContext, type ReactNode, useCallback, useContext, useEffect } from 'react'

import { useLocalStorage } from '@/shared/hooks/use-local-storage'

const SIDEBAR_STORAGE_KEY = 'neylin-sidebar-expanded'

interface SidebarContextValue {
  isExpanded: boolean
  toggle: () => void
  setExpanded: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

interface SidebarProviderProps {
  children: ReactNode
  defaultExpanded?: boolean
}

export const SidebarProvider = ({ children, defaultExpanded = true }: SidebarProviderProps) => {
  const [isExpanded, setIsExpanded] = useLocalStorage<boolean>(SIDEBAR_STORAGE_KEY, defaultExpanded)

  const toggle = useCallback(() => {
    setIsExpanded(prev => !prev)
  }, [setIsExpanded])

  const setExpanded = useCallback(
    (value: boolean) => {
      setIsExpanded(value)
    },
    [setIsExpanded]
  )

  // Keyboard shortcut: Cmd+B (Mac) / Ctrl+B (Win)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if typing in input/textarea
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const modifier = isMac ? event.metaKey : event.ctrlKey

      if (modifier && event.key.toLowerCase() === 'b') {
        event.preventDefault()
        toggle()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle])

  return (
    <SidebarContext.Provider value={{ isExpanded, toggle, setExpanded }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = (): SidebarContextValue => {
  const context = useContext(SidebarContext)

  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }

  return context
}
