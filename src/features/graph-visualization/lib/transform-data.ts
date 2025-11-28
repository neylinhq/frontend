import type { Edge as FlowEdge, Node as FlowNode } from '@xyflow/react'
import type { Edge, Node } from '@/entities/map'

export function transformNodesToFlow(
  nodes: Node[],
  selectedNodeIds: string[] = [],
  onSelect?: (id: string) => void,
  focusedNodeId?: string | null,
  animated?: boolean
): FlowNode[] {
  return nodes.map(node => ({
    id: node.id,
    type: 'knowledgeNode',
    position: node.position,
    data: {
      ...node,
      selected: selectedNodeIds.includes(node.id),
      isFocused: focusedNodeId === node.id,
      onSelect
    },
    // Smooth transition when layout changes
    style: animated ? { transition: 'transform 0.3s ease-out' } : undefined
  }))
}

export function transformEdgesToFlow(edges: Edge[], selectedEdgeIds: string[] = []): FlowEdge[] {
  return edges.map(edge => ({
    id: edge.id,
    type: 'knowledgeEdge',
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    data: {
      ...edge,
      selected: selectedEdgeIds.includes(edge.id)
    }
  }))
}
