import { ReactFlowProvider } from '@xyflow/react'
import { type ReactNode, useCallback, useState } from 'react'

import { GraphView } from '@/widgets/graph-view'
import type { ViewportState } from '@/shared/lib/viewport'
import { QuickAddDialogWebGL, useNodeCreationStore } from '@/features/node-creation'
import type { FullMap } from '@/entities/map'
import {
  useMapActions,
  useMapActiveTab,
  useMapUIStore,
  useSidebarOpen,
  useSidebarWidth
} from '@/entities/map-ui'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut'
import { cn } from '@/shared/lib/cn'

export interface GraphWorkspaceProps {
  mapId: string
  data: FullMap
  readOnly?: boolean
  onDataChange?: (data: FullMap) => void
  className?: string
  /** Composable children: GraphSidebar, LearnMode, etc. */
  children?: ReactNode
}

export const GraphWorkspace = ({
  mapId,
  data,
  readOnly = false,
  onDataChange,
  className,
  children
}: GraphWorkspaceProps) => {
  const canEdit = !readOnly
  const { setActiveTab } = useMapActions(mapId)
  const { openQuickAdd } = useNodeCreationStore()
  const isOpen = useSidebarOpen()
  const sidebarWidth = useSidebarWidth()
  const activeTab = useMapActiveTab(mapId)
  const [viewport, setViewport] = useState<ViewportState | null>(null)
  const [useWebGL, setUseWebGL] = useState(true)

  useKeyboardShortcut({ key: 'n', meta: true, enabled: canEdit }, openQuickAdd)
  useKeyboardShortcut({ key: 'n', ctrl: true, enabled: canEdit }, openQuickAdd)

  useKeyboardShortcut({ key: 'b', meta: true }, () => {
    useMapUIStore.getState().toggleSidebar()
  })
  useKeyboardShortcut({ key: 'b', ctrl: true }, () => {
    useMapUIStore.getState().toggleSidebar()
  })

  const handleToggleAIPanel = useCallback(() => {
    if (isOpen && activeTab === 'chat') {
      useMapUIStore.getState().setSidebarOpen(false)
    } else {
      setActiveTab('chat')
      useMapUIStore.getState().setSidebarOpen(true)
    }
  }, [isOpen, activeTab, setActiveTab])

  const isAIPanelOpen = isOpen && activeTab === 'chat'

  const handleNodeSelect = useCallback(
    (node: { id: string } | null) => {
      if (!node) {
        return
      }
      setActiveTab('node')
      useMapUIStore.getState().setSidebarOpen(true)
    },
    [setActiveTab]
  )

  return (
    <ReactFlowProvider>
      <div
        className={cn('relative overflow-hidden', className)}
        style={{ '--map-sidebar-width': isOpen ? `${sidebarWidth}px` : '0px' } as React.CSSProperties}
      >
        {/* Graph canvas — fills entire container */}
        <GraphView
          mapId={mapId}
          initialData={data}
          className='absolute inset-0'
          interactive={canEdit}
          isAIPanelOpen={isAIPanelOpen}
          onToggleAIPanel={handleToggleAIPanel}
          onOpenSettings={() => {
            setActiveTab('settings')
            useMapUIStore.getState().setSidebarOpen(true)
          }}
          onNodeSelect={handleNodeSelect}
          onViewportChange={setViewport}
          useWebGL={useWebGL}
        />

        {canEdit && <QuickAddDialogWebGL viewport={viewport} />}

        {/* Composable children: sidebar, FABs, overlays */}
        {children}
      </div>
    </ReactFlowProvider>
  )
}
