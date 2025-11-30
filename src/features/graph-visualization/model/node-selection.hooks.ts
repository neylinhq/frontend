import type { Edge as FlowEdge, Node as FlowNode } from '@xyflow/react'
import { useCallback, useState } from 'react'
import type { SelectedElements } from './graph-visualization.types'

export const useNodeSelection = () => {
  const [selectedElements, setSelectedElements] = useState<SelectedElements>({
    nodes: [],
    edges: []
  })
  const [drawerNodeId, setDrawerNodeId] = useState<string | null>(null)

  const handleSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: FlowNode[]; edges: FlowEdge[] }) => {
      setSelectedElements({
        nodes: nodes.map(n => n.id),
        edges: edges.map(e => e.id)
      })
    },
    []
  )

  const clearSelection = useCallback(() => {
    setSelectedElements({ nodes: [], edges: [] })
    setDrawerNodeId(null)
  }, [])

  const selectNode = useCallback((nodeId: string) => {
    setDrawerNodeId(nodeId)
  }, [])

  return {
    selectedElements,
    handleSelectionChange,
    clearSelection,
    selectNode,
    selectedNodeId: drawerNodeId
  }
}

