import { useCallback, useEffect, useRef, useState } from 'react'
import { Drawer as VaulDrawer } from 'vaul'

import { Drawer, DrawerContent } from '@/shared/components/drawer'
import { cn } from '@/shared/lib/cn'

import { useAIPanelStore } from '../model'
import { useStreamingStore } from '../model/ai-assist.streaming.store'
import { useChatKeyboardShortcuts } from '../model/use-chat-keyboard-shortcuts'
import { useChatSessionManager } from '../model/use-chat-session-manager'
import { ChatHeader } from './chat-header'
import { ChatPanel } from './chat-panel'

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
  const [selectorOpen, setSelectorOpen] = useState(false)

  const {
    sessions,
    sessionsLoading,
    activeSessionId,
    setActiveSessionId,
    isCreating,
    handleCreateSession,
    handleCloseSession,
    handleRenameSession,
    handleCloseAll,
    handleCloseOthers,
    handleNextTab,
    handlePrevTab
  } = useChatSessionManager({ mapId, isOpen })

  const clearAll = useStreamingStore(s => s.clearAll)
  useEffect(() => {
    return () => clearAll()
  }, [clearAll])

  useChatKeyboardShortcuts({
    isOpen,
    canCloseCurrent: sessions.length > 1 && !!activeSessionId,
    onCreateSession: handleCreateSession,
    onCloseSession: () => activeSessionId && handleCloseSession(activeSessionId),
    onCloseAll: handleCloseAll,
    onNextTab: handleNextTab,
    onPrevTab: handlePrevTab,
    onOpenSelector: () => setSelectorOpen(true)
  })

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      isLoading={sessionsLoading || isCreating}
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
              <ChatPanel scope='map' mapId={mapId} sessionId={activeSessionId} />
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
            <ChatPanel scope='map' mapId={mapId} sessionId={activeSessionId} />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
