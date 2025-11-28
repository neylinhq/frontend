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
  useViewport
} from '@xyflow/react'
import { Loader2 } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type FullMap, useFullMap } from '@/entities/map'
import {
  applyLayout,
  getNodesWithinDepth,
  layoutEvent,
  useFilters,
  useFocusMode,
  useGraphKeyboard,
  useGraphUI,
  useNodeSpacing,
  useViewMode
} from '@/features/graph-view'
import { NodeDrawer } from '@/features/node-drawer'
import { cn } from '@/shared/lib/cn'
import { Card } from '@/shared/ui/card'
import { transformEdgesToFlow, transformNodesToFlow } from '../lib/transform-data'
import { easeOutCubic, useAnimatedLayout } from '../lib/use-animated-layout'
import { useGraphControls } from '../model/graph-controls.hooks'
import { useNodeSelection } from '../model/node-selection.hooks'
import { GraphToolbar } from './graph-toolbar'
import { KnowledgeEdge } from './knowledge-edge'
import { KnowledgeNode } from './knowledge-node'
import { ViewControlsPanel } from './view-controls-panel'

const nodeTypes = {
  knowledgeNode: KnowledgeNode
}

const edgeTypes = {
  knowledgeEdge: KnowledgeEdge
}

interface GraphVisualizationProps {
  mapId: string
  className?: string
  interactive?: boolean
  initialData?: FullMap
}

function GraphVisualizationContent({
  mapId,
  className,
  interactive = true,
  initialData
}: GraphVisualizationProps) {
  const { t } = useTranslation()
  // Use initialData if provided (SSR), otherwise fetch client-side
  const { data: fetchedMap, isLoading, isError } = useFullMap(mapId, { enabled: !initialData })
  const fullMap = initialData ?? fetchedMap
  const { selectedElements, handleSelectionChange, clearSelection, selectedNodeId, selectNode } =
    useNodeSelection()
  const { controls, toggleFullscreen } = useGraphControls()
  const layoutAppliedRef = useRef(false)

  const { zoomIn, zoomOut, fitView, setCenter, getNode, screenToFlowPosition } = useReactFlow()
  const { zoom: viewportZoom } = useViewport()

  // Pan to a specific node
  const handlePanToNode = useCallback(
    (nodeId: string) => {
      const node = getNode(nodeId)
      if (node) {
        const x = node.position.x + (node.measured?.width ?? 200) / 2
        const y = node.position.y + (node.measured?.height ?? 100) / 2
        setCenter(x, y, { zoom: viewportZoom, duration: 300 })
      }
    },
    [getNode, setCenter, viewportZoom]
  )

  // Store hooks for view settings
  const { viewMode } = useViewMode()
  const { focusedNodeId, focusDepth, focusNode } = useFocusMode()
  const { visibleNodeTypes, visibleEdgeTypes } = useFilters()
  const { showMinimap } = useGraphUI()
  const { nodeSpacing, directionStrength, animationDuration } = useNodeSpacing()
  const { animateToPositions } = useAnimatedLayout()

  // Track dark mode for theme-aware styling
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Use refs for layout params to avoid stale closures when triggerLayout fires
  const layoutParamsRef = useRef({
    nodeSpacing,
    viewMode,
    focusedNodeId,
    directionStrength,
    animationDuration
  })
  layoutParamsRef.current = {
    nodeSpacing,
    viewMode,
    focusedNodeId,
    directionStrength,
    animationDuration
  }

  // Calculate counts by type for filters
  const { nodeCountsByType, edgeCountsByType } = useMemo(() => {
    if (!fullMap) return { nodeCountsByType: {}, edgeCountsByType: {} }

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
    if (!fullMap) return { nodes: [], edges: [] }

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

  // Find the node closest to the viewport center
  const getClosestNodeToViewportCenter = useCallback(() => {
    if (reactFlowNodes.length === 0) return null

    // Get viewport center in screen coordinates and convert to flow coordinates
    const centerScreenX = window.innerWidth / 2
    const centerScreenY = window.innerHeight / 2
    const centerInFlow = screenToFlowPosition({ x: centerScreenX, y: centerScreenY })

    let closestNodeId: string | null = null
    let minDist = Infinity

    for (const node of reactFlowNodes) {
      const nodeCenterX = node.position.x + (node.measured?.width ?? 200) / 2
      const nodeCenterY = node.position.y + (node.measured?.height ?? 100) / 2
      const dist = Math.hypot(centerInFlow.x - nodeCenterX, centerInFlow.y - nodeCenterY)
      if (dist < minDist) {
        minDist = dist
        closestNodeId = node.id
      }
    }

    return closestNodeId
  }, [reactFlowNodes, screenToFlowPosition])

  // Apply auto-layout function - uses ref to get latest params when triggered by store events
  const doApplyLayout = useCallback(
    (shouldFitView = true, anchorNodeId?: string | null, animated = false) => {
      if (reactFlowNodes.length === 0) return

      const params = layoutParamsRef.current
      const result = applyLayout(reactFlowNodes, reactFlowEdges, {
        viewMode: params.viewMode,
        focusedNodeId: params.focusedNodeId,
        spacingPercent: params.nodeSpacing,
        directionStrength: params.directionStrength
      })

      if (animated) {
        // Smooth animation with synchronized camera
        const duration = layoutParamsRef.current.animationDuration
        animateToPositions(reactFlowNodes, result.nodes, anchorNodeId ?? null, {
          duration,
          easing: easeOutCubic
        })
        // If no anchor but need to fit view, do it after animation completes
        if (!anchorNodeId && shouldFitView) {
          setTimeout(() => fitView({ padding: 0.2, duration: 300 }), duration + 50)
        }
      } else {
        // Instant update
        setNodes(result.nodes)
        if (anchorNodeId) {
          const anchorNode = result.nodes.find(n => n.id === anchorNodeId)
          if (anchorNode) {
            const x = anchorNode.position.x + (anchorNode.measured?.width ?? 200) / 2
            const y = anchorNode.position.y + (anchorNode.measured?.height ?? 100) / 2
            setCenter(x, y, { zoom: viewportZoom, duration: 300 })
          }
        } else if (shouldFitView) {
          fitView({ padding: 0.2, duration: 300 })
        }
      }
    },
    [reactFlowNodes, reactFlowEdges, setNodes, fitView, setCenter, viewportZoom, animateToPositions]
  )

  // Apply initial auto-layout when nodes are first loaded
  useEffect(() => {
    if (!layoutAppliedRef.current && initialNodes.length > 0 && fullMap) {
      layoutAppliedRef.current = true
      // Apply layout on initial load
      const result = applyLayout(initialNodes, initialEdges, {
        viewMode,
        focusedNodeId,
        spacingPercent: nodeSpacing,
        directionStrength
      })
      setNodes(result.nodes)
    }
  }, [
    initialNodes.length,
    fullMap,
    initialNodes,
    initialEdges,
    viewMode,
    focusedNodeId,
    nodeSpacing,
    directionStrength,
    setNodes
  ])

  // Listen for layout events from the store
  useEffect(() => {
    const handleLayoutEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        fitView?: boolean
        anchorToCenter?: boolean
        animated?: boolean
      }>
      const shouldFitView = customEvent.detail?.fitView ?? true
      const anchorToCenter = customEvent.detail?.anchorToCenter ?? false
      const animated = customEvent.detail?.animated ?? false

      const anchorNodeId = anchorToCenter ? getClosestNodeToViewportCenter() : null
      doApplyLayout(shouldFitView, anchorNodeId, animated)
    }

    layoutEvent.addEventListener('layout', handleLayoutEvent)
    return () => layoutEvent.removeEventListener('layout', handleLayoutEvent)
  }, [doApplyLayout, getClosestNodeToViewportCenter])

  // Sync nodes when filtered data changes
  const prevNodeIdsRef = useRef<string>('')
  useEffect(() => {
    const nodeIds = initialNodes
      .map(n => n.id)
      .sort()
      .join(',')
    if (prevNodeIdsRef.current !== nodeIds) {
      if (prevNodeIdsRef.current !== '') {
        // Nodes changed - apply layout for new set with animation
        const result = applyLayout(initialNodes, initialEdges, {
          viewMode,
          focusedNodeId,
          spacingPercent: nodeSpacing,
          directionStrength
        })
        // Animate to new positions
        animateToPositions(reactFlowNodes, result.nodes, null, {
          duration: animationDuration,
          easing: easeOutCubic
        })
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), animationDuration + 50)
      }
      prevNodeIdsRef.current = nodeIds
    }
  }, [
    initialNodes,
    initialEdges,
    viewMode,
    focusedNodeId,
    nodeSpacing,
    directionStrength,
    animationDuration,
    reactFlowNodes,
    animateToPositions,
    fitView
  ])

  // Sync edges when data changes
  const prevEdgeIdsRef = useRef<string>('')
  useEffect(() => {
    const edgeIds = initialEdges
      .map(e => e.id)
      .sort()
      .join(',')
    if (prevEdgeIdsRef.current !== edgeIds) {
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
    enabled: interactive
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
      setEdges(eds => addEdge({ ...params, type: 'knowledgeEdge' }, eds))
    },
    [setEdges, interactive]
  )

  // Zoom handlers - use ReactFlow's built-in zoom
  const handleZoomIn = useCallback(() => {
    zoomIn()
  }, [zoomIn])

  const handleZoomOut = useCallback(() => {
    zoomOut()
  }, [zoomOut])

  const handleCenter = useCallback(() => {
    if (reactFlowNodes.length === 0) {
      fitView({ padding: 0.2, duration: 300 })
      return
    }

    // Calculate geometric center of all nodes (canvas center)
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity
    for (const node of reactFlowNodes) {
      const w = node.measured?.width ?? 200
      const h = node.measured?.height ?? 100
      minX = Math.min(minX, node.position.x)
      maxX = Math.max(maxX, node.position.x + w)
      minY = Math.min(minY, node.position.y)
      maxY = Math.max(maxY, node.position.y + h)
    }
    const canvasCenterX = (minX + maxX) / 2
    const canvasCenterY = (minY + maxY) / 2

    // Find node closest to canvas center
    let closestNodeId: string | null = null
    let minDist = Infinity
    for (const node of reactFlowNodes) {
      const nodeCenterX = node.position.x + (node.measured?.width ?? 200) / 2
      const nodeCenterY = node.position.y + (node.measured?.height ?? 100) / 2
      const dist = Math.hypot(canvasCenterX - nodeCenterX, canvasCenterY - nodeCenterY)
      if (dist < minDist) {
        minDist = dist
        closestNodeId = node.id
      }
    }

    if (closestNodeId) {
      const node = getNode(closestNodeId)
      if (node) {
        const x = node.position.x + (node.measured?.width ?? 200) / 2
        const y = node.position.y + (node.measured?.height ?? 100) / 2
        setCenter(x, y, { zoom: viewportZoom, duration: 300 })
        return
      }
    }

    fitView({ padding: 0.2, duration: 300 })
  }, [reactFlowNodes, getNode, setCenter, viewportZoom, fitView])

  // Show loading only when fetching client-side (no initialData)
  if (!initialData && isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-[600px]', className)}>
        <div className='text-center space-y-3'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto text-primary' />
          <p className='text-sm text-muted-foreground'>{t('graph.loading')}</p>
        </div>
      </div>
    )
  }

  if (!initialData && (isError || !fullMap)) {
    return (
      <div className={cn('flex items-center justify-center h-[600px]', className)}>
        <Card className='p-8 text-center'>
          <p className='text-lg font-semibold text-destructive mb-2'>{t('graph.loadingError')}</p>
          <p className='text-muted-foreground'>{t('graph.loadingErrorMessage')}</p>
        </Card>
      </div>
    )
  }

  // At this point fullMap is guaranteed to be defined (either from initialData or fetchedMap)
  if (!fullMap) return null

  const selectedNode = fullMap.nodes.find(n => n.id === selectedNodeId) || null

  return (
    <div
      className={cn(
        'relative bg-background',
        controls.isFullscreen
          ? 'fixed inset-0 z-50 !w-screen !h-screen rounded-none border-0'
          : 'h-full w-full rounded-lg border',
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
        onNodeClick={(_event, node) => handleNodeClick(node.id)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className='bg-background'
        nodesDraggable={interactive}
        nodesConnectable={interactive}
        elementsSelectable={interactive}
        panOnDrag={interactive}
        zoomOnScroll={interactive}
        snapToGrid={interactive}
        snapGrid={[15, 15]}
        proOptions={{ hideAttribution: true }}
      >
        <Background color={isDark ? '#2e2e2e' : '#e2e8f0'} size={1} />

        {showMinimap && (
          <MiniMap
            nodeColor={node => {
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
            style={{
              backgroundColor: isDark ? '#171717' : '#f8fafc'
            }}
            maskColor={isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.1)'}
            pannable
            zoomable
            onClick={(_event, position) =>
              setCenter(position.x, position.y, { zoom: viewportZoom, duration: 200 })
            }
          />
        )}
      </ReactFlow>

      {/* View controls panel - top left */}
      <ViewControlsPanel
        zoom={Math.round(viewportZoom * 100)}
        isFullscreen={controls.isFullscreen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleCenter}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Toolbar - view modes, focus controls, filters */}
      <GraphToolbar
        mapId={mapId}
        nodeCountsByType={nodeCountsByType}
        edgeCountsByType={edgeCountsByType}
      />

      {/* Node drawer */}
      <NodeDrawer
        node={selectedNode}
        edges={fullMap.edges}
        nodes={fullMap.nodes}
        onClose={clearSelection}
        onSelectNode={selectNode}
        onPanToNode={handlePanToNode}
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
