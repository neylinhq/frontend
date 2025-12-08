import { useMap } from '@/entities/map'
import type { MapChatContext } from '../ai-assist.types'
import { mapIntentHandlers } from '../lib/map-intent-handlers'
import { AIChatCore } from './ai-chat-core'

interface MapChatPanelProps {
  mapId: string
}

export const MapChatPanel = ({ mapId }: MapChatPanelProps) => {
  const { data: map } = useMap(mapId)

  const context: MapChatContext = {
    type: 'map',
    mapId,
    mapName: map?.title || '',
    nodeCount: map?.nodesCount || 0
  }

  return <AIChatCore context={context} intentHandlers={mapIntentHandlers} />
}
