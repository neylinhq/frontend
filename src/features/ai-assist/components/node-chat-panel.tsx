import { useTranslation } from 'react-i18next'

// Storage format is now Markdown — no conversion needed
import {
  calculatePositionNearConnections,
  calculateSmartPosition
} from '@/features/node-creation/lib/smart-positioning'
import {
  useCreateEdge,
  useCreateNode,
  useDeleteEdge,
  useDeleteNode,
  useMap,
  useNodeWithContent,
  useUpdateNode
} from '@/entities/map'
import type { Node } from '@/entities/node'
import { useNodes } from '@/entities/node'
import { toast } from '@/shared/components/toast'

import { getChatSessionId } from '../model/ai-assist.chat.store'
import { useProposalHistoryStore } from '../model/ai-assist.proposal.store'
import type {
  ConnectionPreviewData,
  EnrichmentPreviewData,
  MapChatContext,
  NewNodePreviewData,
  NodeChatContext,
  PreviewCard,
  ResolvedPreview
} from '../model/ai-assist.types'
import { AIChatCore } from './ai-chat-core'

interface NodeChatPanelProps {
  nodeId: string
  mapId: string
  sessionId?: string
}

export const NodeChatPanel = ({
  nodeId,
  mapId,
  sessionId: externalSessionId
}: NodeChatPanelProps) => {
  const { t } = useTranslation()
  const { data: node } = useNodeWithContent(mapId, nodeId)
  const { data: map } = useMap(mapId)
  const { data: allNodes = [] } = useNodes(mapId) as { data: Node[] | undefined }
  const updateNodeMutation = useUpdateNode(mapId)
  const createNodeMutation = useCreateNode(mapId)
  const createEdgeMutation = useCreateEdge(mapId)
  const deleteNodeMutation = useDeleteNode(mapId)
  const deleteEdgeMutation = useDeleteEdge(mapId)

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

  const sessionId = externalSessionId || getChatSessionId(mapId, nodeId)

  // Helper: fuzzy search node by label
  const findNodeByLabel = (label: string) => {
    const labelLower = label.toLowerCase()
    return allNodes.find(
      n => n.label.toLowerCase() === labelLower || n.label.toLowerCase().includes(labelLower)
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
      // AI returns markdown, storage is now also markdown — no conversion
      const updatePayload: Record<string, string> = {}
      switch (data.field) {
        case 'description':
          updatePayload.description = data.proposed
          break
        case 'content':
          updatePayload.content = data.proposed
          break
        default:
          // For examples/sources, append to content with markdown separator
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

      // Check if node was already created (after Undo→Accept)
      if (data.appliedNodeId) {
        // Node already exists, just return the existing IDs
        const previousState = {
          createdNodeId: data.appliedNodeId,
          createdEdgeIds: data.appliedEdgeIds || []
        }
        const actionId = recordAction({
          type: 'apply',
          previewId: previewCard.id,
          messageId,
          sessionId,
          entityType: 'node',
          entityId: data.appliedNodeId,
          previousState,
          newState: { label: data.label, type: data.nodeType }
        })
        toast.success(t('ai.node.restored', 'Node restored'))
        return { previousState, actionId }
      }

      // 1. Calculate smart position for new node
      // Convert Node[] to FlowNode-compatible format for positioning
      // Cast is safe because calculateSmartPosition only uses id, position, and measured fields
      const flowNodes = allNodes.map(n => ({
        id: n.id,
        position: n.position,
        measured: { width: 220, height: 80 }
      })) as Parameters<typeof calculateSmartPosition>[0]['existingNodes']

      // Find connected node IDs for positioning near them
      const connectedNodeIds =
        data.connectTo
          ?.map(conn => findNodeByLabel(conn.nodeLabel)?.id)
          .filter((id): id is string => !!id) || []

      // Calculate position - near connections if any, otherwise near current focus node
      let position =
        connectedNodeIds.length > 0
          ? calculatePositionNearConnections(connectedNodeIds, flowNodes)
          : null

      if (!position) {
        // Fallback: position near current focus node
        const focusNode = allNodes.find(n => n.id === nodeId)
        const center = focusNode
          ? { x: focusNode.position.x + 300, y: focusNode.position.y }
          : { x: 0, y: 0 }
        position = calculateSmartPosition({ center, existingNodes: flowNodes })
      }

      // 2. Create node with calculated position
      const newNode = await createNodeMutation.mutateAsync({
        label: data.label,
        type: data.nodeType as Node['type'],
        description: data.description,
        content: data.content ?? '',
        position
      })

      // 3. Create connections (if suggested) and collect their IDs for undo
      const createdEdgeIds: string[] = []
      if (data.connectTo && data.connectTo.length > 0) {
        for (const conn of data.connectTo) {
          const targetNode = findNodeByLabel(conn.nodeLabel)
          if (targetNode) {
            const edge = await createEdgeMutation.mutateAsync({
              sourceNodeId: newNode.id,
              targetNodeId: targetNode.id,
              relationType: conn.relation
            })
            if (edge?.id) {
              createdEdgeIds.push(edge.id)
            }
          }
        }
      }

      // Record action for undo with created entity IDs
      const previousState = { createdNodeId: newNode.id, createdEdgeIds }
      const actionId = recordAction({
        type: 'apply',
        previewId: previewCard.id,
        messageId,
        sessionId,
        entityType: 'node',
        entityId: newNode.id,
        previousState,
        newState: { label: data.label, type: data.nodeType }
      })

      toast.success(t('ai.node.created', 'Node created'))
      return { previousState, actionId }
    } else if (previewCard.type === 'connection') {
      const data = previewCard.data as ConnectionPreviewData

      // Check if edge was already created (after Undo→Accept)
      if (data.appliedEdgeId) {
        const previousState = { createdEdgeId: data.appliedEdgeId }
        const actionId = recordAction({
          type: 'apply',
          previewId: previewCard.id,
          messageId,
          sessionId,
          entityType: 'edge',
          entityId: data.appliedEdgeId,
          previousState,
          newState: { relation: data.relation }
        })
        toast.success(t('ai.connection.restored', 'Connection restored'))
        return { previousState, actionId }
      }

      const sourceNode = findNodeByLabel(data.fromLabel)
      const targetNode = findNodeByLabel(data.toLabel)

      if (!sourceNode || !targetNode) {
        toast.error(t('ai.connection.nodesNotFound', 'Could not find nodes'))
        return
      }

      const edge = await createEdgeMutation.mutateAsync({
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        relationType: data.relation
      })

      // Record action for undo with created edge ID
      const previousState = { createdEdgeId: edge?.id }
      const actionId = recordAction({
        type: 'apply',
        previewId: previewCard.id,
        messageId,
        sessionId,
        entityType: 'edge',
        entityId: edge?.id || '',
        previousState,
        newState: {
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
          relation: data.relation
        }
      })

      toast.success(t('ai.connection.created', 'Connection created'))
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

    if (preview.type === 'enrichment') {
      // Revert the node to previous state
      await updateNodeMutation.mutateAsync({
        id: nodeId,
        data: previousState as Record<string, string>
      })
    } else if (preview.type === 'new_node') {
      // Delete created edges first (if any), then delete the node
      const createdEdgeIds = previousState.createdEdgeIds as string[] | undefined
      if (createdEdgeIds && createdEdgeIds.length > 0) {
        for (const edgeId of createdEdgeIds) {
          try {
            await deleteEdgeMutation.mutateAsync(edgeId)
          } catch {
            // Edge might already be deleted when node is deleted, ignore
          }
        }
      }
      // Delete the created node
      const createdNodeId = previousState.createdNodeId as string | undefined
      if (createdNodeId) {
        await deleteNodeMutation.mutateAsync(createdNodeId)
      }
    } else if (preview.type === 'connection') {
      // Delete the created edge
      const createdEdgeId = previousState.createdEdgeId as string | undefined
      if (createdEdgeId) {
        await deleteEdgeMutation.mutateAsync(createdEdgeId)
      }
    }
  }

  // Handle reject of preview that was previously applied (after Undo)
  const handleRejectAppliedPreview = async (preview: PreviewCard) => {
    if (preview.type === 'new_node') {
      const data = preview.data as NewNodePreviewData
      // Delete edges first
      if (data.appliedEdgeIds && data.appliedEdgeIds.length > 0) {
        for (const edgeId of data.appliedEdgeIds) {
          try {
            await deleteEdgeMutation.mutateAsync(edgeId)
          } catch {
            // Edge might already be deleted, ignore
          }
        }
      }
      // Delete node
      if (data.appliedNodeId) {
        await deleteNodeMutation.mutateAsync(data.appliedNodeId)
      }
    } else if (preview.type === 'connection') {
      const data = preview.data as ConnectionPreviewData
      if (data.appliedEdgeId) {
        await deleteEdgeMutation.mutateAsync(data.appliedEdgeId)
      }
    }
  }

  return (
    <AIChatCore
      key={sessionId}
      nodeContext={nodeContext}
      mapContext={mapContext}
      sessionId={sessionId}
      onSavePreview={handleSavePreview}
      onUndoPreview={handleUndoPreview}
      onRejectAppliedPreview={handleRejectAppliedPreview}
    />
  )
}
