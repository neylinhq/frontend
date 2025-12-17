import { useTranslation } from 'react-i18next'
import { useApplyGraphFragment, useCreateEdge, useCreateNode, useFullMap, useMap, useUpdateEdge } from '@/entities/map'
import type { Node, NodeType } from '@/entities/node'
import { useNodes } from '@/entities/node'
import type { RelationType } from '@/entities/edge'
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
  const { data: map } = useMap(mapId)
  const { data: fullMap } = useFullMap(mapId)
  const { data: allNodes = [] } = useNodes(mapId) as { data: Node[] | undefined }
  const createNodeMutation = useCreateNode(mapId)
  const createEdgeMutation = useCreateEdge(mapId)
  const updateEdgeMutation = useUpdateEdge(mapId)
  const applyFragmentMutation = useApplyGraphFragment(mapId)

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
      await applyGraphFragment(data)
      return { previousState: {}, actionId: '' }
    } else if (previewCard.type === 'new_node') {
      const data = previewCard.data as NewNodePreviewData

      // 1. Create node (with random position near center)
      const newNode = await createNodeMutation.mutateAsync({
        label: data.label,
        type: data.nodeType as NodeType,
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
      } else {
        // Create new edge
        await createEdgeMutation.mutateAsync({
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
          relationType: data.relation as RelationType
        })
        toast.success(t('ai.connection.created', 'Connection created'))
      }

      return { previousState: {}, actionId: '' }
    }
  }

  // Apply graph fragment using batch API
  const applyGraphFragment = async (data: GraphFragmentPreviewData) => {
    // Convert to API format
    const nodes = data.nodes.map(node => ({
      tempId: node.tempId,
      label: node.label,
      type: node.nodeType,
      description: node.description,
      content: node.content || '',
      positionX: Math.random() * 300 - 150,
      positionY: Math.random() * 300 - 150
    }))

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
        emptyStateMessage={t('ai.chat.noMessagesMap')}
        placeholderText={t('ai.chat.placeholderMap', 'Ask about this map...')}
      />
    </div>
  )
}
