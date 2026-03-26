import { useCallback, useState } from 'react'

import type { FullMap, Node } from '@/entities/map'
import {
  useMapActions,
  useMapActiveTab,
  useMapUIStore,
  useSidebarOpen
} from '@/entities/map-ui'
import {
  GraphWebGLVisualization,
  type ViewportState
} from '@/features/graph/graph-webgl'
import { ReadOnlyBanner, useMapPermissions } from '@/features/map-permissions'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
import {
  AddNodeFab,
  QuickAddDialogWebGL,
  useNodeCreationStore
} from '@/features/node-creation'
import { FloatingLayer } from '@/shared/components/floating-layer'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut'
import {
  ChatPanel,
  MapSidebar,
  NodePanel,
  SettingsPanel,
  SidebarToggleFab
} from '@/widgets/map-sidebar'

interface MapWebGLPageProps {
  map: FullMap
  mapId: string
}

export const MapWebGLPage = ({ map, mapId }: MapWebGLPageProps) => {
  const { openQuickAdd } = useNodeCreationStore()
  const { canEdit, isReadOnly } = useMapPermissions(map)
  const isOpen = useSidebarOpen()
  const activeTab = useMapActiveTab(mapId)
  const { setActiveTab } = useMapActions(mapId)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [viewport, setViewport] = useState<ViewportState | null>(null)

  // Keyboard shortcut: Cmd+N (Mac) or Ctrl+N (Windows/Linux) - only for owners
  useKeyboardShortcut({ key: 'n', meta: true, enabled: canEdit }, openQuickAdd)
  useKeyboardShortcut({ key: 'n', ctrl: true, enabled: canEdit }, openQuickAdd)

  // Keyboard shortcut: Cmd+B / Ctrl+B - toggle sidebar
  useKeyboardShortcut({ key: 'b', meta: true }, () => {
    useMapUIStore.getState().toggleSidebar()
  })
  useKeyboardShortcut({ key: 'b', ctrl: true }, () => {
    useMapUIStore.getState().toggleSidebar()
  })

  // Toggle AI chat in sidebar
  const handleToggleAIPanel = useCallback(() => {
    if (isOpen && activeTab === 'chat') {
      useMapUIStore.getState().setSidebarOpen(false)
    } else {
      setActiveTab('chat')
      useMapUIStore.getState().setSidebarOpen(true)
    }
  }, [isOpen, activeTab, setActiveTab])

  const isAIPanelOpen = isOpen && activeTab === 'chat'

  // Handle node selection from graph - open sidebar with node tab
  const handleNodeSelect = useCallback(
    (node: Node | null) => {
      setSelectedNode(node)
      if (node) {
        setActiveTab('node')
        useMapUIStore.getState().setSidebarOpen(true)
      }
    },
    [setActiveTab]
  )

  // Handle close node in sidebar
  const handleCloseNode = useCallback(() => {
    setSelectedNode(null)
  }, [])

  return (
    <div className='h-screen relative'>
      <GraphWebGLVisualization
        mapId={mapId}
        initialData={map}
        className='h-full w-full'
        interactive={canEdit}
        isAIPanelOpen={isAIPanelOpen}
        onToggleAIPanel={handleToggleAIPanel}
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

      <FloatingLayer.Root>
        <FloatingLayer.Item position='top-right'>
          <SidebarToggleFab />
        </FloatingLayer.Item>
        {canEdit && (
          <FloatingLayer.Item position='bottom-right'>
            <div className='flex flex-col-reverse items-center gap-3'>
              <AddNodeFab />
            </div>
          </FloatingLayer.Item>
        )}
      </FloatingLayer.Root>

      {canEdit && <QuickAddDialogWebGL viewport={viewport} />}
      {isReadOnly && <ReadOnlyBanner mapId={mapId} />}

      {/* Sidebar overlays the graph — no layout shift */}
      <MapSidebar
        className='absolute right-0 top-0 h-full z-10'
        mapId={mapId}
        selectedNode={selectedNode}
        edges={map.edges}
        allNodes={map.nodes}
        canEdit={canEdit}
        isOwner={canEdit}
        onCloseNode={handleCloseNode}
        renderNodePanel={node => (
          <NodePanel
            node={node}
            edges={map.edges}
            allNodes={map.nodes}
            isReadOnly={!canEdit}
            onClose={handleCloseNode}
            renderConnectionsPanel={(n, edges, allNodes, onOpenNode, onPanToNode) => (
              <NodeConnectionsPanel
                node={n}
                edges={edges}
                allNodes={allNodes}
                onOpenNode={onOpenNode}
                onPanToNode={onPanToNode}
              />
            )}
          />
        )}
        renderChatPanel={() => <ChatPanel mapId={mapId} />}
        renderSettingsPanel={() => <SettingsPanel mapId={mapId} isOwner={canEdit} />}
      />
    </div>
  )
}
