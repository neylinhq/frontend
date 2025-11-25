import type { Edge as FlowEdge, Node as FlowNode } from '@xyflow/react'
import type { Edge, Node } from '@/entities/map'

export function transformNodesToFlow(
  nodes: Node[],
  selectedNodeIds: string[] = [],
  onSelect?: (id: string) => void
): FlowNode[] {
  return nodes.map(node => ({
    id: node.id,
    type: 'knowledgeNode',
    position: node.position,
    data: {
      ...node,
      selected: selectedNodeIds.includes(node.id),
      onSelect
    }
  }))
}

export function transformEdgesToFlow(
  edges: Edge[],
  selectedEdgeIds: string[] = []
): FlowEdge[] {
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
