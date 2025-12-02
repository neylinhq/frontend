import '@xyflow/react/dist/style.css'
import {
  addEdge,
  Background,
  type Connection,
  type EdgeChange,
  MiniMap,
  type NodeChange,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useViewport
} from '@xyflow/react'
import { Loader2 } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type Edge,
  type FullMap,
  type Node,
  useFullMap,
  useUpdateNodePosition,
  useUpdateNodePositions
} from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { NodeDrawer } from './node-drawer'
import { useDarkMode } from '@/shared/hooks'
import { Card } from '@/shared/components/card'
import { applyLayout } from '../lib/layout-algorithms-optimized'
import { transformEdgesToFlow, transformNodesToFlow } from '../lib/transform-data'
import {
  layoutEvent,
  useFilters,
  useFocusMode,
  useGraphUI,
  useNodeSpacing,
  useViewMode
} from '../model/graph.store'
import { useLayoutHistory } from '../model/layout-history.store'
import { useGraphControls } from '../model/graph-controls.hooks'
import { useFilteredGraphData } from '../model/graph-data.hooks'
import { useGraphKeyboard } from '../model/graph-keyboard.hooks'
import { easeOutCubic, useAnimatedLayout } from '../model/graph-layout.hooks'
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
  /** Render prop for connections panel - injected by widget to avoid cross-feature import */
  renderConnectionsPanel?: (
    node: Node,
    edges: Edge[],
    allNodes: Node[],
    onOpenNode?: (id: string) => void,
    onPanToNode?: (id: string) => void
  ) => React.ReactNode
}

const GraphVisualizationContent = ({
  mapId,
  className,
  interactive = true,
  initialData,
  renderConnectionsPanel
}: GraphVisualizationProps) => {
  const { t } = useTranslation()
  // Use initialData if provided (SSR), otherwise fetch client-side
  const { data: fetchedMap, isLoading, isError } = useFullMap(mapId, { enabled: !initialData })
  const fullMap = initialData ?? fetchedMap
  const { selectedElements, handleSelectionChange, clearSelection, selectedNodeId, selectNode } =
    useNodeSelection()
  const { controls, toggleFullscreen } = useGraphControls()
  const layoutAppliedRef = useRef(false)

  // Mutations for persisting positions to DB
  const updatePositionMutation = useUpdateNodePosition()
  const updatePositionsMutation = useUpdateNodePositions()

  const { zoomIn, zoomOut, fitView, setCenter, getNode, screenToFlowPosition } = useReactFlow()
  const { zoom: viewportZoom } = useViewport()

  // Pan to a specific node
  const handlePanToNode = useCallback(
    (nodeId: string) => {
      const node = getNode(nodeId)
      if (node) {
        const x = node.position.x + (node.measured?.width ?? 200) / 2
        const y = node.position.y + (node.measured?.height ?? 100) / 2
        setCenter(x, y, { zoom: viewportZoom, duration: layoutParamsRef.current.animationDuration })
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
  const { saveSnapshot, undo, redo } = useLayoutHistory()

  // Track dark mode for theme-aware styling
  const isDark = useDarkMode()

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

  // Get filtered data and counts using extracted hook
  const { filteredData, nodeCountsByType, edgeCountsByType } = useFilteredGraphData({
    fullMap,
    visibleNodeTypes,
    visibleEdgeTypes,
    viewMode,
    focusedNodeId,
    focusDepth
  })

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
    if (reactFlowNodes.length === 0) {
      return null
    }

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

  // Get the appropriate anchor node based on current view mode
  const getAnchorNodeId = useCallback(() => {
    const params = layoutParamsRef.current
    // In focus mode, anchor to the focused node
    if (params.viewMode === 'focus' && params.focusedNodeId) {
      return params.focusedNodeId
    }
    // Otherwise, anchor to the node closest to viewport center
    return getClosestNodeToViewportCenter()
  }, [getClosestNodeToViewportCenter])

  // Apply auto-layout function - uses ref to get latest params when triggered by store events
  const doApplyLayout = useCallback(
    (shouldFitView = true, anchorNodeId?: string | null, animated = false) => {
      if (reactFlowNodes.length === 0) {
        return
      }

      // Save snapshot before layout change (for undo)
      const currentPositions = new Map<string, { x: number; y: number }>()
      for (const node of reactFlowNodes) {
        currentPositions.set(node.id, { x: node.position.x, y: node.position.y })
      }
      saveSnapshot(currentPositions)

      const params = layoutParamsRef.current
      const result = applyLayout(reactFlowNodes, reactFlowEdges, {
        viewMode: params.viewMode,
        focusedNodeId: params.focusedNodeId,
        spacingPercent: params.nodeSpacing,
        directionStrength: params.directionStrength
      })

      // Persist all new positions to DB (batch update)
      const positionUpdates = result.nodes.map(n => ({
        id: n.id,
        position: { x: Math.round(n.position.x), y: Math.round(n.position.y) }
      }))
      updatePositionsMutation.mutate(positionUpdates)

      if (animated) {
        // Smooth animation with synchronized camera
        const duration = layoutParamsRef.current.animationDuration
        animateToPositions(reactFlowNodes, result.nodes, anchorNodeId ?? null, {
          duration,
          easing: easeOutCubic
        })
        // If no anchor but need to fit view, do it after animation completes
        if (!anchorNodeId && shouldFitView) {
          setTimeout(() => fitView({ padding: 0.2, duration }), duration + 50)
        }
      } else {
        // Instant update
        setNodes(result.nodes)
        const instantDuration = params.animationDuration
        if (anchorNodeId) {
          const anchorNode = result.nodes.find(n => n.id === anchorNodeId)
          if (anchorNode) {
            const x = anchorNode.position.x + (anchorNode.measured?.width ?? 200) / 2
            const y = anchorNode.position.y + (anchorNode.measured?.height ?? 100) / 2
            setCenter(x, y, { zoom: viewportZoom, duration: instantDuration })
          }
        } else if (shouldFitView) {
          fitView({ padding: 0.2, duration: instantDuration })
        }
      }
    },
    [reactFlowNodes, reactFlowEdges, setNodes, fitView, setCenter, viewportZoom, animateToPositions, updatePositionsMutation, saveSnapshot]
  )

  // Apply initial layout when nodes are first loaded
  // TODO: When real backend exists, check if positions are valid and skip layout
  useEffect(() => {
    if (!layoutAppliedRef.current && initialNodes.length > 0 && fullMap) {
      layoutAppliedRef.current = true

      // Always apply layout on first load (mock data doesn't have real saved positions)
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
        useAnchor?: boolean
        animated?: boolean
      }>
      const shouldFitView = customEvent.detail?.fitView ?? true
      const useAnchor = customEvent.detail?.useAnchor ?? false
      const animated = customEvent.detail?.animated ?? false

      // Use smart anchor selection (focus mode = focused node, overview = closest to center)
      const anchorNodeId = useAnchor ? getAnchorNodeId() : null
      doApplyLayout(shouldFitView, anchorNodeId, animated)
    }

    layoutEvent.addEventListener('layout', handleLayoutEvent)
    return () => layoutEvent.removeEventListener('layout', handleLayoutEvent)
  }, [doApplyLayout, getAnchorNodeId])

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
        // Animate to new positions with anchor
        const anchorId = getAnchorNodeId()
        animateToPositions(reactFlowNodes, result.nodes, anchorId, {
          duration: animationDuration,
          easing: easeOutCubic
        })
        // Only fitView if no anchor (camera already follows anchor)
        if (!anchorId) {
          setTimeout(() => fitView({ padding: 0.2, duration: animationDuration }), animationDuration + 50)
        }
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
    fitView,
    getAnchorNodeId
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

  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      if (!interactive) {
        return
      }
      onNodesChange(changes)
    },
    [onNodesChange, interactive]
  )

  // Handle edge changes
  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      if (!interactive) {
        return
      }
      onEdgesChange(changes)
    },
    [onEdgesChange, interactive]
  )

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      if (!interactive) {
        return
      }
      setEdges(eds => addEdge({ ...params, type: 'knowledgeEdge' }, eds))
    },
    [setEdges, interactive]
  )

  // Helper to get current positions as Map
  const getCurrentPositionsMap = useCallback(() => {
    const positions = new Map<string, { x: number; y: number }>()
    for (const node of reactFlowNodes) {
      positions.set(node.id, { x: node.position.x, y: node.position.y })
    }
    return positions
  }, [reactFlowNodes])

  // Save position to DB after drag ends
  const handleNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: { id: string; position: { x: number; y: number } }) => {
      if (!interactive) {
        return
      }
      // Save snapshot before the drag (for undo)
      saveSnapshot(getCurrentPositionsMap())

      // Persist position to DB (fire-and-forget, optimistic)
      updatePositionMutation.mutate({
        id: node.id,
        position: { x: Math.round(node.position.x), y: Math.round(node.position.y) }
      })
    },
    [interactive, updatePositionMutation, saveSnapshot, getCurrentPositionsMap]
  )

  // Undo handler - restore previous layout snapshot
  const handleUndo = useCallback(() => {
    const snapshot = undo()
    if (snapshot) {
      setNodes(nodes =>
        nodes.map(node => {
          const pos = snapshot.positions.get(node.id)
          return pos ? { ...node, position: pos } : node
        })
      )
      // Persist restored positions to DB
      const updates = Array.from(snapshot.positions.entries()).map(([id, position]) => ({
        id,
        position: { x: Math.round(position.x), y: Math.round(position.y) }
      }))
      updatePositionsMutation.mutate(updates)
    }
  }, [undo, setNodes, updatePositionsMutation])

  // Redo handler - restore next layout snapshot
  const handleRedo = useCallback(() => {
    const snapshot = redo()
    if (snapshot) {
      setNodes(nodes =>
        nodes.map(node => {
          const pos = snapshot.positions.get(node.id)
          return pos ? { ...node, position: pos } : node
        })
      )
      // Persist restored positions to DB
      const updates = Array.from(snapshot.positions.entries()).map(([id, position]) => ({
        id,
        position: { x: Math.round(position.x), y: Math.round(position.y) }
      }))
      updatePositionsMutation.mutate(updates)
    }
  }, [redo, setNodes, updatePositionsMutation])

  // Keyboard shortcuts (must be after handlers are defined)
  useGraphKeyboard({
    selectedNodeId,
    onFitView: () => fitView({ padding: 0.2, duration: layoutParamsRef.current.animationDuration }),
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onUndo: handleUndo,
    onRedo: handleRedo,
    enabled: interactive
  })

  // Zoom handlers - use ReactFlow's built-in zoom
  const handleZoomIn = useCallback(() => {
    zoomIn()
  }, [zoomIn])

  const handleZoomOut = useCallback(() => {
    zoomOut()
  }, [zoomOut])

  const handleCenter = useCallback(() => {
    const duration = layoutParamsRef.current.animationDuration
    if (reactFlowNodes.length === 0) {
      fitView({ padding: 0.2, duration })
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
        setCenter(x, y, { zoom: viewportZoom, duration })
        return
      }
    }

    fitView({ padding: 0.2, duration })
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
  if (!fullMap) {
    return null
  }

  const selectedNode = fullMap.nodes.find(n => n.id === selectedNodeId) || null

  return (
    <div
      className={cn(
        'relative bg-background',
        controls.isFullscreen
          ? 'fixed inset-0 z-50 !w-screen !h-screen'
          : 'h-full w-full',
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
        onNodeDragStop={handleNodeDragStop}
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
              setCenter(position.x, position.y, { zoom: viewportZoom, duration: layoutParamsRef.current.animationDuration })
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
        nodes={fullMap?.nodes}
        onNodeSelect={node => {
          selectNode(node.id)
          handlePanToNode(node.id)
        }}
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
        onClose={clearSelection}
        connectionsTab={
          selectedNode &&
          renderConnectionsPanel?.(
            selectedNode,
            fullMap.edges,
            fullMap.nodes,
            selectNode,
            handlePanToNode
          )
        }
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
