import { useCallback, useMemo, useState } from 'react'
import type { Edge } from '@/entities/edge'

export type ConnectionFilterType = 'all' | 'incoming' | 'outgoing'

export function useConnectionFilter(nodeId: string, edges: Edge[]) {
  const [filter, setFilter] = useState<ConnectionFilterType>('all')

  const incomingEdges = useMemo(() => {
    return edges.filter((e) => e.targetNodeId === nodeId)
  }, [edges, nodeId])

  const outgoingEdges = useMemo(() => {
    return edges.filter((e) => e.sourceNodeId === nodeId)
  }, [edges, nodeId])

  const filteredEdges = useMemo(() => {
    switch (filter) {
      case 'incoming':
        return incomingEdges
      case 'outgoing':
        return outgoingEdges
      default:
        return [...incomingEdges, ...outgoingEdges]
    }
  }, [filter, incomingEdges, outgoingEdges])

  const changeFilter = useCallback((newFilter: ConnectionFilterType) => {
    setFilter(newFilter)
  }, [])

  return {
    filter,
    changeFilter,
    filteredEdges,
    incomingCount: incomingEdges.length,
    outgoingCount: outgoingEdges.length,
    totalCount: incomingEdges.length + outgoingEdges.length
  }
}
