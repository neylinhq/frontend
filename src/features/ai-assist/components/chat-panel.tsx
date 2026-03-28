import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

import type { RelationType } from '@/entities/edge'
import {
  mapKeys,
  useApplyGraphFragment,
  useCreateEdge,
  useCreateNode,
  useDeleteEdge,
  useDeleteNode,
  useFullMap,
  useMap,
  useNodeWithContent,
  useUpdateEdge,
  useUpdateNode
} from '@/entities/map'
import type { Node, NodeType } from '@/entities/node'
import { useNodes } from '@/entities/node'
// Storage format is now Markdown — no conversion needed
import {
  calculatePositionNearConnections,
  calculateSmartPosition
} from '@/shared/lib/smart-positioning'
import { toast } from '@/shared/components/toast'

import { getChatSessionId } from '../model/ai-assist.chat.store'
import { useProposalHistoryStore } from '../model/ai-assist.proposal.store'
import type {
  ConnectionPreviewData,
  EnrichmentPreviewData,
  GraphFragmentPreviewData,
  MapChatContext,
  NewNodePreviewData,
  NodeChatContext,
  PreviewCard,
  ResolvedPreview
} from '../model/ai-assist.types'
import { AIChatCore } from './ai-chat-core'

interface ChatPanelProps {
  scope: 'node' | 'map'
  mapId: string
  nodeId?: string
  sessionId?: string | null
}

export const ChatPanel = ({ scope, mapId, nodeId, sessionId: externalSessionId }: ChatPanelProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: node } = useNodeWithContent(mapId, scope === 'node' ? nodeId! : '')
  const { data: map } = useMap(mapId)
  const { data: fullMap } = useFullMap(mapId)
  const { data: allNodes = [] } = useNodes(mapId) as { data: Node[] | undefined }
  const updateNodeMutation = useUpdateNode(mapId)
  const createNodeMutation = useCreateNode(mapId)
  const createEdgeMutation = useCreateEdge(mapId)
  const updateEdgeMutation = useUpdateEdge(mapId)
  const applyFragmentMutation = useApplyGraphFragment(mapId)
  const deleteNodeMutation = useDeleteNode(mapId)
  const deleteEdgeMutation = useDeleteEdge(mapId)

  const recordAction = useProposalHistoryStore(s => s.recordAction)

  const nodeContext: NodeChatContext = {
    type: 'node',
    mapId,
    nodeId: nodeId || '',
    nodeName: (scope === 'node' ? node?.label : '') || '',
    nodeType: (scope === 'node' ? node?.type : '') || '',
    description: (scope === 'node' ? node?.content : '') || '',
    tags: (scope === 'node' ? node?.metadata?.tags : []) || [],
    relatedNodes: []
  }

  const mapContext: MapChatContext = {
    type: 'map',
    mapId,
    mapName: map?.title || '',
    nodeCount: map?.nodesCount || 0
  }

  const sessionId =
    externalSessionId || getChatSessionId(mapId, scope === 'node' ? nodeId! : undefined)

  // Helper: fuzzy search node by label
  const findNodeByLabel = (label: string) => {
    const labelLower = label.toLowerCase()
    return allNodes.find(
      n => n.label.toLowerCase() === labelLower || n.label.toLowerCase().includes(labelLower)
    )
  }

  // Calculate position for a new node
  const calculateNewNodePosition = (connectedNodeIds: string[]) => {
    if (scope === 'node') {
      // Node scope: use smart positioning near connections or focus node
      const flowNodes = allNodes.map(n => ({
        id: n.id,
        position: n.position,
        measured: { width: 220, height: 80 }
      })) as Parameters<typeof calculateSmartPosition>[0]['existingNodes']

      let position =
        connectedNodeIds.length > 0
          ? calculatePositionNearConnections(connectedNodeIds, flowNodes)
          : null

      if (!position) {
        const focusNode = allNodes.find(n => n.id === nodeId)
        const center = focusNode
          ? { x: focusNode.position.x + 300, y: focusNode.position.y }
          : { x: 0, y: 0 }
        position = calculateSmartPosition({ center, existingNodes: flowNodes })
      }

      return position
    }

    // Map scope: random position near center
    return {
      x: Math.random() * 200 - 100,
      y: Math.random() * 200 - 100
    }
  }

  // Calculate grid positions for graph fragment nodes
  const calculateFragmentPositions = (nodeCount: number) => {
    const cols = Math.ceil(Math.sqrt(nodeCount))
    const spacing = 250
    const jitter = 30

    // For node scope, offset from focus node; for map scope, center at origin
    let centerX = 0
    let centerY = 0
    if (scope === 'node') {
      const focusNode = allNodes.find(n => n.id === nodeId)
      centerX = focusNode ? focusNode.position.x + 300 : 0
      centerY = focusNode ? focusNode.position.y : 0
    }

    return { cols, spacing, jitter, centerX, centerY }
  }

  const handleSavePreview = async (messageId: string, previewCard: PreviewCard) => {
    // Enrichment — only available in node scope
    if (previewCard.type === 'enrichment' && scope === 'node') {
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
          updatePayload.content = node?.content
            ? `${node.content}\n\n---\n\n${data.proposed}`
            : data.proposed
          break
      }

      await updateNodeMutation.mutateAsync({ id: nodeId!, data: updatePayload })

      const actionId = recordAction({
        type: 'apply',
        previewId: previewCard.id,
        messageId,
        sessionId,
        entityType: 'node',
        entityId: nodeId!,
        previousState,
        newState: updatePayload
      })

      toast.success(t('ai.enrichment.saved', 'Changes saved'))
      return { previousState, actionId }
    }

    if (previewCard.type === 'new_node') {
      const data = previewCard.data as NewNodePreviewData

      // Check if node was already created (after Undo→Accept)
      if (data.appliedNodeId) {
        const previousState = {
          createdNodeId: data.appliedNodeId,
          createdEdgeIds: data.appliedEdgeIds || []
        }
        if (scope === 'node') {
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
        return { previousState, actionId: '' }
      }

      // 1. Calculate position
      const connectedNodeIds =
        data.connectTo
          ?.map(conn => findNodeByLabel(conn.nodeLabel)?.id)
          .filter((id): id is string => !!id) || []

      const position = calculateNewNodePosition(connectedNodeIds)

      // 2. Create node
      const newNode = await createNodeMutation.mutateAsync({
        label: data.label,
        type: data.nodeType as NodeType,
        description: data.description,
        content: data.content ?? '',
        position
      })

      // 3. Create connections
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

      const previousState = { createdNodeId: newNode.id, createdEdgeIds }

      if (scope === 'node') {
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
      }

      toast.success(t('ai.node.created', 'Node created'))
      return { previousState, actionId: '' }
    }

    if (previewCard.type === 'connection') {
      const data = previewCard.data as ConnectionPreviewData

      // Check if edge was already created (after Undo→Accept)
      if (data.appliedEdgeId) {
        const previousState = { createdEdgeId: data.appliedEdgeId }
        if (scope === 'node') {
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
        return { previousState, actionId: '' }
      }

      const sourceNode = findNodeByLabel(data.fromLabel)
      const targetNode = findNodeByLabel(data.toLabel)

      if (!sourceNode || !targetNode) {
        toast.error(t('ai.connection.nodesNotFound', 'Could not find nodes'))
        return
      }

      // Map scope: check for existing edge and update instead of creating duplicate
      if (scope === 'map') {
        const existingEdge = fullMap?.edges?.find(
          e =>
            (e.sourceNodeId === sourceNode.id && e.targetNodeId === targetNode.id) ||
            (e.sourceNodeId === targetNode.id && e.targetNodeId === sourceNode.id)
        )

        if (existingEdge) {
          await updateEdgeMutation.mutateAsync({
            id: existingEdge.id,
            data: { relationType: data.relation as RelationType }
          })
          toast.success(t('ai.connection.updated', 'Connection updated'))
          return { previousState: { createdEdgeId: existingEdge.id }, actionId: '' }
        }
      }

      const edge = await createEdgeMutation.mutateAsync({
        sourceNodeId: sourceNode.id,
        targetNodeId: targetNode.id,
        relationType: scope === 'map' ? (data.relation as RelationType) : data.relation
      })

      const previousState = { createdEdgeId: edge?.id }

      if (scope === 'node') {
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
      }

      toast.success(t('ai.connection.created', 'Connection created'))
      return { previousState, actionId: '' }
    }

    if (previewCard.type === 'graph_fragment') {
      const data = previewCard.data as GraphFragmentPreviewData

      // Check if already applied (re-apply after undo)
      const alreadyApplied =
        data.nodes.some(n => n.appliedNodeId) || data.edges.some(e => e.appliedEdgeId)
      if (alreadyApplied) {
        const tempIdMapping: Record<string, string> = {}
        for (const n of data.nodes) {
          if (n.appliedNodeId) {
            tempIdMapping[n.tempId] = n.appliedNodeId
          }
        }
        return {
          previousState: {
            tempIdMapping,
            createdEdgeIds: data.edges.filter(e => e.appliedEdgeId).map(e => e.appliedEdgeId!)
          },
          actionId: ''
        }
      }

      const { cols, spacing, jitter, centerX, centerY } = calculateFragmentPositions(
        data.nodes.length
      )
      const nodeCount = data.nodes.length

      const nodes = data.nodes.map((node, idx) => {
        const col = idx % cols
        const row = Math.floor(idx / cols)
        const offsetX = ((cols - 1) * spacing) / 2
        const offsetY = ((Math.ceil(nodeCount / cols) - 1) * spacing) / 2
        return {
          tempId: node.tempId,
          label: node.label,
          type: node.nodeType,
          description: node.description,
          content: node.content ?? '',
          positionX: centerX + col * spacing - offsetX + (Math.random() * jitter * 2 - jitter),
          positionY: centerY + row * spacing - offsetY + (Math.random() * jitter * 2 - jitter)
        }
      })

      const edges = data.edges.map(edge => ({
        fromRef: edge.fromRef,
        toRef: edge.toRef,
        fromIsNew: edge.fromIsNew,
        toIsNew: edge.toIsNew,
        relationType: edge.relation
      }))

      const result = await applyFragmentMutation.mutateAsync({ nodes, edges })

      const nodesCreated = result.createdNodes.length
      const edgesCreated = result.createdEdges.length

      if (nodesCreated > 0 && edgesCreated > 0) {
        toast.success(
          t('ai.graphFragment.applied', 'Created {{nodes}} nodes and {{edges}} connections', {
            nodes: nodesCreated,
            edges: edgesCreated
          })
        )
      } else if (nodesCreated > 0) {
        toast.success(
          t('ai.node.createdMultiple', 'Created {{count}} nodes', { count: nodesCreated })
        )
      } else if (edgesCreated > 0) {
        toast.success(
          t('ai.connection.createdMultiple', 'Created {{count}} connections', {
            count: edgesCreated
          })
        )
      }

      return {
        previousState: {
          tempIdMapping: result.tempIdMapping,
          createdEdgeIds: result.createdEdges.map(e => e.id)
        },
        actionId: ''
      }
    }

    if (previewCard.type === 'exercise') {
      toast.success(t('ai.exercises.saved'), {
        description: t('ai.exercises.savedDescription')
      })
    }
  }

  // Undo — only available in node scope
  const handleUndoPreview = scope === 'node'
    ? async (preview: ResolvedPreview) => {
        if (!preview.undoData) return

        const { previousState } = preview.undoData

        if (preview.type === 'enrichment') {
          await updateNodeMutation.mutateAsync({
            id: nodeId!,
            data: previousState as Record<string, string>
          })
        } else if (preview.type === 'new_node') {
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
          const createdNodeId = previousState.createdNodeId as string | undefined
          if (createdNodeId) {
            await deleteNodeMutation.mutateAsync(createdNodeId)
          }
        } else if (preview.type === 'connection') {
          const createdEdgeId = previousState.createdEdgeId as string | undefined
          if (createdEdgeId) {
            await deleteEdgeMutation.mutateAsync(createdEdgeId)
          }
        }
      }
    : undefined

  // Handle reject of preview that was previously applied
  const handleRejectAppliedPreview = async (preview: PreviewCard) => {
    if (preview.type === 'graph_fragment') {
      const data = preview.data as GraphFragmentPreviewData
      // Delete edges first (to avoid foreign key issues)
      for (const edge of data.edges) {
        if (edge.appliedEdgeId) {
          await deleteEdgeMutation.mutateAsync(edge.appliedEdgeId)
        }
      }
      // Then delete nodes
      for (const graphNode of data.nodes) {
        if (graphNode.appliedNodeId) {
          await deleteNodeMutation.mutateAsync(graphNode.appliedNodeId)
        }
      }
    } else if (preview.type === 'new_node') {
      const data = preview.data as NewNodePreviewData
      if (data.appliedEdgeIds && data.appliedEdgeIds.length > 0) {
        for (const edgeId of data.appliedEdgeIds) {
          try {
            await deleteEdgeMutation.mutateAsync(edgeId)
          } catch {
            // Edge might already be deleted, ignore
          }
        }
      }
      if (data.appliedNodeId) {
        await deleteNodeMutation.mutateAsync(data.appliedNodeId)
      }
    } else if (preview.type === 'connection') {
      const data = preview.data as ConnectionPreviewData
      if (data.appliedEdgeId) {
        await deleteEdgeMutation.mutateAsync(data.appliedEdgeId)
      }
    }

    // For map scope: force refresh map data after deletions
    if (scope === 'map') {
      await queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
      await queryClient.invalidateQueries({ queryKey: mapKeys.mapNodes(mapId) })
      await queryClient.invalidateQueries({ queryKey: mapKeys.mapEdges(mapId) })
    }
  }

  // Map scope: don't render if no session selected
  if (scope === 'map' && !externalSessionId) {
    return (
      <div className='flex h-full items-center justify-center text-muted-foreground'>
        {t('ai.chat.selectOrCreate', 'Select or create a chat to get started')}
      </div>
    )
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
      {...(scope === 'map' && {
        emptyStateMessage: t('ai.chat.noMessagesMap'),
        placeholderText: t('ai.chat.placeholderMap', 'Ask about this map...')
      })}
    />
  )
}
