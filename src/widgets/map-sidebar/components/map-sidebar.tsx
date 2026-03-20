import { XCloseIcon } from '@untitledui/icons-react/outline'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { Edge, Node } from '@/entities/map'
import { ResizableSidebar } from '@/shared/components/resizable-sidebar'
import { cn } from '@/shared/lib/cn'

import { useMapSidebarStore } from '../model'

/* ─── Pill tab button ─── */
function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
        active
          ? 'bg-muted text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      {children}
    </button>
  )
}

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
  /** Render prop for practice panel (shown when practice mode active) */
  renderPracticePanel?: () => React.ReactNode
  /** Whether practice mode is active */
  isPracticeActive?: boolean
  /** Callback when node is closed */
  onCloseNode?: () => void
  className?: string
}

export const MapSidebar = memo(function MapSidebar({
  mapId: _mapId,
  selectedNode,
  canEdit,
  isOwner: _isOwner = true,
  renderNodePanel,
  renderChatPanel,
  renderSettingsPanel,
  renderPracticePanel,
  isPracticeActive = false,
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

  // Open sidebar on practice tab when practice mode activates
  useEffect(() => {
    if (isPracticeActive) {
      setTab('practice')
    }
  }, [isPracticeActive, setTab])

  // Handle close
  const handleClose = useCallback(() => {
    close()
    if (activeTab === 'node') {
      onCloseNode?.()
    }
  }, [close, activeTab, onCloseNode])

  if (!isOpen) {
    return null
  }

  return (
    <ResizableSidebar
      open={isOpen}
      onClose={handleClose}
      width={width}
      onWidthChange={setWidth}
      className={className}
    >
      <div className='flex flex-1 flex-col min-h-0'>
        {/* Nav bar — pill tabs + close */}
        <div className='flex items-center border-b border-border/60 px-2 py-1.5 shrink-0'>
          <nav className='flex items-center gap-0.5 flex-1 min-w-0'>
            {selectedNode && (
              <TabButton active={activeTab === 'node'} onClick={() => setTab('node')}>
                {t('mapSidebar.tabs.node')}
              </TabButton>
            )}
            {canEdit && (
              <TabButton active={activeTab === 'chat'} onClick={() => setTab('chat')}>
                {t('mapSidebar.tabs.chat')}
              </TabButton>
            )}
            <TabButton active={activeTab === 'practice'} onClick={() => setTab('practice')}>
              {t('practice.mode.title')}
            </TabButton>
            <TabButton active={activeTab === 'settings'} onClick={() => setTab('settings')}>
              {t('mapSidebar.tabs.settings')}
            </TabButton>
          </nav>
          <button
            type='button'
            onClick={handleClose}
            className='relative h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors before:absolute before:-inset-1 before:content-[""]'
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

          {activeTab === 'practice' && (
            <div className='h-full overflow-y-auto'>
              {renderPracticePanel?.()}
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
