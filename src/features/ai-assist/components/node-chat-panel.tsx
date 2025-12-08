import { useTranslation } from 'react-i18next'
import { useNode, useUpdateNode } from '@/entities/node'
import { useToast } from '@/shared/components/toast'
import type { EnrichmentPreviewData, NodeChatContext, PreviewCard } from '../ai-assist.types'
import { nodeIntentHandlers } from '../lib/node-intent-handlers'
import { AIChatCore } from './ai-chat-core'

interface NodeChatPanelProps {
  nodeId: string
  mapId: string
}

export const NodeChatPanel = ({ nodeId, mapId }: NodeChatPanelProps) => {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { data: node } = useNode(mapId, nodeId)
  const updateNodeMutation = useUpdateNode(mapId, nodeId)

  const context: NodeChatContext = {
    type: 'node',
    mapId,
    nodeId,
    nodeName: node?.label || '',
    nodeType: node?.type || '',
    description: node?.content || '',
    tags: node?.metadata?.tags || [],
    relatedNodes: []
  }

  const handleSavePreview = async (_messageId: string, previewCard: PreviewCard) => {
    if (previewCard.type === 'enrichment') {
      const data = previewCard.data as EnrichmentPreviewData
      await updateNodeMutation.mutateAsync({
        content: data.proposed
      })

      toast({
        title: t('ai.enrichment.saved'),
        description: t('ai.enrichment.savedDescription')
      })
    } else if (previewCard.type === 'exercise') {
      // Exercises are already saved during generation
      toast({
        title: t('ai.exercises.saved'),
        description: t('ai.exercises.savedDescription')
      })
    }
  }

  return (
    <AIChatCore
      context={context}
      intentHandlers={nodeIntentHandlers}
      onSavePreview={handleSavePreview}
    />
  )
}
