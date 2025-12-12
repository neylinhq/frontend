import { useTranslation } from 'react-i18next'
import { useMap } from '@/entities/map'
import { useNode, useUpdateNode } from '@/entities/node'
import { toast } from '@/shared/components/toast'
import type { EnrichmentPreviewData, MapChatContext, NodeChatContext, PreviewCard } from '../ai-assist.types'
import { AIChatCore } from './ai-chat-core'

interface NodeChatPanelProps {
  nodeId: string
  mapId: string
}

export const NodeChatPanel = ({ nodeId, mapId }: NodeChatPanelProps) => {
  const { t } = useTranslation()
  const { data: node } = useNode(mapId, nodeId)
  const { data: map } = useMap(mapId)
  const updateNodeMutation = useUpdateNode(mapId, nodeId)

  const nodeContext: NodeChatContext = {
    type: 'node',
    mapId,
    nodeId,
    nodeName: node?.label || '',
    nodeType: node?.type || '',
    description: node?.content || '',
    tags: node?.metadata?.tags || [],
    relatedNodes: []
  }

  const mapContext: MapChatContext = {
    type: 'map',
    mapId,
    mapName: map?.title || '',
    nodeCount: map?.nodeCount || 0
  }

  const handleSavePreview = async (_messageId: string, previewCard: PreviewCard) => {
    if (previewCard.type === 'enrichment') {
      const data = previewCard.data as EnrichmentPreviewData

      // Map field to node property
      const updatePayload: Record<string, string> = {}
      switch (data.field) {
        case 'description':
          updatePayload.description = data.proposed
          break
        case 'content':
          updatePayload.content = data.proposed
          break
        case 'examples':
        case 'sources':
        default:
          // For examples/sources, append to content
          updatePayload.content = node?.content
            ? `${node.content}\n\n---\n\n${data.proposed}`
            : data.proposed
          break
      }

      await updateNodeMutation.mutateAsync(updatePayload)

      toast.success(t('ai.enrichment.saved'), {
        description: t('ai.enrichment.savedDescription')
      })
    } else if (previewCard.type === 'exercise') {
      // Exercises are already saved during generation
      toast.success(t('ai.exercises.saved'), {
        description: t('ai.exercises.savedDescription')
      })
    }
  }

  return (
    <AIChatCore
      nodeContext={nodeContext}
      mapContext={mapContext}
      onSavePreview={handleSavePreview}
    />
  )
}
