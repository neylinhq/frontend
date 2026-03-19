import { XCloseIcon } from '@untitledui/icons-react/outline'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { Edge, Node } from '@/entities/map'
import { ResizableSidebar } from '@/shared/components/resizable-sidebar'
import { cn } from '@/shared/lib/cn'

import { useMapSidebarStore } from '../model'

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

  // Open sidebar to node tab only when node selected while sidebar is closed
  const prevNodeIdRef = useRef<string | null>(null)
  useEffect(() => {
    const newId = selectedNode?.id ?? null
    if (newId && newId !== prevNodeIdRef.current && !isOpen) {
      setTab('node')
    }
    prevNodeIdRef.current = newId
  }, [selectedNode?.id, isOpen, setTab])

  // Handle close
  const handleClose = useCallback(() => {
    close()
    if (activeTab === 'node') {
      onCloseNode?.()
    }
  }, [close, activeTab, onCloseNode])

  if (!isOpen) return null

  return (
    <ResizableSidebar
      open={isOpen}
      onClose={handleClose}
      width={width}
      onWidthChange={setWidth}
      className={className}
    >
      <div className='flex flex-1 flex-col min-h-0'>
        {/* Compact nav bar — text links + close */}
        <div className='flex items-center border-b border-border/60 pl-3 pr-1.5 py-1 shrink-0'>
          <nav className='flex items-center gap-1.5 flex-1 min-w-0'>
            {selectedNode && (
              <button
                type='button'
                onClick={() => setTab('node')}
                className={cn(
                  'px-1.5 py-0.5 text-xs font-medium rounded-sm transition-colors',
                  activeTab === 'node'
                    ? 'text-foreground'
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
                  'px-1.5 py-0.5 text-xs font-medium rounded-sm transition-colors',
                  activeTab === 'chat'
                    ? 'text-foreground'
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
                'px-1.5 py-0.5 text-xs font-medium rounded-sm transition-colors',
                activeTab === 'settings'
                  ? 'text-foreground'
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
    </ResizableSidebar>
  )
})
