import type { Edge, Node } from '@/entities/map'

export const transformNodesToFlow = (
  nodes: Node[],
  selectedNodeIds: Set<string> | string[] = [],
  onSelect?: (id: string) => void,
  focusedNodeId?: string | null,
  animated?: boolean
) => {
  // Convert to Set for O(1) lookup if array passed
  const selectedSet = selectedNodeIds instanceof Set
    ? selectedNodeIds
    : new Set(selectedNodeIds)

  return nodes.map(node => ({
    id: node.id,
    type: 'knowledgeNode',
    position: node.position,
    data: {
      ...node,
      selected: selectedSet.has(node.id),
      isFocused: focusedNodeId === node.id,
      onSelect
    },
    // Smooth transition when layout changes
    style: animated ? { transition: 'transform 0.3s ease-out' } : undefined
  }))
}

export const transformEdgesToFlow = (edges: Edge[], selectedEdgeIds: Set<string> | string[] = []) => {
  // Convert to Set for O(1) lookup if array passed
  const selectedSet = selectedEdgeIds instanceof Set
    ? selectedEdgeIds
    : new Set(selectedEdgeIds)

  return edges.map(edge => ({
    id: edge.id,
    type: 'knowledgeEdge',
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    data: {
      ...edge,
      selected: selectedSet.has(edge.id)
    }
  }))
}
