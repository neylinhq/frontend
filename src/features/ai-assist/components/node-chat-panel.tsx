import { useTranslation } from 'react-i18next'
import { useCreateEdge, useCreateNode, useMap, useNodeWithContent, useUpdateNode } from '@/entities/map'
import { useNodes } from '@/entities/node'
import { toast } from '@/shared/components/toast'
import type {
  ConnectionPreviewData,
  EnrichmentPreviewData,
  MapChatContext,
  NewNodePreviewData,
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
  const { data: allNodes = [] } = useNodes(mapId)
  const updateNodeMutation = useUpdateNode(mapId)
  const createNodeMutation = useCreateNode(mapId)
  const createEdgeMutation = useCreateEdge(mapId)

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
    } else if (previewCard.type === 'new_node') {
      const data = previewCard.data as NewNodePreviewData

      // 1. Create node
      const newNode = await createNodeMutation.mutateAsync({
        label: data.label,
        type: data.nodeType,
        description: data.description,
        content: data.content || ''
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
