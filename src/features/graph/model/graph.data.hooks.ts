import { useMemo } from 'react'
import type { FullMap } from '@/entities/map'
import { getNodesWithinDepth } from '../lib/layout-algorithms-optimized'

export interface ConnectionStats {
  counts: Map<string, number> // nodeId → total connections count
  min: number
  max: number
}

interface UseFilteredGraphDataParams {
  fullMap: FullMap | null | undefined
  visibleNodeTypes: Set<string>
  visibleEdgeTypes: Set<string>
  connectionRange: [number, number]
  viewMode: string
  focusedNodeId: string | null
  focusDepth: number
}

export const useFilteredGraphData = ({
  fullMap,
  visibleNodeTypes,
  visibleEdgeTypes,
  connectionRange,
  viewMode,
  focusedNodeId,
  focusDepth
}: UseFilteredGraphDataParams) => {
  // Calculate counts by type for filters
  const { nodeCountsByType, edgeCountsByType } = useMemo(() => {
    if (!fullMap) {
      return { nodeCountsByType: {}, edgeCountsByType: {} }
    }

    const nodeCounts: Record<string, number> = {}
    const edgeCounts: Record<string, number> = {}

    for (const node of fullMap.nodes) {
      nodeCounts[node.type] = (nodeCounts[node.type] || 0) + 1
    }

    for (const edge of fullMap.edges) {
      edgeCounts[edge.relationType] = (edgeCounts[edge.relationType] || 0) + 1
    }

    return { nodeCountsByType: nodeCounts, edgeCountsByType: edgeCounts }
  }, [fullMap])

  // Calculate connection counts for each node - O(E) with memoization
  const connectionStats = useMemo<ConnectionStats>(() => {
    if (!fullMap) {
      return { counts: new Map(), min: 0, max: 0 }
    }

    const counts = new Map<string, number>()

    // Initialize all nodes with 0 (for isolated nodes)
    for (const node of fullMap.nodes) {
      counts.set(node.id, 0)
    }

    // Count connections from edges
    for (const edge of fullMap.edges) {
      counts.set(edge.sourceNodeId, (counts.get(edge.sourceNodeId) || 0) + 1)
      counts.set(edge.targetNodeId, (counts.get(edge.targetNodeId) || 0) + 1)
    }

    const values = Array.from(counts.values())
    return {
      counts,
      min: values.length > 0 ? Math.min(...values) : 0,
      max: values.length > 0 ? Math.max(...values) : 0
    }
  }, [fullMap])

  // Filter nodes based on visibility settings and focus mode
  const filteredData = useMemo(() => {
    if (!fullMap) {
      return { nodes: [], edges: [] }
    }

    // Start with type-filtered nodes
    let visibleNodes = fullMap.nodes.filter(node => visibleNodeTypes.has(node.type))

    // Filter by connection count
    const [minConn, maxConn] = connectionRange
    if (minConn !== 0 || maxConn !== Infinity) {
      visibleNodes = visibleNodes.filter(node => {
        const count = connectionStats.counts.get(node.id) ?? 0
        return count >= minConn && count <= maxConn
      })
    }

    // Filter edges by type
    let visibleEdges = fullMap.edges.filter(edge => visibleEdgeTypes.has(edge.relationType))

    // In focus mode, further filter to nodes within depth
    if (viewMode === 'focus' && focusedNodeId) {
      // Get flow edges for depth calculation
      const flowEdges = visibleEdges.map(e => ({
        id: e.id,
        source: e.sourceNodeId,
        target: e.targetNodeId
      }))

      const nodesInRange = getNodesWithinDepth(focusedNodeId, flowEdges, focusDepth)

      visibleNodes = visibleNodes.filter(n => nodesInRange.has(n.id))
      visibleEdges = visibleEdges.filter(
        e => nodesInRange.has(e.sourceNodeId) && nodesInRange.has(e.targetNodeId)
      )
    }

    return { nodes: visibleNodes, edges: visibleEdges }
  }, [fullMap, visibleNodeTypes, visibleEdgeTypes, connectionRange, connectionStats, viewMode, focusedNodeId, focusDepth])

  return {
    filteredData,
    nodeCountsByType,
    edgeCountsByType,
    connectionStats
  }
}
