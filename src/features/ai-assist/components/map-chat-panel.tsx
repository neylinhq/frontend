import { useTranslation } from 'react-i18next'
import { useCreateEdge, useCreateNode, useMap } from '@/entities/map'
import { useNodes } from '@/entities/node'
import { toast } from '@/shared/components/toast'
import type {
  ConnectionPreviewData,
  MapChatContext,
  NewNodePreviewData,
  NodeChatContext,
  PreviewCard
} from '../model/ai-assist.types'
import { AIChatCore } from './ai-chat-core'

interface MapChatPanelProps {
  mapId: string
}

export const MapChatPanel = ({ mapId }: MapChatPanelProps) => {
  const { t } = useTranslation()
  const { data: map } = useMap(mapId)
  const { data: allNodes = [] } = useNodes(mapId)
  const createNodeMutation = useCreateNode(mapId)
  const createEdgeMutation = useCreateEdge(mapId)

  // Helper: fuzzy search node by label
  const findNodeByLabel = (label: string) => {
    const labelLower = label.toLowerCase()
    return allNodes.find(
      n =>
        n.label.toLowerCase() === labelLower ||
        n.label.toLowerCase().includes(labelLower)
    )
  }

  const handleSavePreview = async (messageId: string, previewCard: PreviewCard) => {
    if (previewCard.type === 'new_node') {
      const data = previewCard.data as NewNodePreviewData

      // 1. Create node (with random position near center)
      const newNode = await createNodeMutation.mutateAsync({
        label: data.label,
        type: data.nodeType,
        description: data.description,
        content: data.content || '',
        position: {
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100
        }
      })

      // 2. Create connections (if suggested)
      if (data.connectTo && data.connectTo.length > 0) {
        for (const conn of data.connectTo) {
          const targetNode = findNodeByLabel(conn.nodeLabel)
          if (targetNode) {
            await createEdgeMutation.mutateAsync({
              sourceNodeId: newNode.id,
              targetNodeId: targetNode.id,
              relationType: conn.relation
            })
          }
        }
      }

      toast.success(t('ai.node.created', 'Node created'))
      return { previousState: {}, actionId: '' }
    } else if (previewCard.type === 'connection') {
      const data = previewCard.data as ConnectionPreviewData

      const sourceNode = findNodeByLabel(data.fromLabel)
      const targetNode = findNodeByLabel(data.toLabel)

      if (!sourceNode || !targetNode) {
        toast.error(t('ai.connection.nodesNotFound', 'Could not find nodes'))
        return
      }

      await createEdgeMutation.mutateAsync({
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        relationType: data.relation
      })

      toast.success(t('ai.connection.created', 'Connection created'))
      return { previousState: {}, actionId: '' }
    }
  }

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
      onSavePreview={handleSavePreview}
      emptyStateMessage={t('ai.chat.noMessagesMap')}
      placeholderText={t('ai.chat.placeholderMap', 'Ask about this map...')}
    />
  )
}
