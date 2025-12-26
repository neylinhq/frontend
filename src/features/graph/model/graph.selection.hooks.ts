import type { Edge as FlowEdge, Node as FlowNode } from '@xyflow/react'
import { useCallback, useState } from 'react'
import type { SelectedElements } from './graph-visualization.types'

export const useNodeSelection = () => {
  const [selectedElements, setSelectedElements] = useState<SelectedElements>({
    nodes: [],
    edges: []
  })
  const [drawerNodeId, setDrawerNodeIdState] = useState<string | null>(null)

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
    setDrawerNodeIdState(null)
  }, [])

  const selectNode = useCallback((nodeId: string) => {
    setDrawerNodeIdState(nodeId)
  }, [])

  const setSelection = useCallback((nodes: string[], edges: string[] = []) => {
    setSelectedElements({ nodes, edges })
  }, [])

  const setDrawerNodeId = useCallback((nodeId: string | null) => {
    setDrawerNodeIdState(nodeId)
  }, [])

  return {
    selectedElements,
    handleSelectionChange,
    clearSelection,
    selectNode,
    setSelection,
    setDrawerNodeId,
    selectedNodeId: drawerNodeId
  }
}
