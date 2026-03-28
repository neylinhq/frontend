import { ReactFlowProvider } from '@xyflow/react'
import { useCallback, useState } from 'react'

import { GraphView } from '@/widgets/graph-view'
import {
  ChatPanel,
  MapSidebar,
  NodePanel,
  SettingsPanel,
  SidebarToggleFab
} from '@/widgets/map-sidebar'
import type { ViewportState } from '@/shared/lib/viewport'
import { ReadOnlyBanner, useMapPermissions } from '@/features/map-permissions'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
import { AddNodeFab, QuickAddDialogWebGL, useNodeCreationStore } from '@/features/node-creation'
import {
  LearnMode,
  PracticeFab,
  PracticeModePanel,
  usePracticeView
} from '@/features/practice-mode'
import type { FullMap, Node } from '@/entities/map'
import {
  useMapActions,
  useMapActiveTab,
  useMapFocus,
  useMapUIStore,
  useSidebarOpen
} from '@/entities/map-ui'
import { FloatingLayer } from '@/shared/components/floating-layer'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut'

interface MapPageProps {
  map: FullMap
  mapId: string
}

export const MapPage = ({ map, mapId }: MapPageProps) => {
  const { canEdit, isReadOnly } = useMapPermissions(map)
  const { focusedNodeId } = useMapFocus(mapId)
  const { focusNode, clearFocus, setActiveTab } = useMapActions(mapId)
  const { openQuickAdd } = useNodeCreationStore()
  const isOpen = useSidebarOpen()
  const activeTab = useMapActiveTab(mapId)
  const practiceView = usePracticeView()
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [viewport, setViewport] = useState<ViewportState | null>(null)
  const [useWebGL, setUseWebGL] = useState(true)

  // Keyboard shortcut: Cmd+N / Ctrl+N — new node
  useKeyboardShortcut({ key: 'n', meta: true, enabled: canEdit }, openQuickAdd)
  useKeyboardShortcut({ key: 'n', ctrl: true, enabled: canEdit }, openQuickAdd)

  // Keyboard shortcut: Cmd+B / Ctrl+B — toggle sidebar
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

  // Handle node selection from graph — open sidebar with node tab
  // Ignore null (click on canvas) — node stays selected until user picks another or closes panel
  const handleNodeSelect = useCallback(
    (node: Node | null) => {
      if (!node) {
        return
      }
      setSelectedNode(node)
      setActiveTab('node')
      useMapUIStore.getState().setSidebarOpen(true)
    },
    [setActiveTab]
  )

  // Handle close node in sidebar
  const handleCloseNode = useCallback(() => {
    setSelectedNode(null)
  }, [])

  return (
    <ReactFlowProvider>
      <div className='h-screen flex'>
        <div className='flex-1 min-w-0 relative'>
          <div className='fixed inset-0'>
            <GraphView
              mapId={mapId}
              initialData={map}
              className='h-full w-full'
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
          </div>

          {canEdit && <QuickAddDialogWebGL viewport={viewport} />}

          <FloatingLayer.Root>
            <FloatingLayer.Item position='top-right'>
              <SidebarToggleFab />
            </FloatingLayer.Item>
            <FloatingLayer.Item position='bottom-right'>
              <div className='flex items-end gap-3'>
                MiniMap
                <div className='flex flex-col-reverse items-center gap-3'>
                  {canEdit && <AddNodeFab />}
                  <PracticeFab mapId={mapId} />
                  <button
                    type='button'
                    onClick={() => setUseWebGL(v => !v)}
                    className='h-8 rounded-lg border border-border/60 bg-background/80 backdrop-blur-sm px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
                  >
                    {useWebGL ? 'WebGL' : 'Flow'}
                  </button>
                </div>
              </div>
            </FloatingLayer.Item>
          </FloatingLayer.Root>

          {/* Read-only banner */}
          {isReadOnly && <ReadOnlyBanner mapId={mapId} />}
        </div>

        {/* Sidebar — push layout (React Flow page) */}
        <MapSidebar
          mapId={mapId}
          selectedNode={selectedNode}
          canEdit={canEdit}
          isFocused={focusedNodeId === selectedNode?.id}
          onToggleFocus={() => {
            if (!selectedNode) {
              return
            }
            if (focusedNodeId === selectedNode.id) {
              clearFocus()
            } else {
              focusNode(selectedNode.id)
            }
          }}
          onOpenFullEditor={
            selectedNode
              ? () => window.location.assign(`/dashboard/maps/${mapId}/node/${selectedNode.id}`)
              : undefined
          }
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
          renderPracticePanel={() => (
            <PracticeModePanel
              mapId={mapId}
              selectedNode={selectedNode}
              nodes={map.nodes}
              edges={map.edges}
            />
          )}
        />

        {/* Learn Mode — fullscreen overlay */}
        {practiceView === 'learn_mode' && (
          <LearnMode
            mapId={mapId}
            nodeLabels={new Map(map.nodes.map(n => [n.id, n.label ?? n.id.slice(0, 8)]))}
          />
        )}
      </div>
    </ReactFlowProvider>
  )
}
