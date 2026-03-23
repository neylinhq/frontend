import { XCloseIcon } from '@untitledui/icons-react/outline'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import type { Edge, Node } from '@/entities/map'
import { OverflowNav, type OverflowNavItem } from '@/shared/components/overflow-nav'
import { ResizableSidebar } from '@/shared/components/resizable-sidebar'

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
  /** Render prop for practice panel */
  renderPracticePanel?: () => React.ReactNode
  /** Whether practice mode is active */
  isPracticeActive?: boolean
  /** Extra items shown inline before tabs, overflow into popover top (e.g. focus, open editor) */
  getExtraMenuItems?: (node: Node) => OverflowNavItem[]
  /** Items always in popover at bottom regardless of space (e.g. copy ID, delete) */
  getMenuItems?: (node: Node) => OverflowNavItem[]
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
  getExtraMenuItems,
  getMenuItems,
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

  // Build nav items
  const navItems = useMemo(() => {
    const items: OverflowNavItem[] = []
    if (selectedNode) {
      items.push({ id: 'node', label: t('mapSidebar.tabs.node'), active: activeTab === 'node', onClick: () => setTab('node') })
    }
    if (canEdit) {
      items.push({ id: 'chat', label: t('mapSidebar.tabs.chat'), active: activeTab === 'chat', onClick: () => setTab('chat') })
    }
    items.push({ id: 'practice', label: t('practice.mode.title'), active: activeTab === 'practice', onClick: () => setTab('practice') })
    items.push({ id: 'settings', label: t('mapSidebar.tabs.settings'), active: activeTab === 'settings', onClick: () => setTab('settings') })
    return items
  }, [selectedNode, canEdit, activeTab, setTab, t])

  const extraItems = useMemo(() => {
    if (!selectedNode || !getExtraMenuItems) return undefined
    return getExtraMenuItems(selectedNode)
  }, [selectedNode, getExtraMenuItems])

  const menuItems = useMemo(() => {
    if (!selectedNode || !getMenuItems) { return undefined }
    return getMenuItems(selectedNode)
  }, [selectedNode, getMenuItems])

  const { nav, trigger } = OverflowNav({ items: navItems, extraItems, menuItems })

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
        {/* Nav bar — inline tabs ... | [⋯] [✕] */}
        <div className='flex items-center border-b border-border/60 px-2 py-1 shrink-0'>
          {nav}
          <div className='flex items-center shrink-0'>
            {trigger}
            <button
              type='button'
              onClick={handleClose}
              className='h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors'
            >
              <XCloseIcon className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>

        {/* Content area */}
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
