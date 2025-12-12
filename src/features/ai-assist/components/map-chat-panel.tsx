import { useMap } from '@/entities/map'
import type { MapChatContext, NodeChatContext } from '../ai-assist.types'
import { AIChatCore } from './ai-chat-core'

interface MapChatPanelProps {
  mapId: string
}

export const MapChatPanel = ({ mapId }: MapChatPanelProps) => {
  const { data: map } = useMap(mapId)

  // For map-level chat, we create a minimal node context
  // The actual context switching happens in AIChatCore
  const nodeContext: NodeChatContext = {
    type: 'node',
    mapId,
    nodeId: '',
    nodeName: '',
    nodeType: '',
    description: '',
    tags: [],
    relatedNodes: []
  }

  const mapContext: MapChatContext = {
    type: 'map',
    mapId,
    mapName: map?.title || '',
    nodeCount: map?.nodesCount || 0
  }

  return (
    <AIChatCore
      nodeContext={nodeContext}
      mapContext={mapContext}
    />
  )
}
