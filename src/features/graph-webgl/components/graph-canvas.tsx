/**
 * GraphCanvas - WASM WebGL graph renderer
 *
 * Uses WASM engine for ALL rendering and viewport control.
 * No React viewport state - everything controlled by WASM.
 */

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import type { Node, Edge } from '@/entities/map'
import { cn } from '@/shared/lib/cn'
import { useDarkMode } from '@/shared/hooks'
import type { LayoutOptions } from '../lib/types'
import { DEFAULT_LAYOUT_OPTIONS } from '../lib/types'
import { transformToWasm, layoutOptionsToWasm } from '../lib/transform'
import { themeToJson } from '../lib/theme-bridge'
import { preloadAtlases } from '../lib/atlas-loader'

/** Imperative handle for controlling GraphCanvas */
export interface GraphCanvasHandle {
  zoomIn(): void
  zoomOut(): void
  fitView(): void
  getZoom(): number
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
  // Figma S+ level: theme and atlases
  set_theme(json: string): void
  load_font_atlas_data(image_data: Uint8Array, width: number, height: number, metrics_json: string): void
  load_icon_atlas_data(image_data: Uint8Array, width: number, height: number, icons_json: string): void
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
  onViewportChange?: (zoom: number) => void
  className?: string
}

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
  function GraphCanvas(
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
      className,
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
  const isDark = useDarkMode()

  // Interaction state
  const isPanningRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })

  // Expose imperative handle for parent control
  useImperativeHandle(ref, () => ({
    zoomIn() {
      const engine = engineRef.current
      const canvas = canvasRef.current
      if (!engine || !canvas) return
      // Zoom at center
      const rect = canvas.getBoundingClientRect()
      engine.zoom_at(rect.width / 2, rect.height / 2, 1.2)
      onViewportChange?.(engine.get_zoom())
    },
    zoomOut() {
      const engine = engineRef.current
      const canvas = canvasRef.current
      if (!engine || !canvas) return
      const rect = canvas.getBoundingClientRect()
      engine.zoom_at(rect.width / 2, rect.height / 2, 1 / 1.2)
      onViewportChange?.(engine.get_zoom())
    },
    fitView() {
      const engine = engineRef.current
      if (!engine) return
      engine.fit_view(0.1)
      onViewportChange?.(engine.get_zoom())
    },
    getZoom() {
      return engineRef.current?.get_zoom() ?? 1
    }
  }), [onViewportChange])

  // Initialize WASM engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let mounted = true

    const init = async () => {
      try {
        console.log('[GraphCanvas] Loading WASM module...')
        const wasm = await import('../pkg/graph_engine')

        console.log('[GraphCanvas] Initializing WASM...')
        await wasm.default()

        if (!mounted) return

        console.log('[GraphCanvas] Creating GraphEngine...')
        const engine = new wasm.GraphEngine()

        console.log('[GraphCanvas] init_renderer...')
        engine.init_renderer(canvas)

        // Set initial size
        const rect = canvas.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1
        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        console.log(`[GraphCanvas] resize(${canvas.width}, ${canvas.height})`)
        engine.resize(canvas.width, canvas.height)

        // Set initial theme
        console.log('[GraphCanvas] Setting theme...')
        engine.set_theme(themeToJson())

        // Load atlases (Figma S+ level GPU text/icon rendering)
        console.log('[GraphCanvas] Loading atlases...')
        try {
          const { font, icons } = await preloadAtlases('/assets')
          engine.load_font_atlas_data(font.imageData, font.width, font.height, JSON.stringify(font.metrics))
          engine.load_icon_atlas_data(icons.imageData, icons.width, icons.height, JSON.stringify(icons.coords))
          console.log('[GraphCanvas] Atlases loaded!')
        } catch (atlasErr) {
          console.warn('[GraphCanvas] Atlas loading failed (text/icons will use fallback):', atlasErr)
        }

        engineRef.current = engine
        setIsReady(true)
        setError(null)

        console.log('[GraphCanvas] WASM engine ready!')
      } catch (err) {
        console.error('[GraphCanvas] WASM init failed:', err)
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
        } catch (e) {
          // ignore
        }
        engineRef.current = null
      }
    }
  }, [])

  // Sync theme when dark mode changes
  useEffect(() => {
    if (!isReady || !engineRef.current) return
    console.log('[GraphCanvas] Theme changed, updating WASM engine')
    engineRef.current.set_theme(themeToJson())
  }, [isDark, isReady])

  // Handle resize
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas || !isReady) return

    const observer = new ResizeObserver((entries) => {
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
    if (!engine || !isReady || nodes.length === 0) return

    // Check if nodes/edges actually changed (by reference)
    const nodesChanged = nodes !== lastNodesRef.current
    const edgesChanged = edges !== lastEdgesRef.current

    if (graphLoadedRef.current && !nodesChanged && !edgesChanged) return

    graphLoadedRef.current = true
    lastNodesRef.current = nodes
    lastEdgesRef.current = edges

    try {
      console.log(`[GraphCanvas] Loading ${nodes.length} nodes, ${edges.length} edges...`)
      const json = transformToWasm(nodes, edges)
      engine.load_graph(json)
      console.log(`[GraphCanvas] Graph loaded. node_count=${engine.node_count()}, edge_count=${engine.edge_count()}`)

      // Run layout
      const options: LayoutOptions = {
        ...DEFAULT_LAYOUT_OPTIONS,
        ...layoutOptions,
      }
      console.log('[GraphCanvas] Running layout with options:', options)
      engine.run_layout(layoutOptionsToWasm(options))

      // Fit view
      console.log('[GraphCanvas] Fitting view...')
      engine.fit_view(0.1)

      console.log('[GraphCanvas] Graph ready!')
    } catch (err) {
      console.error('[GraphCanvas] Failed to load graph:', err)
      setError(err instanceof Error ? err.message : 'Failed to load graph')
    }
  }, [isReady, nodes, edges])

  // Re-run layout when layout options change
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady || !graphLoadedRef.current) return

    const options: LayoutOptions = {
      ...DEFAULT_LAYOUT_OPTIONS,
      ...layoutOptions,
    }
    console.log('[GraphCanvas] Re-running layout with new options:', options)
    engine.run_layout(layoutOptionsToWasm(options))
  }, [isReady, layoutOptions?.viewMode, layoutOptions?.spacingPercent, layoutOptions?.directionStrength, layoutOptions?.focusedNodeId])

  // Sync selection
  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady) return
    engine.set_selected(selectedNodeId ?? null)
  }, [isReady, selectedNodeId])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady) return
    engine.set_focused(focusedNodeId ?? null)
  }, [isReady, focusedNodeId])

  useEffect(() => {
    const engine = engineRef.current
    if (!engine || !isReady) return
    engine.set_dimmed(JSON.stringify(dimmedNodeIds))
  }, [isReady, dimmedNodeIds])

  // Render loop
  useEffect(() => {
    if (!isReady) return

    let running = true
    const render = () => {
      if (!running) return
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
    const engine = engineRef.current
    const canvas = canvasRef.current
    if (!engine || !canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const nodeId = engine.hit_test(x, y)
    if (nodeId) {
      onNodeClick?.(nodeId)
    } else {
      isPanningRef.current = true
      lastMouseRef.current = { x: e.clientX, y: e.clientY }
      onNodeClick?.(null)
    }
  }, [onNodeClick])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const engine = engineRef.current
    if (!engine || !isPanningRef.current) return

    const dx = e.clientX - lastMouseRef.current.x
    const dy = e.clientY - lastMouseRef.current.y
    lastMouseRef.current = { x: e.clientX, y: e.clientY }

    // WASM pan() already negates: self.x -= dx/zoom
    // So pass positive delta: drag right -> positive dx -> world moves left (canvas pans right)
    engine.pan(dx, dy)
  }, [])

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const engine = engineRef.current
    const canvas = canvasRef.current
    if (!engine || !canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const factor = e.deltaY < 0 ? 1.1 : 0.9

    engine.zoom_at(x, y, factor)
    onViewportChange?.(engine.get_zoom())
  }, [onViewportChange])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const engine = engineRef.current
    const canvas = canvasRef.current
    if (!engine || !canvas || !onNodeDoubleClick) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const nodeId = engine.hit_test(x, y)
    if (nodeId) {
      onNodeDoubleClick(nodeId)
    }
  }, [onNodeDoubleClick])

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full overflow-hidden', className)}
      style={{ background: 'hsl(var(--background))' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
      />

      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-muted-foreground">Loading WASM...</div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="text-destructive text-center p-4">
            <div className="font-semibold">WASM Error</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </div>
      )}
    </div>
  )
})
