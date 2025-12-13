import type { FullMap } from '@/entities/map'
import { MapChatDrawer } from '@/features/ai-assist'
import { GraphWebGLVisualization } from '@/features/graph-webgl'
import { ReadOnlyBanner, useMapPermissions } from '@/features/map-permissions'
import { NodeConnectionsPanel } from '@/features/node-connections-panel'
import { AddNodeFab, QuickAddDialog, useNodeCreationStore } from '@/features/node-creation'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut'

interface MapWebGLPageProps {
  map: FullMap
  mapId: string
}

export const MapWebGLPage = ({ map, mapId }: MapWebGLPageProps) => {
  const { openQuickAdd } = useNodeCreationStore()
  const { canEdit, isReadOnly } = useMapPermissions(map)

  // Keyboard shortcut: Cmd+N (Mac) or Ctrl+N (Windows/Linux) - only for owners
  useKeyboardShortcut({ key: 'n', meta: true, enabled: canEdit }, openQuickAdd)
  useKeyboardShortcut({ key: 'n', ctrl: true, enabled: canEdit }, openQuickAdd)

  return (
    <div className='h-[calc(100vh-3.5rem)] relative'>
      <GraphWebGLVisualization
        mapId={mapId}
        initialData={map}
        className='h-full w-full'
        interactive={canEdit}
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
          <QuickAddDialog />
          <AddNodeFab />
          {/* AI Chat Drawer */}
          <div className='absolute right-4 top-4 z-10'>
            <MapChatDrawer mapId={mapId} />
          </div>
        </>
      )}

      {/* Read-only banner with copy button */}
      {isReadOnly && <ReadOnlyBanner mapId={mapId} />}
    </div>
  )
}
