import { useCallback, useState } from 'react'
import type { FullMap, Node } from '@/entities/map'
import { GraphWebGLVisualization, type ViewportState } from '@/features/graph-webgl'
import { ReadOnlyBanner, useMapPermissions } from '@/features/map-permissions'
import { ChatPanel, NodePanel, SettingsPanel, SidebarToggleFab, useMapSidebarStore } from '@/features/map-sidebar'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
import { AddNodeFab, QuickAddDialogWebGL, useNodeCreationStore } from '@/features/node-creation'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut'
import { cn } from '@/shared/lib/cn'

interface MapWebGLPageProps {
  map: FullMap
  mapId: string
}

export const MapWebGLPage = ({ map, mapId }: MapWebGLPageProps) => {
  const { openQuickAdd } = useNodeCreationStore()
  const { canEdit, isReadOnly } = useMapPermissions(map)
  const { isOpen, width, open, setTab } = useMapSidebarStore()
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [viewport, setViewport] = useState<ViewportState | null>(null)

  // Keyboard shortcut: Cmd+N (Mac) or Ctrl+N (Windows/Linux) - only for owners
  useKeyboardShortcut({ key: 'n', meta: true, enabled: canEdit }, openQuickAdd)
  useKeyboardShortcut({ key: 'n', ctrl: true, enabled: canEdit }, openQuickAdd)

  // Keyboard shortcut: Cmd+B / Ctrl+B - toggle sidebar
  useKeyboardShortcut({ key: 'b', meta: true }, () => {
    if (isOpen) {
      useMapSidebarStore.getState().close()
    } else {
      open()
    }
  })
  useKeyboardShortcut({ key: 'b', ctrl: true }, () => {
    if (isOpen) {
      useMapSidebarStore.getState().close()
    } else {
      open()
    }
  })

  // Handle node selection from graph - open sidebar with node tab
  const handleNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node)
    if (node) {
      setTab('node')
    }
  }, [setTab])

  // Handle close node in sidebar
  const handleCloseNode = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // Render connections panel for NodePanel
  const renderConnectionsPanel = useCallback(
    (node: Node, edges: typeof map.edges, allNodes: typeof map.nodes, onOpenNode?: (id: string) => void, onPanToNode?: (id: string) => void) => (
      <NodeConnectionsPanel
        node={node}
        edges={edges}
        allNodes={allNodes}
        onOpenNode={onOpenNode}
        onPanToNode={onPanToNode}
      />
    ),
    []
  )

  return (
    <div className='h-screen flex'>
      {/* Main canvas area - flex-1 to shrink when sidebar opens */}
      <div className='flex-1 min-w-0 relative'>
        <GraphWebGLVisualization
          mapId={mapId}
          initialData={map}
          className='h-full w-full'
          interactive={canEdit}
          onNodeSelect={handleNodeSelect}
          onViewportChange={nextViewport => setViewport(nextViewport)}
          renderConnectionsPanel={(node, edges, allNodes, onOpenNode, onPanToNode) => (
            <NodeConnectionsPanel
              node={node}
              edges={edges}
              allNodes={allNodes}
              onOpenNode={onOpenNode}
              onPanToNode={onPanToNode}
            />
          )}
        />

        {/* Owner-only components */}
        {canEdit && (
          <>
            <QuickAddDialogWebGL viewport={viewport} />
            <AddNodeFab />
          </>
        )}

        {/* Sidebar toggle FAB */}
        <SidebarToggleFab />

        {/* Read-only banner with copy button */}
        {isReadOnly && <ReadOnlyBanner mapId={mapId} />}
      </div>

      {/* Collapsible sidebar */}
      {isOpen && (
        <aside
          className={cn(
            'hidden md:flex flex-col flex-shrink-0 border-l border-border h-full overflow-hidden bg-background',
            'transition-[width] duration-200'
          )}
          style={{ width }}
        >
          {/* Node Panel */}
          {selectedNode ? (
            <NodePanel
              node={selectedNode}
              edges={map.edges}
              allNodes={map.nodes}
              isReadOnly={!canEdit}
              onClose={handleCloseNode}
              renderConnectionsPanel={renderConnectionsPanel}
            />
          ) : (
            /* Show chat or settings based on active tab */
            <div className='flex flex-col h-full'>
              {canEdit ? (
                <ChatPanel mapId={mapId} />
              ) : (
                <SettingsPanel mapId={mapId} isOwner={canEdit} />
              )}
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
