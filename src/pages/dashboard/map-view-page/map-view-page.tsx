import { ReactFlowProvider } from '@xyflow/react'
import type { FullMap } from '@/entities/map'
import { QuickAddDialog, AddNodeFab, useNodeCreationStore } from '@/features/node-creation'
import { useKeyboardShortcut } from '@/shared/hooks/use-keyboard-shortcut'
import { GraphView } from '@/widgets/graph-view'

interface MapViewPageProps {
  map: FullMap
  mapId: string
}

export const MapViewPage = ({ map, mapId }: MapViewPageProps) => {
  const { openQuickAdd } = useNodeCreationStore()

  // Keyboard shortcut: Cmd+N (Mac) or Ctrl+N (Windows/Linux)
  useKeyboardShortcut({ key: 'n', meta: true }, openQuickAdd)
  useKeyboardShortcut({ key: 'n', ctrl: true }, openQuickAdd)

  return (
    <ReactFlowProvider>
      <div className='h-[calc(100vh-3.5rem)] relative'>
        <GraphView mapId={mapId} initialData={map} className='h-full w-full' interactive={true} />
        <QuickAddDialog />
        <AddNodeFab />
      </div>
    </ReactFlowProvider>
  )
}
