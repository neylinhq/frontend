/**
 * GraphCanvas - Main WebGL canvas component
 *
 * Renders the graph using WebGL with a DOM overlay for text
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Node, Edge } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { useGraphEngine } from '../model/use-graph-engine'
import { useViewport } from '../model/use-viewport'
import { useInteraction } from '../model/use-interaction'
import { DomOverlay } from './dom-overlay'
import type { LayoutOptions } from '../lib/types'
import { DEFAULT_LAYOUT_OPTIONS } from '../lib/types'

interface GraphCanvasProps {
  nodes: Node[]
  edges: Edge[]
  layoutOptions?: Partial<LayoutOptions>
  selectedNodeId?: string | null
  focusedNodeId?: string | null
  dimmedNodeIds?: string[]
  onNodeClick?: (nodeId: string | null) => void
  onNodeDoubleClick?: (nodeId: string) => void
  onNodeDrag?: (nodeId: string, x: number, y: number) => void
  onPositionsUpdate?: (nodes: Node[]) => void
  onViewportChange?: (zoom: number) => void
  className?: string
}

export function GraphCanvas({
  nodes,
  edges,
  layoutOptions,
  selectedNodeId,
  focusedNodeId,
  dimmedNodeIds = [],
  onNodeClick,
  onNodeDoubleClick,
  onNodeDrag,
  onPositionsUpdate,
  onViewportChange,
  className,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  // Initialize canvas ref
  useEffect(() => {
    setCanvas(canvasRef.current)
  }, [])

  // Graph engine hook
  const engine = useGraphEngine({
    canvas,
    onPositionsUpdate,
  })

  // Viewport hook
  const {
    viewport,
    pan,
    zoomAt,
    setSize,
    fitToBounds,
    screenToWorld,
    worldToScreen,
  } = useViewport({
    onViewportChange: (v) => {
      onViewportChange?.(v.zoom)
    },
  })

  // Interaction hook
  const { state: interactionState, setSelectedNodeId, setFocusedNodeId } = useInteraction({
    canvas,
    onPan: pan,
    onZoom: zoomAt,
    onNodeClick: (nodeId) => {
      engine.setSelected(nodeId)
      onNodeClick?.(nodeId)
    },
    onNodeDoubleClick,
    onNodeDragStart: (nodeId, x, y) => {
      // Node drag started
    },
    onNodeDrag: (nodeId, x, y) => {
      engine.updateNodePosition(nodeId, x, y)
      onNodeDrag?.(nodeId, x, y)
    },
    onNodeDragEnd: (nodeId, x, y) => {
      engine.updateNodePosition(nodeId, x, y)
    },
    hitTest: engine.hitTest,
    screenToWorld,
  })

  // Handle resize
  useEffect(() => {
    if (!containerRef.current || !canvas) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const { width, height } = entry.contentRect
        canvas.width = width * window.devicePixelRatio
        canvas.height = height * window.devicePixelRatio
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        engine.resize(canvas.width, canvas.height)
        setSize(width, height)
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [canvas, engine, setSize])

  // Load graph data
  useEffect(() => {
    if (!engine.state.isReady) return
    engine.loadGraph(nodes, edges)
  }, [engine, nodes, edges])

  // Run layout when options change
  useEffect(() => {
    if (!engine.state.isReady || nodes.length === 0) return

    const options: LayoutOptions = {
      ...DEFAULT_LAYOUT_OPTIONS,
      ...layoutOptions,
    }

    // Use animated layout for better UX
    engine.startAnimatedLayout(options)

    return () => {
      engine.stopLayout()
    }
  }, [engine, layoutOptions, nodes.length])

  // Sync selection state
  useEffect(() => {
    engine.setSelected(selectedNodeId ?? null)
    setSelectedNodeId(selectedNodeId ?? null)
  }, [engine, selectedNodeId, setSelectedNodeId])

  useEffect(() => {
    engine.setFocused(focusedNodeId ?? null)
    setFocusedNodeId(focusedNodeId ?? null)
  }, [engine, focusedNodeId, setFocusedNodeId])

  useEffect(() => {
    engine.setDimmed(dimmedNodeIds)
  }, [engine, dimmedNodeIds])

  // Render loop
  useEffect(() => {
    if (!engine.state.isReady) return

    let animationId: number
    const render = () => {
      engine.render()
      animationId = requestAnimationFrame(render)
    }
    animationId = requestAnimationFrame(render)

    return () => cancelAnimationFrame(animationId)
  }, [engine])

  // Fit view to content
  const handleFitView = useCallback(() => {
    engine.fitView(0.1)
  }, [engine])

  // Get visible node IDs for DOM overlay
  const visibleNodeIds = engine.getVisibleNodes()
  const visibleNodes = nodes.filter((n) => visibleNodeIds.includes(n.id))

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full overflow-hidden bg-background', className)}
    >
      {/* WebGL Canvas (z-index 0) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ touchAction: 'none' }}
      />

      {/* DOM Overlay for text/icons (z-index 1) */}
      <DomOverlay
        nodes={visibleNodes}
        viewport={viewport}
        selectedNodeId={interactionState.selectedNodeId}
        focusedNodeId={interactionState.focusedNodeId}
        worldToScreen={worldToScreen}
      />

      {/* Loading/Error overlay */}
      {engine.state.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-muted-foreground">Loading graph engine...</div>
        </div>
      )}

      {engine.state.error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="text-destructive">Error: {engine.state.error}</div>
        </div>
      )}
    </div>
  )
}
