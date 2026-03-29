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
import { cn } from '@/shared/lib/cn'

interface GraphWorkspaceProps {
  mapId: string
  data: FullMap
  readOnly?: boolean
  onDataChange?: (data: FullMap) => void
  className?: string
}

export const GraphWorkspace = ({
  mapId,
  data,
  readOnly = false,
  onDataChange,
  className
}: GraphWorkspaceProps) => {
  const canEdit = !readOnly
  const { focusedNodeId } = useMapFocus(mapId)
  const { focusNode, clearFocus, setActiveTab } = useMapActions(mapId)
  const { openQuickAdd } = useNodeCreationStore()
  const isOpen = useSidebarOpen()
  const activeTab = useMapActiveTab(mapId)
  const practiceView = usePracticeView()
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
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

  const handleCloseNode = useCallback(() => {
    setSelectedNode(null)
  }, [])

  return (
    <ReactFlowProvider>
      <div className={cn('relative overflow-hidden', className)}>
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

        <FloatingLayer.Root>
          {!readOnly && (
            <FloatingLayer.Item position='top-right'>
              <SidebarToggleFab />
            </FloatingLayer.Item>
          )}
          <FloatingLayer.Item position='bottom-right'>
            <div className='flex items-end gap-3'>
              <div className='flex flex-col-reverse items-center gap-3'>
                {canEdit && <AddNodeFab />}
                {!readOnly && <PracticeFab mapId={mapId} />}
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


        {!readOnly && (
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
                edges={data.edges}
                allNodes={data.nodes}
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
                nodes={data.nodes}
                edges={data.edges}
              />
            )}
          />
        )}

        {practiceView === 'learn_mode' && (
          <LearnMode
            mapId={mapId}
            nodeLabels={new Map(data.nodes.map(n => [n.id, n.label ?? n.id.slice(0, 8)]))}
          />
        )}
      </div>
    </ReactFlowProvider>
  )
}
