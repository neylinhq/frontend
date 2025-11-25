import type { Node, Edge } from '@xyflow/react'
import type { FilterState } from '../store/graph-view-store'
import type { NodeData } from '@/entities/node'

/**
 * Apply filters to nodes and return filtered set
 */
export function filterNodes(nodes: Node<NodeData>[], filters: FilterState): Node<NodeData>[] {
  return nodes.filter((node) => {
    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const matchesTitle = node.data.title?.toLowerCase().includes(query)
      const matchesDescription = node.data.description?.toLowerCase().includes(query)
      if (!matchesTitle && !matchesDescription) {
        return false
      }
    }

    // Node type filter
    if (filters.visibleNodeTypes.size > 0) {
      if (!node.data.type || !filters.visibleNodeTypes.has(node.data.type)) {
        return false
      }
    }

    // Confidence filter
    const confidence = node.data.confidence ?? 100
    if (confidence < filters.minConfidence || confidence > filters.maxConfidence) {
      return false
    }

    return true
  })
}

/**
 * Apply edge filters
 */
export function filterEdges(edges: Edge[], filters: FilterState): Edge[] {
  return edges.filter((edge) => {
    // Edge type filter
    const edgeType = edge.data?.type
    if (edgeType && !filters.visibleEdgeTypes.has(edgeType)) {
      return false
    }

    return true
  })
}

/**
 * Apply focus mode - show only nodes within N hops of focused node
 */
export function applyFocusMode(
  nodes: Node<NodeData>[],
  edges: Edge[],
  focusNodeId: string,
  depth: number
): { visibleNodeIds: Set<string>; visibleEdgeIds: Set<string> } {
  const visibleNodeIds = new Set<string>([focusNodeId])
  const visibleEdgeIds = new Set<string>()

  // Build adjacency list
  const adjacency = new Map<string, string[]>()
  for (const edge of edges) {
    if (!adjacency.has(edge.source)) {
      adjacency.set(edge.source, [])
    }
    if (!adjacency.has(edge.target)) {
      adjacency.set(edge.target, [])
    }
    adjacency.get(edge.source)!.push(edge.target)
    adjacency.get(edge.target)!.push(edge.source)
  }

  // BFS to find nodes within depth
  const queue: [string, number][] = [[focusNodeId, 0]]
  const visited = new Set<string>([focusNodeId])

  while (queue.length > 0) {
    const [currentId, currentDepth] = queue.shift()!

    if (currentDepth >= depth) continue

    const neighbors = adjacency.get(currentId) || []
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        visited.add(neighborId)
        visibleNodeIds.add(neighborId)
        queue.push([neighborId, currentDepth + 1])
      }
    }
  }

  // Add edges between visible nodes
  for (const edge of edges) {
    if (visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)) {
      visibleEdgeIds.add(edge.id)
    }
  }

  return { visibleNodeIds, visibleEdgeIds }
}

/**
 * Apply all filters to nodes and edges
 */
export function applyAllFilters(
  nodes: Node<NodeData>[],
  edges: Edge[],
  filters: FilterState
): { filteredNodes: Node<NodeData>[]; filteredEdges: Edge[] } {
  let filteredNodes = [...nodes]
  let filteredEdges = [...edges]

  // Apply basic filters
  filteredNodes = filterNodes(filteredNodes, filters)
  filteredEdges = filterEdges(filteredEdges, filters)

  // Apply focus mode
  if (filters.focusNodeId && filters.focusDepth !== null) {
    const { visibleNodeIds, visibleEdgeIds } = applyFocusMode(
      filteredNodes,
      filteredEdges,
      filters.focusNodeId,
      filters.focusDepth
    )
    filteredNodes = filteredNodes.filter((node) => visibleNodeIds.has(node.id))
    filteredEdges = filteredEdges.filter((edge) => visibleEdgeIds.has(edge.id))
  }

  // Remove isolated nodes if needed
  if (!filters.showIsolated) {
    const connectedNodes = new Set<string>()
    for (const edge of filteredEdges) {
      connectedNodes.add(edge.source)
      connectedNodes.add(edge.target)
    }
    filteredNodes = filteredNodes.filter((node) => connectedNodes.has(node.id))
  }

  return { filteredNodes, filteredEdges }
}
