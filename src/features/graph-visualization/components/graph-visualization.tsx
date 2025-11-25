import '@xyflow/react/dist/style.css'
import {
  addEdge,
  Background,
  type Connection,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import { Loader2 } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useFullMap } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { Card } from '@/shared/ui/card'
import { transformEdgesToFlow, transformNodesToFlow } from '../lib/transform-data'
import { useGraphControls } from '../model/graph-controls.hooks'
import { useNodeSelection } from '../model/node-selection.hooks'
import { NodeDrawer } from '@/features/node-drawer'
import { GraphToolbar } from './graph-toolbar'
import { KnowledgeEdge } from './knowledge-edge'
import { KnowledgeNode } from './knowledge-node'
import {
  layoutEvent,
  applyLayout,
  getNodesWithinDepth,
  useGraphKeyboard,
  useViewMode,
  useFocusMode,
  useFilters,
  useGraphUI,
} from '@/features/graph-view'

const nodeTypes = {
  knowledgeNode: KnowledgeNode,
}

const edgeTypes = {
  knowledgeEdge: KnowledgeEdge,
}

interface GraphVisualizationProps {
  mapId: string
  className?: string
  interactive?: boolean
}

function GraphVisualizationContent({
  mapId,
  className,
  interactive = true,
}: GraphVisualizationProps) {
  const { t } = useTranslation()
  const { data: fullMap, isLoading, isError } = useFullMap(mapId)
  const { selectedElements, handleSelectionChange, clearSelection, selectedNodeId, selectNode } =
    useNodeSelection()
  const { controls, setZoom, toggleFullscreen } = useGraphControls()
  const layoutAppliedRef = useRef(false)

  const { zoomIn, zoomOut, fitView } = useReactFlow()

  // Store hooks for view settings
  const { viewMode } = useViewMode()
  const { focusedNodeId, focusDepth, focusNode } = useFocusMode()
  const { visibleNodeTypes, visibleEdgeTypes } = useFilters()
  const { showMinimap } = useGraphUI()

  // Filter nodes based on visibility settings and focus mode
  const filteredData = useMemo(() => {
    if (!fullMap) return { nodes: [], edges: [] }

    // Start with type-filtered nodes
    let visibleNodes = fullMap.nodes.filter((node) =>
      visibleNodeTypes.has(node.type)
    )

    // Filter edges by type
    let visibleEdges = fullMap.edges.filter((edge) =>
      visibleEdgeTypes.has(edge.relationType)
    )

    // In focus mode, further filter to nodes within depth
    if (viewMode === 'focus' && focusedNodeId) {
      // Get flow edges for depth calculation
      const flowEdges = visibleEdges.map((e) => ({
        id: e.id,
        source: e.sourceNodeId,
        target: e.targetNodeId,
      }))

      const nodesInRange = getNodesWithinDepth(focusedNodeId, flowEdges, focusDepth)

      visibleNodes = visibleNodes.filter((n) => nodesInRange.has(n.id))
      visibleEdges = visibleEdges.filter(
        (e) => nodesInRange.has(e.sourceNodeId) && nodesInRange.has(e.targetNodeId)
      )
    }

    return { nodes: visibleNodes, edges: visibleEdges }
  }, [fullMap, visibleNodeTypes, visibleEdgeTypes, viewMode, focusedNodeId, focusDepth])

  // Handle node click - in focus mode, focus on clicked node
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      if (viewMode === 'focus') {
        focusNode(nodeId)
      }
      selectNode(nodeId)
    },
    [viewMode, focusNode, selectNode]
  )

  // Transform nodes for XYFlow
  const initialNodes = useMemo(() => {
    return transformNodesToFlow(
      filteredData.nodes,
      selectedElements.nodes,
      handleNodeClick,
      focusedNodeId
    )
  }, [filteredData.nodes, selectedElements.nodes, handleNodeClick, focusedNodeId])

  // Transform edges for XYFlow
  const initialEdges = useMemo(() => {
    return transformEdgesToFlow(filteredData.edges, selectedElements.edges)
  }, [filteredData.edges, selectedElements.edges])

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Apply auto-layout function
  const doApplyLayout = useCallback(() => {
    if (reactFlowNodes.length === 0) return

    const result = applyLayout(reactFlowNodes, reactFlowEdges, {
      viewMode,
      focusedNodeId,
    })

    setNodes(result.nodes)
    // Fit view after layout with a small delay for animations
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50)
  }, [reactFlowNodes, reactFlowEdges, viewMode, focusedNodeId, setNodes, fitView])

  // Apply initial auto-layout when nodes are first loaded
  useEffect(() => {
    if (!layoutAppliedRef.current && initialNodes.length > 0 && fullMap) {
      layoutAppliedRef.current = true
      // Apply layout on initial load
      const result = applyLayout(initialNodes, initialEdges, {
        viewMode,
        focusedNodeId,
      })
      setNodes(result.nodes)
    }
  }, [initialNodes.length, fullMap, initialNodes, initialEdges, viewMode, focusedNodeId, setNodes])

  // Listen for layout events from the store
  useEffect(() => {
    const handleLayoutEvent = () => {
      doApplyLayout()
    }

    layoutEvent.addEventListener('layout', handleLayoutEvent)
    return () => layoutEvent.removeEventListener('layout', handleLayoutEvent)
  }, [doApplyLayout])

  // Sync nodes when filtered data changes
  const prevNodeIdsRef = useRef<string>('')
  useEffect(() => {
    const nodeIds = initialNodes.map((n) => n.id).sort().join(',')
    if (prevNodeIdsRef.current !== nodeIds) {
      if (prevNodeIdsRef.current !== '') {
        // Nodes changed - apply layout for new set
        const result = applyLayout(initialNodes, initialEdges, {
          viewMode,
          focusedNodeId,
        })
        setNodes(result.nodes)
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50)
      }
      prevNodeIdsRef.current = nodeIds
    }
  }, [initialNodes, initialEdges, viewMode, focusedNodeId, setNodes, fitView])

  // Sync edges when data changes
  const prevEdgeIdsRef = useRef<string>('')
  useEffect(() => {
    const edgeIds = initialEdges.map((e) => e.id).sort().join(',')
    if (prevEdgeIdsRef.current !== edgeIds && prevEdgeIdsRef.current !== '') {
      setEdges(initialEdges)
    }
    prevEdgeIdsRef.current = edgeIds
  }, [initialEdges, setEdges])

  // Keyboard shortcuts
  useGraphKeyboard({
    selectedNodeId,
    onFitView: () => fitView({ padding: 0.2, duration: 300 }),
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    enabled: interactive,
  })

  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: any) => {
      if (!interactive) return
      onNodesChange(changes)
    },
    [onNodesChange, interactive]
  )

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: any) => {
      if (!interactive) return
      onEdgesChange(changes)
    },
    [onEdgesChange, interactive]
  )

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      if (!interactive) return
      setEdges((eds) => addEdge({ ...params, type: 'knowledgeEdge' }, eds))
    },
    [setEdges, interactive]
  )

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    zoomIn()
    setZoom(controls.zoom + 10)
  }, [zoomIn, setZoom, controls.zoom])

  const handleZoomOut = useCallback(() => {
    zoomOut()
    setZoom(Math.max(10, controls.zoom - 10))
  }, [zoomOut, setZoom, controls.zoom])

  const handleCenter = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 })
  }, [fitView])

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-[600px]', className)}>
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">{t('graph.loading')}</p>
        </div>
      </div>
    )
  }

  if (isError || !fullMap) {
    return (
      <div className={cn('flex items-center justify-center h-[600px]', className)}>
        <Card className="p-8 text-center">
          <p className="text-lg font-semibold text-destructive mb-2">{t('graph.loadingError')}</p>
          <p className="text-muted-foreground">{t('graph.loadingErrorMessage')}</p>
        </Card>
      </div>
    )
  }

  const selectedNode = fullMap.nodes.find((n) => n.id === selectedNodeId) || null

  return (
    <div
      className={cn(
        'relative bg-background rounded-lg border h-full w-full',
        controls.isFullscreen && 'fixed inset-4 z-50',
        className
      )}
    >
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-background"
        nodesDraggable={interactive}
        nodesConnectable={interactive}
        elementsSelectable={interactive}
        panOnDrag={interactive}
        zoomOnScroll={interactive}
        snapToGrid={interactive}
        snapGrid={[15, 15]}
      >
        <Background color="#e2e8f0" size={1} />

        {showMinimap && (
          <MiniMap
            nodeColor={(node) => {
              switch (node.data?.type) {
                case 'concept':
                  return '#3b82f6'
                case 'theory':
                  return '#8b5cf6'
                case 'fact':
                  return '#10b981'
                default:
                  return '#64748b'
              }
            }}
            maskColor="rgb(0, 0, 0, 0.1)"
          />
        )}
      </ReactFlow>

      {/* Toolbar */}
      <GraphToolbar
        zoom={controls.zoom}
        isFullscreen={controls.isFullscreen}
        mapId={mapId}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleCenter}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Node drawer */}
      <NodeDrawer
        node={selectedNode}
        edges={fullMap.edges}
        nodes={fullMap.nodes}
        onClose={clearSelection}
      />
    </div>
  )
}

export const GraphVisualization = memo((props: GraphVisualizationProps) => {
  return (
    <ReactFlowProvider>
      <GraphVisualizationContent {...props} />
    </ReactFlowProvider>
  )
})

GraphVisualization.displayName = 'GraphVisualization'
