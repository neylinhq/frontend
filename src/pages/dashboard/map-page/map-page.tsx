import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GraphWorkspace } from '@/widgets/graph-workspace'
import { GraphSidebar } from '@/widgets/graph-sidebar'
import {
  ChatPanel,
  NodePanel,
  SettingsPanel
} from '@/widgets/map-sidebar'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
import { AddNodeFab } from '@/features/node-creation'
import { useMapPermissions } from '@/features/map-permissions'
import {
  LearnMode,
  PracticeFab,
  PracticeModePanel,
  usePracticeView
} from '@/features/practice-mode'
import type { FullMap, Node } from '@/entities/map'
import { useMapFocus, useMapActions } from '@/entities/map-ui'

import { NodeHeaderActions, ChatHeaderActions } from './components/map-page-header-actions'

interface MapPageProps {
  map: FullMap
  mapId: string
}

export const MapPage = ({ map, mapId }: MapPageProps) => {
  const { t } = useTranslation()
  const { canEdit } = useMapPermissions(map)
  const { focusedNodeId } = useMapFocus(mapId)
  const { focusNode, clearFocus } = useMapActions(mapId)
  const practiceView = usePracticeView()
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const handleCloseNode = useCallback(() => {
    setSelectedNode(null)
  }, [])

  return (
    <>
      <GraphWorkspace
        mapId={mapId}
        data={map}
        readOnly={!canEdit}
        className='h-screen'
      >
        <GraphSidebar mapId={mapId}>
          <GraphSidebar.ToggleFab />

          <GraphSidebar.FloatingItem position='bottom-right'>
            <div className='flex flex-col-reverse items-center gap-3'>
              {canEdit && <AddNodeFab />}
              <PracticeFab mapId={mapId} />
            </div>
          </GraphSidebar.FloatingItem>

          <GraphSidebar.Panel
            id='node'
            label={t('mapSidebar.tabs.node')}
            headerActions={
              selectedNode ? (
                <NodeHeaderActions
                  nodeId={selectedNode.id}
                  isFocused={focusedNodeId === selectedNode.id}
                  canEdit={canEdit}
                  onToggleFocus={() => {
                    if (focusedNodeId === selectedNode.id) {
                      clearFocus()
                    } else {
                      focusNode(selectedNode.id)
                    }
                  }}
                  onOpenFullEditor={() =>
                    window.location.assign(`/dashboard/maps/${mapId}/node/${selectedNode.id}`)
                  }
                />
              ) : undefined
            }
          >
            {selectedNode ? (
              <NodePanel
                node={selectedNode}
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
            ) : (
              <div className='flex items-center justify-center h-full p-4'>
                <p className='text-sm text-muted-foreground text-center'>
                  {t('mapSidebar.selectNode')}
                </p>
              </div>
            )}
          </GraphSidebar.Panel>

          {canEdit && (
            <GraphSidebar.Panel
              id='chat'
              label={t('mapSidebar.tabs.chat')}
              headerActions={<ChatHeaderActions />}
            >
              <ChatPanel mapId={mapId} />
            </GraphSidebar.Panel>
          )}

          <GraphSidebar.Panel id='practice' label={t('practice.mode.title')}>
            <PracticeModePanel
              mapId={mapId}
              selectedNode={selectedNode}
              nodes={map.nodes}
              edges={map.edges}
            />
          </GraphSidebar.Panel>

          <GraphSidebar.Panel id='settings' label={t('mapSidebar.tabs.settings')}>
            <SettingsPanel mapId={mapId} isOwner={canEdit} />
          </GraphSidebar.Panel>
        </GraphSidebar>
      </GraphWorkspace>

      {practiceView === 'learn_mode' && (
        <LearnMode
          mapId={mapId}
          nodeLabels={new Map(map.nodes.map(n => [n.id, n.label ?? n.id.slice(0, 8)]))}
        />
      )}
    </>
  )
}
