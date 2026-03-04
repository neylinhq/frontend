import { ReactFlowProvider } from '@xyflow/react'

import { GraphView } from '@/widgets/graph-view'
import { MapChatDrawer } from '@/features/ai-assist'
import { ReadOnlyBanner, useMapPermissions } from '@/features/map-permissions'
import { AddNodeFab, QuickAddDialog, useNodeCreationStore } from '@/features/node-creation'
import type { FullMap } from '@/entities/map'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut'

interface MapViewPageProps {
  map: FullMap
  mapId: string
}

export const MapViewPage = ({ map, mapId }: MapViewPageProps) => {
  const { openQuickAdd } = useNodeCreationStore()
  const { canEdit, isReadOnly } = useMapPermissions(map)

  // Keyboard shortcut: Cmd+N (Mac) or Ctrl+N (Windows/Linux) - only for owners
  useKeyboardShortcut({ key: 'n', meta: true, enabled: canEdit }, openQuickAdd)
  useKeyboardShortcut({ key: 'n', ctrl: true, enabled: canEdit }, openQuickAdd)

  return (
    <ReactFlowProvider>
      <div className='h-full relative'>
        <GraphView
          mapId={mapId}
          initialData={map}
          className='h-full w-full'
          interactive={canEdit}
        />

        {/* Owner-only components */}
        {canEdit && (
          <>
            <QuickAddDialog />
            <AddNodeFab />
            {/* AI Chat Drawer - controlled by toolbar button */}
            <MapChatDrawer mapId={mapId} />
          </>
        )}

        {/* Read-only banner with copy button */}
        {isReadOnly && <ReadOnlyBanner mapId={mapId} />}
      </div>
    </ReactFlowProvider>
  )
}
