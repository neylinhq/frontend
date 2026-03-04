/**
 * WebGL-based graph visualization (WASM + WebGL2)
 * Drop-in replacement for GraphVisualization with same API
 *
 * Architecture:
 * - GraphCanvas: WebGL canvas + DOM overlay for text/icons
 * - UI components: Same as React Flow version (Toolbar, Drawer, ViewControls)
 */

import { Loading02Icon } from '@untitledui/icons-react/outline'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { GraphToolbar } from '@/features/graph/components/graph-toolbar'
import { NodeDrawer } from '@/features/graph/components/node-drawer'
import { ViewControlsPanel } from '@/features/graph/components/view-controls-panel'
import { useGraphControls } from '@/features/graph/model/graph.controls.hooks'
import { useFilteredGraphData } from '@/features/graph/model/graph.data.hooks'
import { useGraphKeyboard } from '@/features/graph/model/graph.keyboard.hooks'
import { useNodeSelection } from '@/features/graph/model/graph.selection.hooks'
import {
  useFilters,
  useFocusMode,
  useGraphUI,
  useNodeSpacing,
  useViewMode
} from '@/features/graph/model/graph.store'
import {
  GraphCanvas,
  type GraphCanvasHandle,
  type LayoutPosition,
  type ViewportState
} from '@/features/graph-webgl/components/graph-canvas'
import { MiniMapWebGL } from '@/features/graph-webgl/components/minimap-webgl'
import type { Edge, FullMap, Node } from '@/entities/map'
import { useFullMap, useUpdateNodePosition } from '@/entities/map'
import { Card } from '@/shared/components/card'
import { useDarkMode } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'

interface GraphWebGLVisualizationProps {
  mapId: string
  className?: string
  interactive?: boolean
  initialData?: FullMap
  /** Callback when node is selected - when provided, internal NodeDrawer is hidden */
  onNodeSelect?: (node: Node | null) => void
  /** Callback when viewport changes (pan/zoom) */
  onViewportChange?: (viewport: ViewportState) => void
  renderConnectionsPanel?: (
    node: Node,
    edges: Edge[],
    allNodes: Node[],
    onOpenNode?: (id: string) => void,
    onPanToNode?: (id: string) => void,
    onEditEdge?: (edge: Edge) => void,
    onDeleteEdge?: (edgeId: string) => void
  ) => React.ReactNode
}

export const GraphWebGLVisualization = memo(function GraphWebGLVisualization({
  mapId,
  className,
  interactive: _interactive = true,
  initialData,
  onNodeSelect,
  onViewportChange,
  renderConnectionsPanel
}: GraphWebGLVisualizationProps) {
  const { t } = useTranslation()

  // Fetch data (use initialData for SSR)
  const { data: fetchedMap, isLoading, isError } = useFullMap(mapId)
  const fullMap = fetchedMap ?? initialData

  const updatePositionMutation = useUpdateNodePosition(mapId)

  // Selection state
  const { selectedElements, setSelection, setDrawerNodeId, clearSelection, selectedNodeId } =
    useNodeSelection()
  const { controls, toggleFullscreen } = useGraphControls()

  // Store hooks for view settings
  const { viewMode } = useViewMode()
  const { focusedNodeId, focusDepth, focusNode } = useFocusMode()
  const { visibleNodeTypes, visibleEdgeTypes, connectionRange } = useFilters()
  const { showMinimap } = useGraphUI()
  const { nodeSpacing, directionStrength } = useNodeSpacing()

  const layoutOptions = useMemo(
    () => ({
      viewMode,
      spacingPercent: nodeSpacing,
      directionStrength,
      focusedNodeId: focusedNodeId ?? undefined
    }),
    [viewMode, nodeSpacing, directionStrength, focusedNodeId]
  )

  // Track dark mode for theme-aware styling
  const isDark = useDarkMode()

  // Ref to GraphCanvas for imperative control
  const canvasRef = useRef<GraphCanvasHandle>(null)

  // Viewport state for WebGL
  const [viewport, setViewport] = useState<ViewportState>({
    x: 0,
    y: 0,
    zoom: 1,
    width: 800,
    height: 600
  })

  // Layout positions from WASM for minimap sync
  const [layoutPositions, setLayoutPositions] = useState<LayoutPosition[]>([])

  // Get filtered data using existing hook
  const { filteredData, nodeCountsByType, edgeCountsByType } = useFilteredGraphData({
    fullMap,
    visibleNodeTypes,
    visibleEdgeTypes,
    connectionRange,
    viewMode,
    focusedNodeId,
    focusDepth
  })

  // Handle node click
  const handleNodeClick = useCallback(
    (nodeId: string | null) => {
      if (!nodeId) {
        // Notify parent if callback provided
        onNodeSelect?.(null)
        return
      }
      if (viewMode === 'focus') {
        focusNode(nodeId)
      }
      // Notify parent if callback provided
      const node = fullMap?.nodes.find(n => n.id === nodeId) || null
      onNodeSelect?.(node)
    },
    [viewMode, focusNode, onNodeSelect, fullMap?.nodes]
  )

  const handleSelectionChange = useCallback(
    (selection: { nodes: string[]; edges: string[] }) => {
      setSelection(selection.nodes, selection.edges)
      if (selection.nodes.length === 1) {
        setDrawerNodeId(selection.nodes[0])
      } else {
        setDrawerNodeId(null)
      }
    },
    [setDrawerNodeId, setSelection]
  )

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      setSelection([nodeId], [])
      setDrawerNodeId(nodeId)
      const node = fullMap?.nodes.find(n => n.id === nodeId) || null
      onNodeSelect?.(node)
    },
    [fullMap?.nodes, onNodeSelect, setDrawerNodeId, setSelection]
  )

  // Handle viewport change
  const handleViewportChange = useCallback(
    (newViewport: ViewportState) => {
      setViewport(newViewport)
      onViewportChange?.(newViewport)
    },
    [onViewportChange]
  )

  // Handle layout complete - get positions from WASM for minimap
  const handleLayoutComplete = useCallback((positions: LayoutPosition[]) => {
    setLayoutPositions(positions)
  }, [])

  const handleNodeDragEnd = useCallback(
    (nodeId: string, x: number, y: number) => {
      updatePositionMutation.mutate({
        id: nodeId,
        position: { x: Math.round(x), y: Math.round(y) }
      })
    },
    [updatePositionMutation]
  )

  // Handle minimap navigation (click to pan)
  const handleMinimapNavigate = useCallback((worldX: number, worldY: number) => {
    canvasRef.current?.panTo(worldX, worldY)
  }, [])

  // Zoom handlers - control WASM engine via ref
  const handleZoomIn = useCallback(() => {
    canvasRef.current?.zoomIn()
  }, [])

  const handleZoomOut = useCallback(() => {
    canvasRef.current?.zoomOut()
  }, [])

  const handleCenter = useCallback(() => {
    canvasRef.current?.fitView()
  }, [])

  useGraphKeyboard({
    selectedNodeId,
    onFitView: handleCenter,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    enabled: _interactive
  })

  // Pan to node (for connections panel eye icon)
  // Does NOT enable focus mode - just centers on the node
  const handlePanToNodeWithZoom = useCallback((nodeId: string) => {
    // TODO: Pan to node in WebGL
    canvasRef.current?.centerOnNode?.(nodeId)
  }, [])

  // Show loading only when fetching client-side (no initialData)
  if (!initialData && isLoading) {
    return (
      <div className={cn('flex items-center justify-center min-h-96', className)}>
        <div className='text-center space-y-3'>
          <Loading02Icon className='h-8 w-8 animate-spin mx-auto text-primary' />
          <p className='text-sm text-muted-foreground'>{t('graph.loading')}</p>
        </div>
      </div>
    )
  }

  if (!initialData && (isError || !fullMap)) {
    return (
      <div className={cn('flex items-center justify-center min-h-96', className)}>
        <Card className='p-8 text-center'>
          <p className='text-lg font-semibold text-destructive mb-2'>{t('graph.loadingError')}</p>
          <p className='text-muted-foreground'>{t('graph.loadingErrorMessage')}</p>
        </Card>
      </div>
    )
  }

  if (!fullMap) {
    return null
  }

  const selectedNode = fullMap.nodes.find(n => n.id === selectedNodeId) || null

  return (
    <div
      className={cn(
        'relative bg-background',
        controls.isFullscreen ? 'fixed inset-0 z-50 !w-screen !h-screen' : 'h-full w-full',
        className
      )}
    >
      {/* WebGL Canvas with DOM Overlay */}
      <GraphCanvas
        ref={canvasRef}
        nodes={filteredData.nodes}
        edges={filteredData.edges}
        selectedNodeIds={selectedElements.nodes}
        selectedNodeId={selectedNodeId}
        focusedNodeId={focusedNodeId}
        onNodeClick={handleNodeClick}
        onSelectionChange={handleSelectionChange}
        onNodeDragEnd={handleNodeDragEnd}
        onViewportChange={handleViewportChange}
        onLayoutComplete={handleLayoutComplete}
        layoutOptions={layoutOptions}
        className='h-full w-full'
      />

      {/* MiniMap */}
      {showMinimap && (
        <MiniMapWebGL
          nodes={filteredData.nodes}
          layoutPositions={layoutPositions}
          viewport={viewport}
          isDark={isDark}
          onNavigate={handleMinimapNavigate}
        />
      )}

      {/* View controls panel - top left */}
      <ViewControlsPanel
        zoom={Math.round(viewport.zoom * 100)}
        isFullscreen={controls.isFullscreen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleCenter}
        onToggleFullscreen={toggleFullscreen}
        nodes={fullMap?.nodes}
        onNodeSelect={node => {
          handleSelectNode(node.id)
          // TODO: Pan to node
        }}
      />

      {/* Toolbar - view modes, focus controls, filters */}
      <GraphToolbar
        nodeCountsByType={nodeCountsByType}
        edgeCountsByType={edgeCountsByType}
        selectedNodeId={selectedNodeId}
      />

      {/* Node drawer - only shown when onNodeSelect is NOT provided (internal mode) */}
      {!onNodeSelect && (
        <NodeDrawer
          node={selectedNode}
          onClose={clearSelection}
          connectionsCount={
            selectedNode
              ? fullMap.edges.filter(
                  e => e.sourceNodeId === selectedNode.id || e.targetNodeId === selectedNode.id
                ).length
              : 0
          }
          connectionsTab={
            selectedNode &&
            renderConnectionsPanel?.(
              selectedNode,
              fullMap.edges,
              fullMap.nodes,
              handleSelectNode,
              handlePanToNodeWithZoom
            )
          }
        />
      )}

      {/* WebGL indicator */}
      <div className='absolute bottom-2 left-2 bg-background/80 border rounded px-2 py-1 text-xs font-mono'>
        <span className='text-success'>WebGL</span>
        <span className='text-muted-foreground ml-2'>{Math.round(viewport.zoom * 100)}%</span>
      </div>
    </div>
  )
})
