import {
  MessageChatCircleIcon,
  Settings01Icon,
  Sliders04Icon,
  XCloseIcon
} from '@untitledui/icons-react/outline'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Drawer as VaulDrawer } from 'vaul'

import type { Edge, Node } from '@/entities/map'
import { Button } from '@/shared/components/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/tabs'
import { cn } from '@/shared/lib/cn'

import {
  MAP_SIDEBAR_MAX_WIDTH,
  MAP_SIDEBAR_MIN_WIDTH,
  type MapSidebarTab,
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

  // Auto-switch to node tab when node is selected
  useEffect(() => {
    if (selectedNode && isOpen) {
      setTab('node')
    }
  }, [selectedNode, isOpen, setTab])

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
      // Resize from left edge: moving left increases width
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

  // Handle tab change
  const handleTabChange = useCallback(
    (value: string) => {
      setTab(value as MapSidebarTab)
    },
    [setTab]
  )

  // Handle close
  const handleClose = useCallback(() => {
    close()
    if (activeTab === 'node') {
      onCloseNode?.()
    }
  }, [close, activeTab, onCloseNode])

  // Don't render if not open
  if (!isOpen) return null

  // Tab content
  const tabContent = (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className='flex flex-1 flex-col min-h-0'
    >
      <TabsList variant='underline' className='grid grid-cols-3 shrink-0'>
        <TabsTrigger
          variant='underline'
          value='node'
          disabled={!selectedNode}
          className='gap-1.5'
          title={t('mapSidebar.tabs.node')}
        >
          <Sliders04Icon className='h-3.5 w-3.5' />
          <span className='text-xs hidden sm:inline'>{t('mapSidebar.tabs.node')}</span>
        </TabsTrigger>
        {canEdit && (
          <TabsTrigger
            variant='underline'
            value='chat'
            className='gap-1.5'
            title={t('mapSidebar.tabs.chat')}
          >
            <MessageChatCircleIcon className='h-3.5 w-3.5' />
            <span className='text-xs hidden sm:inline'>{t('mapSidebar.tabs.chat')}</span>
          </TabsTrigger>
        )}
        <TabsTrigger
          variant='underline'
          value='settings'
          className='gap-1.5'
          title={t('mapSidebar.tabs.settings')}
        >
          <Settings01Icon className='h-3.5 w-3.5' />
          <span className='text-xs hidden sm:inline'>{t('mapSidebar.tabs.settings')}</span>
        </TabsTrigger>
      </TabsList>

      {/* Node Tab */}
      <TabsContent value='node' className='flex-1 overflow-y-auto mt-0'>
        {selectedNode ? (
          renderNodePanel?.(selectedNode)
        ) : (
          <div className='flex items-center justify-center h-full p-4'>
            <p className='text-sm text-muted-foreground text-center'>
              {t('mapSidebar.selectNode')}
            </p>
          </div>
        )}
      </TabsContent>

      {/* Chat Tab */}
      {canEdit && (
        <TabsContent value='chat' className='flex-1 overflow-hidden mt-0'>
          {renderChatPanel?.()}
        </TabsContent>
      )}

      {/* Settings Tab */}
      <TabsContent value='settings' className='flex-1 overflow-y-auto mt-0'>
        {renderSettingsPanel?.()}
      </TabsContent>
    </Tabs>
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
            {/* Header */}
            <div className='flex items-center justify-between px-4 py-2 border-b'>
              <span className='text-sm font-medium'>{t('mapSidebar.title')}</span>
              <Button variant='ghost' size='icon' className='h-7 w-7' onClick={handleClose}>
                <XCloseIcon className='h-4 w-4' />
              </Button>
            </div>
            {tabContent}
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

      {/* Header */}
      <div className='flex items-center justify-between px-4 py-2 border-b shrink-0'>
        <span className='text-sm font-medium'>{t('mapSidebar.title')}</span>
        <Button variant='ghost' size='icon' className='h-7 w-7' onClick={handleClose}>
          <XCloseIcon className='h-4 w-4' />
        </Button>
      </div>

      {tabContent}
    </aside>
  )
})
