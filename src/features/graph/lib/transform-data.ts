import type { Edge, Node } from '@/entities/map'

export const transformNodesToFlow = (
  nodes: Node[],
  selectedNodeIds: string[] = [],
  onSelect?: (id: string) => void,
  focusedNodeId?: string | null,
  animated?: boolean
) => {
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

export const transformEdgesToFlow = (edges: Edge[], selectedEdgeIds: string[] = []) => {
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
