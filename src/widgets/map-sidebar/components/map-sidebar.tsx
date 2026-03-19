import { XCloseIcon } from '@untitledui/icons-react/outline'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer as VaulDrawer } from 'vaul'

import type { Edge, Node } from '@/entities/map'
import { cn } from '@/shared/lib/cn'

import {
  MAP_SIDEBAR_MAX_WIDTH,
  MAP_SIDEBAR_MIN_WIDTH,
  useMapSidebarStore
} from '../model'

interface MapSidebarProps {
  mapId: string
  /** Selected node for Node tab */
  selectedNode: Node | null
  /** All edges for connections panel */
  edges: Edge[]
  /** All nodes for connections panel */
  allNodes: Node[]
  /** Whether user can edit (owner) */
  canEdit: boolean
  /** Whether current user is owner */
  isOwner?: boolean
  /** Render prop for node panel content */
  renderNodePanel?: (node: Node) => React.ReactNode
  /** Render prop for chat panel content */
  renderChatPanel?: () => React.ReactNode
  /** Render prop for settings panel content */
  renderSettingsPanel?: () => React.ReactNode
  /** Callback when node is closed */
  onCloseNode?: () => void
  className?: string
}

/** Breakpoint for switching between mobile sheet and desktop sidebar */
const SIDEBAR_BREAKPOINT = 768

export const MapSidebar = memo(function MapSidebar({
  mapId: _mapId,
  selectedNode,
  canEdit,
  isOwner = true,
  renderNodePanel,
  renderChatPanel,
  renderSettingsPanel,
  onCloseNode,
  className
}: MapSidebarProps) {
  const { t } = useTranslation()
  const { isOpen, activeTab, width, close, setTab, setWidth } = useMapSidebarStore()
  const [isMobile, setIsMobile] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const startXRef = useRef(0)
  const startWidthRef = useRef(width)

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < SIDEBAR_BREAKPOINT)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-switch to node tab when node is selected, close if deselected while on node tab
  useEffect(() => {
    if (selectedNode && isOpen) {
      setTab('node')
    } else if (!selectedNode && isOpen && activeTab === 'node') {
      close()
    }
  }, [selectedNode, isOpen, activeTab, setTab, close])

  // Resize handlers
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
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startXRef.current - e.clientX
      const newWidth = Math.min(
        MAP_SIDEBAR_MAX_WIDTH,
        Math.max(MAP_SIDEBAR_MIN_WIDTH, startWidthRef.current + delta)
      )
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
  }, [isResizing, setWidth])

  // Handle close
  const handleClose = useCallback(() => {
    close()
    if (activeTab === 'node') {
      onCloseNode?.()
    }
  }, [close, activeTab, onCloseNode])

  // Don't render if not open
  if (!isOpen) return null

  // Navigation bar + content
  const sidebarContent = (
    <div className='flex flex-1 flex-col min-h-0'>
      {/* Compact nav bar — text links + close */}
      <div className='flex items-center border-b border-border/60 pl-3 pr-1.5 py-1 shrink-0'>
        <nav className='flex items-center gap-1.5 flex-1 min-w-0'>
          {selectedNode && (
            <button
              type='button'
              onClick={() => setTab('node')}
              className={cn(
                'px-1.5 py-0.5 text-xs rounded-sm transition-colors',
                activeTab === 'node'
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('mapSidebar.tabs.node')}
            </button>
          )}
          {canEdit && (
            <button
              type='button'
              onClick={() => setTab('chat')}
              className={cn(
                'px-1.5 py-0.5 text-xs rounded-sm transition-colors',
                activeTab === 'chat'
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t('mapSidebar.tabs.chat')}
            </button>
          )}
          <button
            type='button'
            onClick={() => setTab('settings')}
            className={cn(
              'px-1.5 py-0.5 text-xs rounded-sm transition-colors',
              activeTab === 'settings'
                ? 'text-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t('mapSidebar.tabs.settings')}
          </button>
        </nav>
        <button
          type='button'
          onClick={handleClose}
          className='h-6 w-6 flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <XCloseIcon className='h-3.5 w-3.5' />
        </button>
      </div>

      {/* Content area — renders based on active tab */}
      <div className='flex-1 min-h-0 overflow-hidden'>
        {activeTab === 'node' && (
          <div className='h-full overflow-y-auto'>
            {selectedNode ? (
              renderNodePanel?.(selectedNode)
            ) : (
              <div className='flex items-center justify-center h-full p-4'>
                <p className='text-sm text-muted-foreground text-center'>
                  {t('mapSidebar.selectNode')}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chat' && canEdit && (
          <div className='flex flex-col h-full overflow-hidden'>
            {renderChatPanel?.()}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className='h-full overflow-y-auto'>
            {renderSettingsPanel?.()}
          </div>
        )}
      </div>
    </div>
  )

  // Mobile: Vaul drawer from bottom
  if (isMobile) {
    return (
      <VaulDrawer.Root open={isOpen} onOpenChange={open => !open && handleClose()}>
        <VaulDrawer.Portal>
          <VaulDrawer.Overlay className='fixed inset-0 z-40 bg-overlay' />
          <VaulDrawer.Content className='fixed inset-x-0 bottom-0 z-50 flex h-[calc(100vh-6rem)] flex-col rounded-t-xl bg-background'>
            {/* Drag handle */}
            <div className='mx-auto mt-3 h-1 w-12 shrink-0 rounded-full bg-muted-foreground/30' />
            {sidebarContent}
          </VaulDrawer.Content>
        </VaulDrawer.Portal>
      </VaulDrawer.Root>
    )
  }

  // Desktop: inline collapsible sidebar
  return (
    <aside
      className={cn(
        'flex flex-col flex-shrink-0 border-l border-border h-full overflow-hidden relative bg-background',
        'transition-[width] duration-200',
        isResizing && 'select-none',
        className
      )}
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1 cursor-col-resize z-10',
          'hover:bg-primary/20 active:bg-primary/30 transition-colors',
          isResizing && 'bg-primary/30'
        )}
      />

      {sidebarContent}
    </aside>
  )
})
