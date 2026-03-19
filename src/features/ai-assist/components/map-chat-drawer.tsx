import { useCallback, useEffect, useRef, useState } from 'react'
import { Drawer as VaulDrawer } from 'vaul'

import { Drawer, DrawerContent } from '@/shared/components/drawer'
import { cn } from '@/shared/lib/cn'

import {
  useAIPanelStore,
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  useRenameChatSession
} from '../model'
import { useStreamingStore } from '../model/ai-assist.streaming.store'
import { ChatHeader } from './chat-header'
import { MapChatPanel } from './map-chat-panel'

const STORAGE_KEY = 'ai-panel-width'
const MIN_WIDTH = 440
const MAX_WIDTH = 800
const DEFAULT_WIDTH = MIN_WIDTH

interface MapChatDrawerProps {
  mapId: string
}

export const MapChatDrawer = ({ mapId }: MapChatDrawerProps) => {
  const { isOpen, close } = useAIPanelStore()
  const [isMobile, setIsMobile] = useState(false)
  const [width, setWidth] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_WIDTH
    }
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, parseInt(saved, 10))) : DEFAULT_WIDTH
  })
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(width)

  // Chat sessions state
  const { data: sessions = [], isLoading: sessionsLoading, isError } = useChatSessions(mapId)
  const createSession = useCreateChatSession(mapId)
  const renameSession = useRenameChatSession(mapId)
  const deleteSession = useDeleteChatSession(mapId)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [autoCreateAttempted, setAutoCreateAttempted] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)

  // Abort all active streams when leaving the map page
  const clearAll = useStreamingStore(s => s.clearAll)
  useEffect(() => {
    return () => clearAll()
  }, [clearAll])

  // Auto-select first session or create one if none exist
  useEffect(() => {
    if (sessions.length > 0 && !activeSessionId) {
      setActiveSessionId(sessions[0].id)
      setAutoCreateAttempted(false) // Reset on successful load
    } else if (
      sessions.length === 0 &&
      !sessionsLoading &&
      !isError &&
      isOpen &&
      !createSession.isPending &&
      !autoCreateAttempted
    ) {
      // Auto-create first session when drawer opens (only once)
      setAutoCreateAttempted(true)
      createSession.mutate(
        { contextType: 'map' },
        {
          onSuccess: session => {
            setActiveSessionId(session.id)
          }
        }
      )
    }
  }, [
    sessions,
    activeSessionId,
    sessionsLoading,
    isError,
    isOpen,
    createSession.isPending,
    autoCreateAttempted
  ])

  // Handle session deletion - switch to another session
  const handleCloseSession = useCallback(
    (sessionId: string) => {
      deleteSession.mutate(sessionId, {
        onSuccess: () => {
          if (activeSessionId === sessionId) {
            // Switch to another session
            const remaining = sessions.filter(s => s.id !== sessionId)
            setActiveSessionId(remaining[0]?.id || null)
          }
        }
      })
    },
    [deleteSession, activeSessionId, sessions]
  )

  const handleCreateSession = useCallback(() => {
    createSession.mutate(
      { contextType: 'map' },
      {
        onSuccess: session => {
          setActiveSessionId(session.id)
        }
      }
    )
  }, [createSession])

  const handleRenameSession = useCallback(
    (sessionId: string, title: string) => {
      renameSession.mutate({ sessionId, title })
    },
    [renameSession]
  )

  const handleCloseAll = useCallback(() => {
    // Close all sessions except create a new one
    sessions.forEach(s => {
      deleteSession.mutate(s.id)
    })
    // Create a new session after closing all
    setTimeout(() => {
      createSession.mutate(
        { contextType: 'map' },
        {
          onSuccess: session => {
            setActiveSessionId(session.id)
          }
        }
      )
    }, 100)
  }, [sessions, deleteSession, createSession])

  const handleCloseOthers = useCallback(() => {
    // Close all sessions except the active one
    sessions
      .filter(s => s.id !== activeSessionId)
      .forEach(s => {
        deleteSession.mutate(s.id)
      })
  }, [sessions, activeSessionId, deleteSession])

  // Keyboard shortcuts for tab navigation
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey

      // Cmd/Ctrl + T — new chat
      if (isMod && e.key === 't') {
        e.preventDefault()
        handleCreateSession()
        return
      }

      // Cmd/Ctrl + K — open chat selector (like VS Code command palette)
      if (isMod && e.key === 'k') {
        e.preventDefault()
        setSelectorOpen(true)
        return
      }

      // Cmd/Ctrl + W — close current tab (only if more than 1 session)
      if (isMod && e.key === 'w' && !e.shiftKey && sessions.length > 1 && activeSessionId) {
        e.preventDefault()
        handleCloseSession(activeSessionId)
        return
      }

      // Cmd/Ctrl + Shift + W — close all tabs
      if (isMod && e.shiftKey && e.key === 'W') {
        e.preventDefault()
        handleCloseAll()
        return
      }

      // Cmd/Ctrl + [ or ] — switch tabs
      if (isMod && (e.key === '[' || e.key === ']') && sessions.length > 1 && activeSessionId) {
        e.preventDefault()
        const currentIndex = sessions.findIndex(s => s.id === activeSessionId)
        if (currentIndex === -1) return

        let newIndex: number
        if (e.key === '[') {
          // Previous tab
          newIndex = currentIndex === 0 ? sessions.length - 1 : currentIndex - 1
        } else {
          // Next tab
          newIndex = currentIndex === sessions.length - 1 ? 0 : currentIndex + 1
        }
        setActiveSessionId(sessions[newIndex].id)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, sessions, activeSessionId, handleCreateSession, handleCloseSession, handleCloseAll])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Save width to localStorage
  useEffect(() => {
    if (!isResizing) {
      localStorage.setItem(STORAGE_KEY, String(width))
    }
  }, [width, isResizing])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
      startXRef.current = e.clientX
      startWidthRef.current = width
    },
    [width]
  )

  useEffect(() => {
    if (!isResizing) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Resize from left edge: moving left increases width
      const delta = startXRef.current - e.clientX
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidthRef.current + delta))
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  // Header component with tabs and selector
  const chatHeader = (
    <ChatHeader
      sessions={sessions}
      activeSessionId={activeSessionId}
      onSelectSession={setActiveSessionId}
      onCreateSession={handleCreateSession}
      onCloseSession={handleCloseSession}
      onCloseAll={handleCloseAll}
      onCloseOthers={handleCloseOthers}
      onRenameSession={handleRenameSession}
      isLoading={sessionsLoading || createSession.isPending}
      isMobile={isMobile}
      selectorOpen={selectorOpen}
      onSelectorOpenChange={setSelectorOpen}
    />
  )

  if (isMobile) {
    return (
      <VaulDrawer.Root open={isOpen} onOpenChange={open => !open && close()}>
        <VaulDrawer.Portal>
          <VaulDrawer.Overlay className='fixed inset-0 z-40 bg-overlay' />
          <VaulDrawer.Content className='fixed inset-x-0 bottom-0 z-50 flex h-[calc(100vh-6rem)] flex-col rounded-t-xl bg-background'>
            {/* Drag handle for swipe-to-close */}
            <div className='mx-auto mt-3 h-1 w-12 shrink-0 rounded-full bg-muted-foreground/30' />
            {chatHeader}
            <div className='flex-1 overflow-hidden'>
              <MapChatPanel mapId={mapId} sessionId={activeSessionId} />
            </div>
          </VaulDrawer.Content>
        </VaulDrawer.Portal>
      </VaulDrawer.Root>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={open => !open && close()} modal={false}>
      <DrawerContent
        side='right'
        size={`${width}px`}
        showOverlay={false}
        showClose={false}
        onInteractOutside={e => e.preventDefault()}
      >
        {/* Resize handle */}
        <div
          className={cn(
            'absolute left-0 top-0 h-full w-1 cursor-ew-resize',
            'hover:bg-primary/20 active:bg-primary/30',
            'transition-colors',
            isResizing && 'bg-primary/30'
          )}
          onMouseDown={handleMouseDown}
        />
        <div className='flex min-h-0 flex-1 flex-col'>
          {chatHeader}
          <div className='min-h-0 flex-1'>
            <MapChatPanel mapId={mapId} sessionId={activeSessionId} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
