/**
 * GraphCanvas - WASM WebGL graph renderer
 *
 * Uses WASM engine for ALL rendering and viewport control.
 * No React viewport state - everything controlled by WASM.
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import type { Edge, Node } from '@/entities/map'
import { useDarkMode } from '@/shared/hooks'
import { cn } from '@/shared/lib/cn'
import { loadIconAtlas } from '../lib/atlas-loader'
import { createSDFAtlas } from '../lib/sdf-atlas'
import { getCssVar, themeToJson } from '../lib/theme-bridge'
import { layoutOptionsToWasm, transformToWasm } from '../lib/transform'
import type { LayoutOptions } from '../model/graph-webgl.types'
import { DEFAULT_LAYOUT_OPTIONS } from '../model/graph-webgl.constants'
import { initWasmModule } from '../lib/wasm-loader'

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
  update_node_position(id: string, x: number, y: number): void
  render(): void
  pan(dx: number, dy: number): void
  zoom_at(screen_x: number, screen_y: number, factor: number): void
  get_zoom(): number
  fit_view(padding: number): void
  set_selected(node_id: string | null): void
  set_selected_nodes(node_ids: string): void
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
  selectedNodeIds?: string[]
  selectedNodeId?: string | null
  focusedNodeId?: string | null
  dimmedNodeIds?: string[]
  onNodeClick?: (nodeId: string | null) => void
  onNodeDoubleClick?: (nodeId: string) => void
  onSelectionChange?: (selection: { nodes: string[]; edges: string[] }) => void
  onNodeDragStart?: (nodeId: string, x: number, y: number) => void
  onNodeDrag?: (nodeId: string, x: number, y: number) => void
  onNodeDragEnd?: (nodeId: string, x: number, y: number) => void
  onViewportChange?: (viewport: ViewportState) => void
  onLayoutComplete?: (positions: LayoutPosition[]) => void
  className?: string
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(function GraphCanvas(
  {
    nodes,
    edges,
    layoutOptions,
    selectedNodeIds,
    selectedNodeId,
    focusedNodeId,
    dimmedNodeIds = [],
    onNodeClick,
    onNodeDoubleClick,
    onSelectionChange,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragEnd,
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
  const viewportRef = useRef<ViewportState | null>(null)
  const [viewportState, setViewportState] = useState<ViewportState | null>(null)
  const positionsRef = useRef<Map<string, { x: number; y: number }>>(new Map())

  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track dark mode for theme sync
  const _isDark = useDarkMode()

  // Interaction state
  const isPanningRef = useRef(false)
  const draggingNodeRef = useRef<string | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const dragStartRef = useRef({ x: 0, y: 0 })
  const hasDraggedRef = useRef(false)
  const DRAG_THRESHOLD = 5 // pixels before considering it a drag

  const resolvedSelectedNodeIds = useMemo(() => {
    if (selectedNodeIds && selectedNodeIds.length > 0) {
      return selectedNodeIds
    }
    return selectedNodeId ? [selectedNodeId] : []
  }, [selectedNodeIds, selectedNodeId])

  const resolvedLayoutOptions = useMemo(
    () => ({
      ...DEFAULT_LAYOUT_OPTIONS,
      ...layoutOptions
    }),
    [
      layoutOptions?.viewMode,
      layoutOptions?.spacingPercent,
      layoutOptions?.directionStrength,
      layoutOptions?.focusedNodeId,
      layoutOptions?.iterations,
      layoutOptions?.coolingFactor,
      layoutOptions?.theta,
      layoutOptions?.ignoreExistingPositions
    ]
  )

  const getViewportFromEngine = useCallback(
    (useCanvasRect: boolean): ViewportState | null => {
      const engine = engineRef.current
      const canvas = canvasRef.current
      if (!engine) {
        return null
      }
      try {
        const json = engine.get_viewport()
        const viewport = JSON.parse(json) as ViewportState
        if (!useCanvasRect || !canvas) {
          return viewport
        }
        const rect = canvas.getBoundingClientRect()
        return {
          ...viewport,
          width: rect.width,
          height: rect.height
        }
      } catch {
        return null
      }
    },
    []
  )

  // Notify parent of viewport change
  const notifyViewportChange = useCallback(() => {
    const rawViewport = getViewportFromEngine(false)
    if (rawViewport) {
      viewportRef.current = rawViewport
    }
    const viewport = getViewportFromEngine(true)
    if (viewport) {
      setViewportState(viewport)
      onViewportChange?.(viewport)
    }
  }, [getViewportFromEngine, onViewportChange])

  const getCanvasPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) {
      return { x: 0, y: 0 }
    }
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    return {
      x: (clientX - rect.left) * dpr,
      y: (clientY - rect.top) * dpr
    }
  }, [])

  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      const viewport = viewportRef.current ?? getViewportFromEngine(false)
      if (!viewport) {
        return { x: screenX, y: screenY }
      }
      if (!viewportRef.current) {
        viewportRef.current = viewport
      }
      return {
        x: (screenX - viewport.width / 2) / viewport.zoom + viewport.x,
        y: (screenY - viewport.height / 2) / viewport.zoom + viewport.y
      }
    },
    [getViewportFromEngine]
  )

  const containerStyle = useMemo(() => {
    const base = { backgroundColor: 'oklch(var(--background))' }
    const gridSize = 24
    if (!viewportState) {
      return {
        ...base,
        backgroundImage: 'radial-gradient(oklch(var(--canvas-grid) / 0.5) 0.5px, transparent 0.5px)',
        backgroundSize: `${gridSize}px ${gridSize}px`
      }
    }
    const zoom = Math.max(viewportState.zoom, 0.05)
    const size = Math.max(8, gridSize * zoom)
    const mod = (value: number, m: number) => ((value % m) + m) % m
    const offsetX = mod(-viewportState.x * zoom + viewportState.width / 2, size)
    const offsetY = mod(-viewportState.y * zoom + viewportState.height / 2, size)
    return {
      ...base,
      backgroundImage: 'radial-gradient(oklch(var(--canvas-grid) / 0.5) 0.5px, transparent 0.5px)',
      backgroundSize: `${size}px ${size}px`,
      backgroundPosition: `${offsetX}px ${offsetY}px`
    }
  }, [viewportState])

  const syncPositionsFromEngine = useCallback((): LayoutPosition[] | null => {
    const engine = engineRef.current
    if (!engine) {
      return null
    }
    try {
      const positionsJson = engine.get_all_positions()
      const positions = JSON.parse(positionsJson) as LayoutPosition[]
      positionsRef.current = new Map(positions.map(pos => [pos.id, { x: pos.x, y: pos.y }]))
      return positions
    } catch {
      return null
    }
  }, [])

  // Get positions from WASM and notify parent
  const notifyLayoutComplete = useCallback(() => {
    const positions = syncPositionsFromEngine()
    if (positions && onLayoutComplete) {
      onLayoutComplete(positions)
    }
  }, [onLayoutComplete, syncPositionsFromEngine])

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
        const viewport = getViewportFromEngine(false)
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
        return getViewportFromEngine(true)
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
        await initWasmModule(wasm)

        if (!mounted) {
          return
        }

        const engine = new wasm.GraphEngine() as unknown as WasmGraphEngine
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
          const fontFamily =
            getCssVar('--font-sans') ||
            '"Söhne", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'
          if (document.fonts?.ready) {
            await document.fonts.ready
          }
          const sdfAtlas = createSDFAtlas({
            fontSize: 48,
            fontFamily,
            fontWeight: '600'
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
  }, [isReady, notifyViewportChange])

  const updateSelection = useCallback(
    (nextNodeIds: string[]) => {
      onSelectionChange?.({ nodes: nextNodeIds, edges: [] })
    },
    [onSelectionChange]
  )

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
        notifyViewportChange()
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
      engine.run_layout(layoutOptionsToWasm(resolvedLayoutOptions))

      // Fit view
      engine.fit_view(0.1)

      // Notify parent about layout positions for minimap
      notifyLayoutComplete()
      notifyViewportChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load graph')
    }
  }, [isReady, nodes, edges, notifyLayoutComplete, notifyViewportChange, resolvedLayoutOptions])

  // Re-run layout when layout options change
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady || !graphLoadedRef.current) {
      return
    }

    engine.run_layout(layoutOptionsToWasm(resolvedLayoutOptions))

    // Notify about new positions
    notifyLayoutComplete()
  }, [
    isReady,
    notifyLayoutComplete,
    resolvedLayoutOptions
  ])

  // Sync selection
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady) {
      return
    }
    engine.set_selected_nodes(JSON.stringify(resolvedSelectedNodeIds))
  }, [isReady, resolvedSelectedNodeIds])

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
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) {
        return
      }

      const engine = engineRef.current
      if (!engine) {
        return
      }

      const { x, y } = getCanvasPoint(e.clientX, e.clientY)
      lastMouseRef.current = { x, y }
      dragStartRef.current = { x, y }
      hasDraggedRef.current = false

      const nodeId = engine.hit_test(x, y)
      const isMultiSelect = e.shiftKey || e.metaKey || e.ctrlKey

      if (nodeId) {
        const nextSelection = isMultiSelect
          ? resolvedSelectedNodeIds.includes(nodeId)
            ? resolvedSelectedNodeIds.filter(id => id !== nodeId)
            : [...resolvedSelectedNodeIds, nodeId]
          : [nodeId]
        updateSelection(nextSelection)

        if (!isMultiSelect) {
          onNodeClick?.(nodeId)
        }

        draggingNodeRef.current = nodeId
        isPanningRef.current = false

        const world = screenToWorld(x, y)
        const storedPos = positionsRef.current.get(nodeId)
        const fallbackPos = nodes.find(node => node.id === nodeId)?.position
        const baseX = storedPos?.x ?? fallbackPos?.x ?? world.x
        const baseY = storedPos?.y ?? fallbackPos?.y ?? world.y

        dragOffsetRef.current = {
          x: world.x - baseX,
          y: world.y - baseY
        }

        onNodeDragStart?.(nodeId, baseX, baseY)
      } else {
        draggingNodeRef.current = null
        isPanningRef.current = true
        if (!isMultiSelect) {
          updateSelection([])
          onNodeClick?.(null)
        }
      }
    },
    [
      getCanvasPoint,
      nodes,
      onNodeClick,
      onNodeDragStart,
      resolvedSelectedNodeIds,
      screenToWorld,
      updateSelection
    ]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const engine = engineRef.current
      if (!engine) {
        return
      }

      const { x, y } = getCanvasPoint(e.clientX, e.clientY)
      const dx = x - lastMouseRef.current.x
      const dy = y - lastMouseRef.current.y
      lastMouseRef.current = { x, y }

      const totalDx = x - dragStartRef.current.x
      const totalDy = y - dragStartRef.current.y
      if (Math.abs(totalDx) > DRAG_THRESHOLD || Math.abs(totalDy) > DRAG_THRESHOLD) {
        hasDraggedRef.current = true
      }

      if (draggingNodeRef.current) {
        if (!hasDraggedRef.current) {
          return
        }
        const nodeId = draggingNodeRef.current
        const world = screenToWorld(x, y)
        const nextX = world.x - dragOffsetRef.current.x
        const nextY = world.y - dragOffsetRef.current.y

        engine.update_node_position(nodeId, nextX, nextY)
        positionsRef.current.set(nodeId, { x: nextX, y: nextY })
        onNodeDrag?.(nodeId, nextX, nextY)
        return
      }

      if (isPanningRef.current && hasDraggedRef.current) {
        engine.pan(-dx, -dy)
        notifyViewportChange()
        return
      }

      const nodeId = engine.hit_test(x, y)
      canvasRef.current?.style.setProperty('cursor', nodeId ? 'grab' : 'default')
    },
    [getCanvasPoint, notifyViewportChange, onNodeDrag, screenToWorld]
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const engine = engineRef.current
      if (!engine) {
        return
      }

      const { x, y } = getCanvasPoint(e.clientX, e.clientY)

      if (draggingNodeRef.current) {
        const nodeId = draggingNodeRef.current
        if (hasDraggedRef.current) {
          const world = screenToWorld(x, y)
          const nextX = world.x - dragOffsetRef.current.x
          const nextY = world.y - dragOffsetRef.current.y
          positionsRef.current.set(nodeId, { x: nextX, y: nextY })
          onNodeDragEnd?.(nodeId, nextX, nextY)
          notifyLayoutComplete()
        }
        draggingNodeRef.current = null
      }

      isPanningRef.current = false
      hasDraggedRef.current = false
    },
    [getCanvasPoint, notifyLayoutComplete, onNodeDragEnd, screenToWorld]
  )

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const engine = engineRef.current
      if (!engine) {
        return
      }

      const { x, y } = getCanvasPoint(e.clientX, e.clientY)
      // Reduced zoom sensitivity: 1.05 instead of 1.1
      const factor = e.deltaY < 0 ? 1.05 : 1 / 1.05

      engine.zoom_at(x, y, factor)
      notifyViewportChange()
    },
    [getCanvasPoint, notifyViewportChange]
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const engine = engineRef.current
      if (!engine || !onNodeDoubleClick) {
        return
      }

      const { x, y } = getCanvasPoint(e.clientX, e.clientY)

      const nodeId = engine.hit_test(x, y)
      if (nodeId) {
        onNodeDoubleClick(nodeId)
      }
    },
    [getCanvasPoint, onNodeDoubleClick]
  )

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full overflow-hidden', className)}
      style={containerStyle}
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
