import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ReactFlowProvider } from '@xyflow/react'

import type { FullMap, Node } from '@/entities/map'
import { useDeleteNode } from '@/entities/map'
import {
  useMapActions,
  useMapActiveTab,
  useMapFocus,
  useMapUIStore,
  useSidebarOpen
} from '@/entities/map-ui'
import type { ViewportState } from '@/features/graph/graph-webgl'
import { ReadOnlyBanner, useMapPermissions } from '@/features/map-permissions'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
import { AddNodeFab, QuickAddDialogWebGL, useNodeCreationStore } from '@/features/node-creation'
import {
  PracticeFab,
  PracticeModePanel
} from '@/features/practice-mode'
import { Fab } from '@/shared/components/fab'
import type { OverflowNavItem } from '@/shared/components/overflow-nav'
import { toast } from '@/shared/components/toast'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut'
import { GraphView } from '@/widgets/graph-view'
import {
  ChatPanel,
  MapSidebar,
  NodePanel,
  SettingsPanel,
  SidebarToggleFab
} from '@/widgets/map-sidebar'

interface MapPageProps {
  map: FullMap
  mapId: string
}

export const MapPage = ({ map, mapId }: MapPageProps) => {
  const { t } = useTranslation()
  const { canEdit, isReadOnly } = useMapPermissions(map)
  const { focusedNodeId } = useMapFocus(mapId)
  const { focusNode, clearFocus, setActiveTab } = useMapActions(mapId)
  const { openQuickAdd } = useNodeCreationStore()
  const isOpen = useSidebarOpen()
  const activeTab = useMapActiveTab(mapId)
  const deleteNodeMutation = useDeleteNode(mapId)
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
      if (!node) { return }
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
        {/* Main canvas area */}
        <div className='flex-1 min-w-0 relative'>
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

          {canEdit && <QuickAddDialogWebGL viewport={viewport} />}

          <Fab.Root>
            <Fab.Item position='top-right'>
              <SidebarToggleFab />
            </Fab.Item>
            <Fab.Item position='bottom-right'>
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
            </Fab.Item>
          </Fab.Root>

          {/* Read-only banner */}
          {isReadOnly && <ReadOnlyBanner mapId={mapId} />}
        </div>

        {/* Sidebar — tabs node/chat/settings, resize, mobile drawer */}
        <MapSidebar
          mapId={mapId}
          selectedNode={selectedNode}
          edges={map.edges}
          allNodes={map.nodes}
          canEdit={canEdit}
          isOwner={canEdit}
          onCloseNode={handleCloseNode}
          getExtraMenuItems={node => [
            {
              id: 'focus',
              label: focusedNodeId === node.id ? t('graph.toolbar.clearFocus') : t('graph.toolbar.focusMode'),
              onClick: () => focusedNodeId === node.id ? clearFocus() : focusNode(node.id)
            },
            {
              id: 'open',
              label: t('nodeDrawer.openFullEditor', 'Open'),
              onClick: () => window.location.assign(`/dashboard/maps/${mapId}/node/${node.id}`)
            }
          ]}
          getMenuItems={node => {
            const items: OverflowNavItem[] = [
              {
                id: 'copy-id',
                label: t('nodeEdit.copyId'),
                onClick: () => {
                  navigator.clipboard.writeText(node.id)
                  toast.success(t('common.copied'))
                }
              }
            ]
            if (canEdit) {
              items.push({
                id: 'delete',
                label: t('nodeEdit.deleteNode'),
                destructive: true,
                onClick: () => {
                  if (confirm(t('nodeEdit.deleteConfirmTitle'))) {
                    deleteNodeMutation.mutate(node.id, {
                      onSuccess: () => {
                        toast.success(t('nodeEdit.nodeDeleted'))
                        handleCloseNode()
                      }
                    })
                  }
                }
              })
            }
            return items
          }}
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
          renderPracticePanel={() => <PracticeModePanel mapId={mapId} selectedNode={selectedNode} nodes={map.nodes} edges={map.edges} />}
        />
      </div>
    </ReactFlowProvider>
  )
}
