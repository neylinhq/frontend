import { useMemo } from 'react'
import type { FullMap } from '@/entities/map'
import { getNodesWithinDepth } from '../lib/layout-algorithms-optimized'

interface UseFilteredGraphDataParams {
  fullMap: FullMap | null | undefined
  visibleNodeTypes: Set<string>
  visibleEdgeTypes: Set<string>
  viewMode: string
  focusedNodeId: string | null
  focusDepth: number
}

export const useFilteredGraphData = ({
  fullMap,
  visibleNodeTypes,
  visibleEdgeTypes,
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

  // Filter nodes based on visibility settings and focus mode
  const filteredData = useMemo(() => {
    if (!fullMap) {
      return { nodes: [], edges: [] }
    }

    // Start with type-filtered nodes
    let visibleNodes = fullMap.nodes.filter(node => visibleNodeTypes.has(node.type))

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
  }, [fullMap, visibleNodeTypes, visibleEdgeTypes, viewMode, focusedNodeId, focusDepth])

  return {
    filteredData,
    nodeCountsByType,
    edgeCountsByType
  }
}
