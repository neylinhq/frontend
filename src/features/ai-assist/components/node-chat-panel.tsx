import { useTranslation } from 'react-i18next'
import { useMap, useNodeWithContent, useUpdateNode } from '@/entities/map'
import { toast } from '@/shared/components/toast'
import type {
  EnrichmentPreviewData,
  MapChatContext,
  NodeChatContext,
  PreviewCard,
  ResolvedPreview
} from '../model/ai-assist.types'
import { getChatSessionId } from '../model/ai-assist.chat.store'
import { useProposalHistoryStore } from '../model/ai-assist.proposal.store'
import { AIChatCore } from './ai-chat-core'

interface NodeChatPanelProps {
  nodeId: string
  mapId: string
}

export const NodeChatPanel = ({ nodeId, mapId }: NodeChatPanelProps) => {
  const { t } = useTranslation()
  const { data: node } = useNodeWithContent(mapId, nodeId)
  const { data: map } = useMap(mapId)
  const updateNodeMutation = useUpdateNode(mapId)

  const recordAction = useProposalHistoryStore(s => s.recordAction)

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
    nodeCount: map?.nodesCount || 0
  }

  const sessionId = getChatSessionId(mapId, nodeId)

  const handleSavePreview = async (messageId: string, previewCard: PreviewCard) => {
    if (previewCard.type === 'enrichment') {
      const data = previewCard.data as EnrichmentPreviewData

      // Capture previous state for undo
      const previousState: Record<string, unknown> = {}
      switch (data.field) {
        case 'description':
          previousState.description = node?.description || ''
          break
        case 'content':
          previousState.content = node?.content || ''
          break
        default:
          previousState.content = node?.content || ''
          break
      }

      // Map field to node property
      const updatePayload: Record<string, string> = {}
      switch (data.field) {
        case 'description':
          updatePayload.description = data.proposed
          break
        case 'content':
          updatePayload.content = data.proposed
          break
        default:
          // For examples/sources, append to content
          updatePayload.content = node?.content
            ? `${node.content}\n\n---\n\n${data.proposed}`
            : data.proposed
          break
      }

      await updateNodeMutation.mutateAsync({ id: nodeId, data: updatePayload })

      // Record action for undo
      const actionId = recordAction({
        type: 'apply',
        previewId: previewCard.id,
        messageId,
        sessionId,
        entityType: 'node',
        entityId: nodeId,
        previousState,
        newState: updatePayload
      })

      toast.success(t('ai.enrichment.saved', 'Changes saved'))

      return { previousState, actionId }
    } else if (previewCard.type === 'exercise') {
      // Exercises are already saved during generation
      toast.success(t('ai.exercises.saved'), {
        description: t('ai.exercises.savedDescription')
      })
    }
  }

  const handleUndoPreview = async (preview: ResolvedPreview) => {
    if (!preview.undoData) {
      return
    }

    const { previousState } = preview.undoData

    // Revert the node to previous state
    await updateNodeMutation.mutateAsync({
      id: nodeId,
      data: previousState as Record<string, string>
    })
  }

  return (
    <AIChatCore
      nodeContext={nodeContext}
      mapContext={mapContext}
      showContextSwitch
      onSavePreview={handleSavePreview}
      onUndoPreview={handleUndoPreview}
    />
  )
}
