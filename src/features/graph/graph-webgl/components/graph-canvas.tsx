/**
 * GraphCanvas - WASM WebGL graph renderer
 *
 * Uses WASM engine for ALL rendering and viewport control.
 * No React viewport state - everything controlled by WASM.
 */

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'

import type { Edge, Node } from '@/entities/map'
import { cn } from '@/shared/lib/cn'

import { generateSdfIconAtlas } from '../lib/sdf-icon-atlas'
import { useTheme } from '@/shared/core/theme'
import { themeToJson } from '../lib/theme-bridge'
import { layoutOptionsToWasm, transformToWasm } from '../lib/transform'
import { initWasmModule } from '../lib/wasm-loader'
import { DEFAULT_LAYOUT_OPTIONS } from '../model/graph-webgl.constants'
import { DEFAULT_RENDER_PARAMS, type GraphWebGLRenderParams } from '../model/graph-webgl.render-params'
import type { LayoutOptions } from '../model/graph-webgl.types'

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
  hit_test_edge_badge(screen_x: number, screen_y: number): string | undefined
  set_hovered_edge(edge_id: string): void
  node_count(): number
  edge_count(): number
  // Viewport state
  get_viewport(): string
  set_viewport(json: string): void
  // Layout positions
  get_all_positions(): string
  // Figma S+ level: theme and atlases
  set_theme(json: string): void
  // DPR for screen-stable rendering
  set_dpr(dpr: number): void
  // Renderer style knobs
  set_render_params(json: string): void
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
  load_bitmap_atlas_data(
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
  /** Disable auto-layout (use provided node positions as-is). */
  autoLayout?: boolean
  /** Background pattern behind the canvas. */
  backgroundMode?: 'none' | 'dots' | 'paper'
  /** Live renderer params (playground). */
  renderParams?: GraphWebGLRenderParams
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
  onEdgeBadgeClick?: (edgeId: string, screenX: number, screenY: number) => void
  className?: string
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(function GraphCanvas(
  {
    nodes,
    edges,
    layoutOptions,
    autoLayout = true,
    backgroundMode = 'dots',
    renderParams,
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
    onEdgeBadgeClick,
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
  const { palette, resolvedMode } = useTheme()

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

  // Extract layout-triggering fields (excludes focusedNodeId — focus changes
  // should only affect visibility/dimming, NOT trigger re-layout)
  const viewMode = layoutOptions?.viewMode ?? DEFAULT_LAYOUT_OPTIONS.viewMode
  const spacingPercent = layoutOptions?.spacingPercent ?? DEFAULT_LAYOUT_OPTIONS.spacingPercent
  const directionStrength = layoutOptions?.directionStrength ?? DEFAULT_LAYOUT_OPTIONS.directionStrength
  const iterations = layoutOptions?.iterations ?? DEFAULT_LAYOUT_OPTIONS.iterations
  const coolingFactor = layoutOptions?.coolingFactor ?? DEFAULT_LAYOUT_OPTIONS.coolingFactor
  const theta = layoutOptions?.theta ?? DEFAULT_LAYOUT_OPTIONS.theta
  const ignoreExistingPositions = layoutOptions?.ignoreExistingPositions ?? DEFAULT_LAYOUT_OPTIONS.ignoreExistingPositions

  // resolvedLayoutOptions drives layout re-computation.
  // focusedNodeId is NOT in the deps — focus changes only affect dimming, not layout.
  const resolvedLayoutOptions = useMemo(
    () => ({
      viewMode,
      spacingPercent,
      directionStrength,
      iterations,
      coolingFactor,
      theta,
      ignoreExistingPositions,
      focusedNodeId: focusedNodeId ?? undefined
    }),
    // biome-ignore lint/correctness/useExhaustiveDependencies: focusedNodeId excluded intentionally
    [viewMode, spacingPercent, directionStrength, iterations, coolingFactor, theta, ignoreExistingPositions]
  )

  const getViewportFromEngine = useCallback((useCanvasRect: boolean): ViewportState | null => {
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
  }, [])

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

    // Subtle paper grain (cheap): SVG turbulence layer, static in screen space.
    // Kept low-contrast so it doesn't shimmer under motion.
    const paperGrain =
      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"

    if (backgroundMode === 'none') {
      return base
    }
    if (!viewportState) {
      if (backgroundMode === 'paper') {
        const size = `${gridSize}px ${gridSize}px`
        return {
          ...base,
          backgroundImage: `linear-gradient(to right, oklch(var(--canvas-grid) / 0.10) 1px, transparent 1px), linear-gradient(to bottom, oklch(var(--canvas-grid) / 0.10) 1px, transparent 1px), radial-gradient(oklch(var(--canvas-grid) / 0.35) 0.5px, transparent 0.5px), ${paperGrain}`,
          backgroundSize: `${size}, ${size}, ${size}, 160px 160px`
        }
      }
      return {
        ...base,
        backgroundImage:
          'radial-gradient(oklch(var(--canvas-grid) / 0.5) 0.5px, transparent 0.5px)',
        backgroundSize: `${gridSize}px ${gridSize}px`
      }
    }
    const zoom = Math.max(viewportState.zoom, 0.05)
    const size = Math.max(8, gridSize * zoom)
    const mod = (value: number, m: number) => ((value % m) + m) % m
    const offsetX = mod(-viewportState.x * zoom + viewportState.width / 2, size)
    const offsetY = mod(-viewportState.y * zoom + viewportState.height / 2, size)

    if (backgroundMode === 'paper') {
      const layerSize = `${size}px ${size}px`
      const layerPos = `${offsetX}px ${offsetY}px`
      return {
        ...base,
        backgroundImage: `linear-gradient(to right, oklch(var(--canvas-grid) / 0.10) 1px, transparent 1px), linear-gradient(to bottom, oklch(var(--canvas-grid) / 0.10) 1px, transparent 1px), radial-gradient(oklch(var(--canvas-grid) / 0.30) 0.5px, transparent 0.5px), ${paperGrain}`,
        backgroundSize: `${layerSize}, ${layerSize}, ${layerSize}, 160px 160px`,
        backgroundPosition: `${layerPos}, ${layerPos}, ${layerPos}, 0 0`
      }
    }
    return {
      ...base,
      backgroundImage: 'radial-gradient(oklch(var(--canvas-grid) / 0.5) 0.5px, transparent 0.5px)',
      backgroundSize: `${size}px ${size}px`,
      backgroundPosition: `${offsetX}px ${offsetY}px`
    }
  }, [viewportState, backgroundMode])

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
        engine.set_dpr(dpr)

        // Set initial theme
        engine.set_theme(themeToJson())

        // Set initial render params — always apply defaults, then override if provided
        try {
          engine.set_render_params(JSON.stringify(renderParams ?? DEFAULT_RENDER_PARAMS))
        } catch {
          // ignore
        }

        // Load atlases (GPU text/icon rendering)
        try {
          // MSDF font atlas: resolution-independent, crisp at any zoom.
          {
            const [pngResponse, jsonResponse] = await Promise.all([
              fetch('/assets/inter-msdf.png'),
              fetch('/assets/inter-msdf.json')
            ])
            const metricsJson = await jsonResponse.text()
            const pngBlob = await pngResponse.blob()
            const bitmap = await createImageBitmap(pngBlob)
            const tmpCanvas = document.createElement('canvas')
            tmpCanvas.width = bitmap.width
            tmpCanvas.height = bitmap.height
            const ctx = tmpCanvas.getContext('2d')!
            ctx.drawImage(bitmap, 0, 0)
            const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height)
            engine.load_font_atlas_data(
              new Uint8Array(imageData.data.buffer),
              bitmap.width,
              bitmap.height,
              metricsJson
            )
          }
        } catch (err) {
          console.error('[GraphCanvas] Font atlas load failed:', err)
        }

        try {
          const sdfAtlas = generateSdfIconAtlas()
          console.log('[icons] atlas', sdfAtlas.width, 'x', sdfAtlas.height, 'coords:', sdfAtlas.coordsJson.slice(0, 120))
          engine.load_icon_atlas_data(
            sdfAtlas.imageData,
            sdfAtlas.width,
            sdfAtlas.height,
            sdfAtlas.coordsJson
          )
          console.log('[icons] loaded OK, sdf_mode should be true')
        } catch (err) {
          console.error('[icons] FAILED:', err)
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

  // Sync render params (playground) - avoid redundant JSON churn.
  const lastRenderParamsJsonRef = useRef<string | null>(null)
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady || !renderParams) {
      return
    }
    const json = JSON.stringify(renderParams)
    if (json === lastRenderParamsJsonRef.current) {
      return
    }
    lastRenderParamsJsonRef.current = json
    try {
      engine.set_render_params(json)
    } catch {
      // ignore
    }
  }, [isReady, renderParams])

  // Sync theme when mode or palette changes — all CSS vars may update
  // resolvedMode + palette in deps trigger re-extraction of CSS vars
  const themeKey = `${resolvedMode}-${palette}`
  useEffect(() => {
    if (!isReady || !engineRef.current || !themeKey) {
      return
    }
    // Delay one frame to ensure CSS vars have updated after class/attribute toggle
    const timer = requestAnimationFrame(() => {
      const engine = engineRef.current
      if (!engine) return
      engine.set_theme(themeToJson())
    })
    return () => cancelAnimationFrame(timer)
  }, [isReady, themeKey])

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
        engineRef.current.set_dpr(dpr)
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

    const isFirstLoad = !graphLoadedRef.current
    graphLoadedRef.current = true
    lastNodesRef.current = nodes
    lastEdgesRef.current = edges

    try {
      const json = transformToWasm(nodes, edges)
      engine.load_graph(json)

      if (autoLayout && isFirstLoad) {
        // Only run layout on first load — subsequent node changes (focus filter)
        // should preserve existing positions (matching React Flow behavior)
        engine.run_layout(layoutOptionsToWasm(resolvedLayoutOptions))
        engine.fit_view(0.1)
      }

      // Notify parent about layout positions for minimap
      notifyLayoutComplete()
      notifyViewportChange()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load graph')
    }
  }, [
    isReady,
    nodes,
    edges,
    notifyLayoutComplete,
    notifyViewportChange,
    resolvedLayoutOptions,
    autoLayout
  ])

  // Re-run layout when layout options change
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady || !graphLoadedRef.current || !autoLayout) {
      return
    }

    // When layout options change, start fresh to avoid ratcheting effect
    engine.run_layout(layoutOptionsToWasm({ ...resolvedLayoutOptions, ignoreExistingPositions: true }))
    engine.fit_view(0.1)

    // Notify about new positions
    notifyLayoutComplete()
  }, [isReady, notifyLayoutComplete, resolvedLayoutOptions, autoLayout])

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
        // Selection + click deferred to mouseup (only if not dragged)
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
      if (nodeId) {
        canvasRef.current?.style.setProperty('cursor', 'grab')
        engine.set_hovered_edge('')
      } else {
        const badgeHit = engine.hit_test_edge_badge(x, y)
        if (badgeHit) {
          try {
            const { edgeId } = JSON.parse(badgeHit)
            engine.set_hovered_edge(edgeId)
          } catch { /* ignore */ }
          canvasRef.current?.style.setProperty('cursor', 'pointer')
        } else {
          engine.set_hovered_edge('')
          canvasRef.current?.style.setProperty('cursor', 'default')
        }
      }
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
          // Was a drag — commit position, no click
          const world = screenToWorld(x, y)
          const nextX = world.x - dragOffsetRef.current.x
          const nextY = world.y - dragOffsetRef.current.y
          positionsRef.current.set(nodeId, { x: nextX, y: nextY })
          onNodeDragEnd?.(nodeId, nextX, nextY)
          notifyLayoutComplete()
        } else {
          // Was a clean click (no drag) — fire selection + click
          const isMultiSelect = e.shiftKey || e.metaKey || e.ctrlKey
          if (isMultiSelect) {
            const next = resolvedSelectedNodeIds.includes(nodeId)
              ? resolvedSelectedNodeIds.filter(id => id !== nodeId)
              : [...resolvedSelectedNodeIds, nodeId]
            updateSelection(next)
          } else {
            updateSelection([nodeId])
            onNodeClick?.(nodeId)
          }
        }
        draggingNodeRef.current = null
      } else if (!hasDraggedRef.current) {
        // No node was dragged/clicked — check edge badge hit
        const badgeHit = engine.hit_test_edge_badge(x, y)
        if (badgeHit) {
          try {
            const { edgeId } = JSON.parse(badgeHit)
            // Use mouse event clientX/Y + offset below cursor
            onEdgeBadgeClick?.(edgeId, e.clientX, e.clientY + 20)
          } catch {
            // ignore parse errors
          }
        }
      }

      isPanningRef.current = false
      hasDraggedRef.current = false
    },
    [getCanvasPoint, notifyLayoutComplete, onEdgeBadgeClick, onNodeClick, onNodeDragEnd, resolvedSelectedNodeIds, screenToWorld, updateSelection]
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
          <div className='text-muted-foreground'>Loading...</div>
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
