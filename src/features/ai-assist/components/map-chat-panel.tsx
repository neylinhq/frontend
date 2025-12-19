import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { mapKeys, useApplyGraphFragment, useCreateEdge, useCreateNode, useDeleteEdge, useDeleteNode, useFullMap, useMap, useUpdateEdge } from '@/entities/map'
import type { Node, NodeType } from '@/entities/node'
import { useNodes } from '@/entities/node'
import type { RelationType } from '@/entities/edge'
import { toHtml } from '@/features/editor-converter'
import { toast } from '@/shared/components/toast'
import type {
  ConnectionPreviewData,
  GraphFragmentPreviewData,
  MapChatContext,
  NewNodePreviewData,
  NodeChatContext,
  PreviewCard
} from '../model/ai-assist.types'
import { AIChatCore } from './ai-chat-core'

interface MapChatPanelProps {
  mapId: string
  sessionId?: string | null
}

export const MapChatPanel = ({ mapId, sessionId }: MapChatPanelProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: map } = useMap(mapId)
  const { data: fullMap } = useFullMap(mapId)
  const { data: allNodes = [] } = useNodes(mapId) as { data: Node[] | undefined }
  const createNodeMutation = useCreateNode(mapId)
  const createEdgeMutation = useCreateEdge(mapId)
  const updateEdgeMutation = useUpdateEdge(mapId)
  const applyFragmentMutation = useApplyGraphFragment(mapId)
  const deleteNodeMutation = useDeleteNode(mapId)
  const deleteEdgeMutation = useDeleteEdge(mapId)

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
    if (previewCard.type === 'graph_fragment') {
      const data = previewCard.data as GraphFragmentPreviewData

      // Check if already applied (re-apply after undo) - skip creation
      const alreadyApplied = data.nodes.some(n => n.appliedNodeId) || data.edges.some(e => e.appliedEdgeId)
      if (alreadyApplied) {
        // Already created, just return existing IDs
        const tempIdMapping: Record<string, string> = {}
        for (const node of data.nodes) {
          if (node.appliedNodeId) {
            tempIdMapping[node.tempId] = node.appliedNodeId
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

      const result = await applyGraphFragment(data)
      // Return created IDs so they can be stored for rejection/undo
      // Use tempIdMapping for nodes and createdEdges for edges
      return {
        previousState: {
          tempIdMapping: result.tempIdMapping,
          createdEdgeIds: result.createdEdges.map(e => e.id)
        },
        actionId: ''
      }
    } else if (previewCard.type === 'new_node') {
      const data = previewCard.data as NewNodePreviewData

      // Check if already applied (re-apply after undo) - skip creation
      if (data.appliedNodeId) {
        // Already created, just return existing IDs
        return {
          previousState: {
            createdNodeId: data.appliedNodeId,
            createdEdgeIds: data.appliedEdgeIds
          },
          actionId: ''
        }
      }

      // 1. Create node (with random position near center)
      // AI returns markdown for content — convert to HTML for storage
      const newNode = await createNodeMutation.mutateAsync({
        label: data.label,
        type: data.nodeType as NodeType,
        description: data.description,
        content: data.content ? toHtml(data.content) : '',
        position: {
          x: Math.random() * 200 - 100,
          y: Math.random() * 200 - 100
        }
      })

      // 2. Create connections (if suggested)
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
            createdEdgeIds.push(edge.id)
          }
        }
      }

      toast.success(t('ai.node.created', 'Node created'))
      return {
        previousState: {
          createdNodeId: newNode.id,
          createdEdgeIds
        },
        actionId: ''
      }
    } else if (previewCard.type === 'connection') {
      const data = previewCard.data as ConnectionPreviewData

      // Check if already applied (re-apply after undo) - skip creation
      if (data.appliedEdgeId) {
        // Already created, just return existing ID
        return {
          previousState: {
            createdEdgeId: data.appliedEdgeId
          },
          actionId: ''
        }
      }

      const sourceNode = findNodeByLabel(data.fromLabel)
      const targetNode = findNodeByLabel(data.toLabel)

      if (!sourceNode || !targetNode) {
        toast.error(t('ai.connection.nodesNotFound', 'Could not find nodes'))
        return
      }

      // Check if edge already exists between these nodes
      const existingEdge = fullMap?.edges?.find(
        e =>
          (e.sourceNodeId === sourceNode.id && e.targetNodeId === targetNode.id) ||
          (e.sourceNodeId === targetNode.id && e.targetNodeId === sourceNode.id)
      )

      if (existingEdge) {
        // Update existing edge with new relation type
        await updateEdgeMutation.mutateAsync({
          id: existingEdge.id,
          data: { relationType: data.relation as RelationType }
        })
        toast.success(t('ai.connection.updated', 'Connection updated'))
        return {
          previousState: {
            createdEdgeId: existingEdge.id
          },
          actionId: ''
        }
      } else {
        // Create new edge
        const edge = await createEdgeMutation.mutateAsync({
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
          relationType: data.relation as RelationType
        })
        toast.success(t('ai.connection.created', 'Connection created'))
        return {
          previousState: {
            createdEdgeId: edge.id
          },
          actionId: ''
        }
      }
    }
  }

  // Apply graph fragment using batch API
  const applyGraphFragment = async (data: GraphFragmentPreviewData) => {
    // Calculate grid layout for nodes to avoid overlapping
    // Use a grid with spacing, plus small random offset for visual variety
    const nodeCount = data.nodes.length
    const cols = Math.ceil(Math.sqrt(nodeCount))
    const spacing = 250 // Distance between nodes in grid
    const jitter = 30 // Random offset for natural look

    // Convert to API format with grid positions
    // AI returns markdown for content — convert to HTML for storage
    const nodes = data.nodes.map((node, idx) => {
      const col = idx % cols
      const row = Math.floor(idx / cols)
      // Center the grid around origin
      const offsetX = ((cols - 1) * spacing) / 2
      const offsetY = ((Math.ceil(nodeCount / cols) - 1) * spacing) / 2
      return {
        tempId: node.tempId,
        label: node.label,
        type: node.nodeType,
        description: node.description,
        content: node.content ? toHtml(node.content) : '',
        positionX: col * spacing - offsetX + (Math.random() * jitter * 2 - jitter),
        positionY: row * spacing - offsetY + (Math.random() * jitter * 2 - jitter)
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
      toast.success(t('ai.graphFragment.applied', 'Created {{nodes}} nodes and {{edges}} connections', {
        nodes: nodesCreated,
        edges: edgesCreated
      }))
    } else if (nodesCreated > 0) {
      toast.success(t('ai.node.createdMultiple', 'Created {{count}} nodes', { count: nodesCreated }))
    } else if (edgesCreated > 0) {
      toast.success(t('ai.connection.createdMultiple', 'Created {{count}} connections', { count: edgesCreated }))
    }

    return result
  }

  // Handle rejection of applied previews (delete created entities)
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
      for (const node of data.nodes) {
        if (node.appliedNodeId) {
          await deleteNodeMutation.mutateAsync(node.appliedNodeId)
        }
      }
    } else if (preview.type === 'new_node') {
      const data = preview.data as NewNodePreviewData
      if (data.appliedNodeId) {
        // Delete edges first
        if (data.appliedEdgeIds) {
          for (const edgeId of data.appliedEdgeIds) {
            await deleteEdgeMutation.mutateAsync(edgeId)
          }
        }
        await deleteNodeMutation.mutateAsync(data.appliedNodeId)
      }
    } else if (preview.type === 'connection') {
      const data = preview.data as ConnectionPreviewData
      if (data.appliedEdgeId) {
        await deleteEdgeMutation.mutateAsync(data.appliedEdgeId)
      }
    }

    // Force refresh map data after deletions
    await queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(mapId) })
    await queryClient.invalidateQueries({ queryKey: mapKeys.mapNodes(mapId) })
    await queryClient.invalidateQueries({ queryKey: mapKeys.mapEdges(mapId) })
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

  // Don't render if no session selected
  if (!sessionId) {
    return (
      <div className='flex h-full items-center justify-center text-muted-foreground'>
        {t('ai.chat.selectOrCreate', 'Select or create a chat to get started')}
      </div>
    )
  }

  return (
    <div className='h-full'>
      <AIChatCore
        key={sessionId} // Reset component state when session changes
        nodeContext={nodeContext}
        mapContext={mapContext}
        sessionId={sessionId}
        onSavePreview={handleSavePreview}
        onRejectAppliedPreview={handleRejectAppliedPreview}
        emptyStateMessage={t('ai.chat.noMessagesMap')}
        placeholderText={t('ai.chat.placeholderMap', 'Ask about this map...')}
      />
    </div>
  )
}
