/**
 * GraphCanvas - WASM WebGL graph renderer
 *
 * Uses WASM engine for ALL rendering and viewport control.
 * No React viewport state - everything controlled by WASM.
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Edge, Node } from '@/entities/map'
import { useDarkMode } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'
import { loadIconAtlas } from '../lib/atlas-loader'
import { createSDFAtlas } from '../lib/sdf-atlas'
import { themeToJson } from '../lib/theme-bridge'
import { layoutOptionsToWasm, transformToWasm } from '../lib/transform'
import type { LayoutOptions } from '../lib/types'
import { DEFAULT_LAYOUT_OPTIONS } from '../lib/types'

/** Viewport state returned by WASM engine */
export interface ViewportState {
  x: number // Camera center X in world coords
  y: number // Camera center Y in world coords
  zoom: number // Zoom level
  width: number // Canvas width in pixels
  height: number // Canvas height in pixels
}

/** Imperative handle for controlling GraphCanvas */
export interface GraphCanvasHandle {
  zoomIn(): void
  zoomOut(): void
  fitView(): void
  panTo(worldX: number, worldY: number): void
  getZoom(): number
  getViewport(): ViewportState | null
}

// WASM types
interface WasmGraphEngine {
  free(): void
  init_renderer(canvas: HTMLCanvasElement): void
  resize(width: number, height: number): boolean
  load_graph(json: string): void
  run_layout(options_json: string): string
  render(): void
  pan(dx: number, dy: number): void
  zoom_at(screen_x: number, screen_y: number, factor: number): void
  get_zoom(): number
  fit_view(padding: number): void
  set_selected(node_id: string | null): void
  set_focused(node_id: string | null): void
  set_dimmed(node_ids: string): void
  hit_test(screen_x: number, screen_y: number): string | undefined
  node_count(): number
  edge_count(): number
  // Viewport state
  get_viewport(): string
  set_viewport(json: string): void
  // Layout positions
  get_all_positions(): string
  // Figma S+ level: theme and atlases
  set_theme(json: string): void
  load_font_atlas_data(
    image_data: Uint8Array,
    width: number,
    height: number,
    metrics_json: string
  ): void
  load_sdf_atlas_data(
    image_data: Uint8Array,
    width: number,
    height: number,
    metrics_json: string
  ): void
  load_icon_atlas_data(
    image_data: Uint8Array,
    width: number,
    height: number,
    icons_json: string
  ): void
}

/** Position data returned after layout completes */
export interface LayoutPosition {
  id: string
  x: number
  y: number
}

interface GraphCanvasProps {
  nodes: Node[]
  edges: Edge[]
  layoutOptions?: Partial<LayoutOptions>
  selectedNodeId?: string | null
  focusedNodeId?: string | null
  dimmedNodeIds?: string[]
  onNodeClick?: (nodeId: string | null) => void
  onNodeDoubleClick?: (nodeId: string) => void
  onViewportChange?: (viewport: ViewportState) => void
  onLayoutComplete?: (positions: LayoutPosition[]) => void
  className?: string
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(function GraphCanvas(
  {
    nodes,
    edges,
    layoutOptions,
    selectedNodeId,
    focusedNodeId,
    dimmedNodeIds = [],
    onNodeClick,
    onNodeDoubleClick,
    onViewportChange,
    onLayoutComplete,
    className
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<WasmGraphEngine | null>(null)
  const animationRef = useRef<number | null>(null)

  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track dark mode for theme sync
  const _isDark = useDarkMode()

  // Interaction state
  const isPanningRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const dragStartRef = useRef({ x: 0, y: 0 })
  const hasDraggedRef = useRef(false)
  const DRAG_THRESHOLD = 5 // pixels before considering it a drag

  // Helper to get parsed viewport from WASM
  const getViewportFromEngine = useCallback((): ViewportState | null => {
    const engine = engineRef.current
    const canvas = canvasRef.current
    if (!engine || !canvas) {
      return null
    }
    try {
      const json = engine.get_viewport()
      const viewport = JSON.parse(json) as ViewportState
      // Ensure width/height are set from canvas
      const rect = canvas.getBoundingClientRect()
      return {
        ...viewport,
        width: rect.width,
        height: rect.height
      }
    } catch {
      return null
    }
  }, [])

  // Notify parent of viewport change
  const notifyViewportChange = useCallback(() => {
    const viewport = getViewportFromEngine()
    if (viewport) {
      onViewportChange?.(viewport)
    }
  }, [getViewportFromEngine, onViewportChange])

  // Get positions from WASM and notify parent
  const notifyLayoutComplete = useCallback(() => {
    const engine = engineRef.current
    if (!engine || !onLayoutComplete) {
      return
    }
    try {
      const positionsJson = engine.get_all_positions()
      const positions = JSON.parse(positionsJson) as LayoutPosition[]
      onLayoutComplete(positions)
    } catch {
      // Failed to get positions - ignore
    }
  }, [onLayoutComplete])

  // Expose imperative handle for parent control
  useImperativeHandle(
    ref,
    () => ({
      zoomIn() {
        const engine = engineRef.current
        const canvas = canvasRef.current
        if (!engine || !canvas) {
          return
        }
        // Zoom at center
        const rect = canvas.getBoundingClientRect()
        engine.zoom_at(rect.width / 2, rect.height / 2, 1.2)
        notifyViewportChange()
      },
      zoomOut() {
        const engine = engineRef.current
        const canvas = canvasRef.current
        if (!engine || !canvas) {
          return
        }
        const rect = canvas.getBoundingClientRect()
        engine.zoom_at(rect.width / 2, rect.height / 2, 1 / 1.2)
        notifyViewportChange()
      },
      fitView() {
        const engine = engineRef.current
        if (!engine) {
          return
        }
        engine.fit_view(0.1)
        notifyViewportChange()
      },
      panTo(worldX: number, worldY: number) {
        const engine = engineRef.current
        if (!engine) {
          return
        }
        // Set viewport position directly
        const viewport = getViewportFromEngine()
        if (viewport) {
          const newViewport = { ...viewport, x: worldX, y: worldY }
          engine.set_viewport(JSON.stringify(newViewport))
          notifyViewportChange()
        }
      },
      getZoom() {
        return engineRef.current?.get_zoom() ?? 1
      },
      getViewport() {
        return getViewportFromEngine()
      }
    }),
    [getViewportFromEngine, notifyViewportChange]
  )

  // Initialize WASM engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    let mounted = true

    const init = async () => {
      try {
        const wasm = await import('../wasm/graph_engine')
        await wasm.default()

        if (!mounted) {
          return
        }

        const engine = new wasm.GraphEngine()
        engine.init_renderer(canvas)

        // Set initial size
        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
        engine.resize(canvas.width, canvas.height)

        // Set initial theme
        engine.set_theme(themeToJson())

        // Load atlases (Figma S+ level GPU text/icon rendering)
        try {
          // Create SDF font atlas using Mapbox tiny-sdf (dynamic, system fonts)
          const sdfAtlas = createSDFAtlas({
            fontSize: 48,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: '400'
          })
          const atlasData = sdfAtlas.getAtlasData()
          const metricsJson = sdfAtlas.getGlyphMetricsJson()
          engine.load_sdf_atlas_data(atlasData.data, atlasData.width, atlasData.height, metricsJson)

          // Load icon atlas (static, from PNG)
          const icons = await loadIconAtlas('/assets')
          engine.load_icon_atlas_data(
            icons.imageData,
            icons.width,
            icons.height,
            JSON.stringify(icons.coords)
          )
        } catch {
          // Atlas loading failed - text/icons will use fallback
        }

        engineRef.current = engine
        setIsReady(true)
        setError(null)
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize WASM')
        }
      }
    }

    init()

    return () => {
      mounted = false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (engineRef.current) {
        try {
          engineRef.current.free()
        } catch (_e) {
          // ignore
        }
        engineRef.current = null
      }
    }
  }, [])

  // Sync theme when dark mode changes
  useEffect(() => {
    if (!isReady || !engineRef.current) {
      return
    }
    engineRef.current.set_theme(themeToJson())
  }, [isReady])

  // Handle resize
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas || !isReady) {
      return
    }

    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry && engineRef.current) {
        const { width, height } = entry.contentRect
        const dpr = window.devicePixelRatio || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        engineRef.current.resize(canvas.width, canvas.height)
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [isReady])

  // Load graph data (only when nodes/edges change)
  const graphLoadedRef = useRef(false)
  const lastNodesRef = useRef<Node[]>([])
  const lastEdgesRef = useRef<Edge[]>([])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady || nodes.length === 0) {
      return
    }

    // Check if nodes/edges actually changed (by reference)
    const nodesChanged = nodes !== lastNodesRef.current
    const edgesChanged = edges !== lastEdgesRef.current

    if (graphLoadedRef.current && !nodesChanged && !edgesChanged) {
      return
    }

    graphLoadedRef.current = true
    lastNodesRef.current = nodes
    lastEdgesRef.current = edges

    try {
      const json = transformToWasm(nodes, edges)
      engine.load_graph(json)

      // Run layout
      const options: LayoutOptions = {
        ...DEFAULT_LAYOUT_OPTIONS,
        ...layoutOptions
      }
      engine.run_layout(layoutOptionsToWasm(options))

      // Fit view
      engine.fit_view(0.1)

      // Notify parent about layout positions for minimap
      notifyLayoutComplete()
      notifyViewportChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load graph')
    }
  }, [isReady, nodes, edges, notifyLayoutComplete, notifyViewportChange, layoutOptions])

  // Re-run layout when layout options change
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady || !graphLoadedRef.current) {
      return
    }

    const options: LayoutOptions = {
      ...DEFAULT_LAYOUT_OPTIONS,
      ...layoutOptions
    }
    engine.run_layout(layoutOptionsToWasm(options))

    // Notify about new positions
    notifyLayoutComplete()
  }, [
    isReady,
    layoutOptions?.viewMode,
    layoutOptions?.spacingPercent,
    layoutOptions?.directionStrength,
    layoutOptions?.focusedNodeId,
    notifyLayoutComplete,
    layoutOptions
  ])

  // Sync selection
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady) {
      return
    }
    engine.set_selected(selectedNodeId ?? null)
  }, [isReady, selectedNodeId])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady) {
      return
    }
    engine.set_focused(focusedNodeId ?? null)
  }, [isReady, focusedNodeId])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady) {
      return
    }
    engine.set_dimmed(JSON.stringify(dimmedNodeIds))
  }, [isReady, dimmedNodeIds])

  // Render loop
  useEffect(() => {
    if (!isReady) {
      return
    }

    let running = true
    const render = () => {
      if (!running) {
        return
      }
      const engine = engineRef.current
      if (engine) {
        engine.render()
      }
      animationRef.current = requestAnimationFrame(render)
    }

    animationRef.current = requestAnimationFrame(render)

    return () => {
      running = false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isReady])

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) {
      return
    }

    const engine = engineRef.current
    const canvas = canvasRef.current
    if (!engine || !canvas) {
      return
    }

    // Start potential drag/pan
    isPanningRef.current = true
    hasDraggedRef.current = false
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
    dragStartRef.current = { x: e.clientX, y: e.clientY }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const engine = engineRef.current
      if (!engine || !isPanningRef.current) {
        return
      }

      const dx = e.clientX - lastMouseRef.current.x
      const dy = e.clientY - lastMouseRef.current.y
      lastMouseRef.current = { x: e.clientX, y: e.clientY }

      // Check if we've moved beyond threshold (to distinguish click from drag)
      const totalDx = e.clientX - dragStartRef.current.x
      const totalDy = e.clientY - dragStartRef.current.y
      if (Math.abs(totalDx) > DRAG_THRESHOLD || Math.abs(totalDy) > DRAG_THRESHOLD) {
        hasDraggedRef.current = true
      }

      // Only pan if we've actually dragged
      if (hasDraggedRef.current) {
        // Natural drag: content follows mouse direction
        engine.pan(-dx, -dy)
        notifyViewportChange()
      }
    },
    [notifyViewportChange]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const engine = engineRef.current
      const canvas = canvasRef.current

      // If we didn't drag, treat as click
      if (!hasDraggedRef.current && engine && canvas) {
        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        const x = (e.clientX - rect.left) * dpr
        const y = (e.clientY - rect.top) * dpr

        const nodeId = engine.hit_test(x, y)
        onNodeClick?.(nodeId ?? null)
      }

      isPanningRef.current = false
      hasDraggedRef.current = false
    },
    [onNodeClick]
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const engine = engineRef.current
      const canvas = canvasRef.current
      if (!engine || !canvas) {
        return
      }

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      // Reduced zoom sensitivity: 1.05 instead of 1.1
      const factor = e.deltaY < 0 ? 1.05 : 1 / 1.05

      engine.zoom_at(x, y, factor)
      notifyViewportChange()
    },
    [notifyViewportChange]
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const engine = engineRef.current
      const canvas = canvasRef.current
      if (!engine || !canvas || !onNodeDoubleClick) {
        return
      }

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const nodeId = engine.hit_test(x, y)
      if (nodeId) {
        onNodeDoubleClick(nodeId)
      }
    },
    [onNodeDoubleClick]
  )

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full overflow-hidden', className)}
      style={{ background: 'oklch(var(--background))' }}
    >
      <canvas
        ref={canvasRef}
        className='absolute inset-0 cursor-grab active:cursor-grabbing'
        style={{ touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      />

      {!isReady && !error && (
        <div className='absolute inset-0 flex items-center justify-center bg-background/80'>
          <div className='text-muted-foreground'>Loading WASM...</div>
        </div>
      )}

      {error && (
        <div className='absolute inset-0 flex items-center justify-center bg-background/80'>
          <div className='text-destructive text-center p-4'>
            <div className='font-semibold'>WASM Error</div>
            <div className='text-sm mt-1'>{error}</div>
          </div>
        </div>
      )}
    </div>
  )
})
