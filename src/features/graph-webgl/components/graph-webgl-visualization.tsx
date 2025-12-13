/**
 * WebGL-based graph visualization (WASM + WebGL2)
 * Drop-in replacement for GraphVisualization with same API
 *
 * Architecture:
 * - GraphCanvas: WebGL canvas + DOM overlay for text/icons
 * - UI components: Same as React Flow version (Toolbar, Drawer, ViewControls)
 */

import { Loader2 } from 'lucide-react'
import { memo, useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Edge, FullMap, Node } from '@/entities/map'
import { useFullMap } from '@/entities/map'
import { Card } from '@/shared/components/card'
import { useDarkMode } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'
import { GraphCanvas, type GraphCanvasHandle, type ViewportState, type LayoutPosition } from '@/features/graph-webgl/components/graph-canvas'
import { MiniMapWebGL } from '@/features/graph-webgl/components/minimap-webgl'
import {
  useFilters,
  useFocusMode,
  useGraphUI,
  useNodeSpacing,
  useViewMode
} from '@/features/graph/model/graph.store'
import { useFilteredGraphData } from '@/features/graph/model/graph.data.hooks'
import { useNodeSelection } from '@/features/graph/model/graph.selection.hooks'
import { useGraphControls } from '@/features/graph/model/graph.controls.hooks'
import { GraphToolbar } from '@/features/graph/components/graph-toolbar'
import { ViewControlsPanel } from '@/features/graph/components/view-controls-panel'
import { NodeDrawer } from '@/features/graph/components/node-drawer'

interface GraphWebGLVisualizationProps {
  mapId: string
  className?: string
  interactive?: boolean
  initialData?: FullMap
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
  interactive = true,
  initialData,
  renderConnectionsPanel
}: GraphWebGLVisualizationProps) {
  const { t } = useTranslation()

  // Fetch data (use initialData for SSR)
  const { data: fetchedMap, isLoading, isError } = useFullMap(mapId)
  const fullMap = fetchedMap ?? initialData

  // Selection state
  const { selectedElements, clearSelection, selectedNodeId, selectNode } = useNodeSelection()
  const { controls, toggleFullscreen } = useGraphControls()

  // Store hooks for view settings
  const { viewMode } = useViewMode()
  const { focusedNodeId, focusDepth, focusNode } = useFocusMode()
  const { visibleNodeTypes, visibleEdgeTypes } = useFilters()
  const { showMinimap } = useGraphUI()
  const { nodeSpacing, directionStrength } = useNodeSpacing()

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
    viewMode,
    focusedNodeId,
    focusDepth
  })

  // Handle node click
  const handleNodeClick = useCallback(
    (nodeId: string | null) => {
      if (!nodeId) {
        clearSelection()
        return
      }
      if (viewMode === 'focus') {
        focusNode(nodeId)
      }
      selectNode(nodeId)
    },
    [viewMode, focusNode, selectNode, clearSelection]
  )

  // Handle viewport change
  const handleViewportChange = useCallback((newViewport: ViewportState) => {
    setViewport(newViewport)
  }, [])

  // Handle layout complete - get positions from WASM for minimap
  const handleLayoutComplete = useCallback((positions: LayoutPosition[]) => {
    setLayoutPositions(positions)
  }, [])

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

  // Focus on node and pan to it
  const handleFocusAndPanToNode = useCallback(
    (nodeId: string) => {
      focusNode(nodeId)
      // TODO: Pan to node in WebGL
    },
    [focusNode]
  )

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
        selectedNodeId={selectedNodeId}
        focusedNodeId={focusedNodeId}
        onNodeClick={handleNodeClick}
        onViewportChange={handleViewportChange}
        onLayoutComplete={handleLayoutComplete}
        layoutOptions={{
          viewMode,
          spacingPercent: nodeSpacing,
          directionStrength,
          focusedNodeId: focusedNodeId ?? undefined
        }}
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
          selectNode(node.id)
          // TODO: Pan to node
        }}
      />

      {/* Toolbar - view modes, focus controls, filters */}
      <GraphToolbar
        nodeCountsByType={nodeCountsByType}
        edgeCountsByType={edgeCountsByType}
        selectedNodeId={selectedNodeId}
      />

      {/* Node drawer */}
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
            selectNode,
            handleFocusAndPanToNode
          )
        }
      />

      {/* WebGL indicator */}
      <div className='absolute bottom-2 left-2 bg-background/80 border rounded px-2 py-1 text-xs font-mono'>
        <span className='text-green-500'>WebGL</span>
        <span className='text-muted-foreground ml-2'>{Math.round(viewport.zoom * 100)}%</span>
      </div>
    </div>
  )
})
