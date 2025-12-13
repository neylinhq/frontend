/**
 * Graph WebGL Hooks
 *
 * All React hooks for the graph-webgl feature consolidated in one file.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  GraphEngineState,
  InteractionState,
  LayoutOptions,
  LayoutResult,
  Node,
  Edge,
  ViewportState
} from '../lib/types'
import { DEFAULT_VIEWPORT } from '../lib/types'
import { transformToWasm, layoutOptionsToWasm, applyPositions } from '../lib/transform'
import type { GraphEngine as LegacyGraphEngineType } from '../lib/wasm-adapter'

// ─────────────────────────────────────────────────────────────────────────────
// useViewport - Viewport state management (pan/zoom)
// ─────────────────────────────────────────────────────────────────────────────

interface UseViewportOptions {
  initialViewport?: Partial<ViewportState>
  minZoom?: number
  maxZoom?: number
  onViewportChange?: (viewport: ViewportState) => void
}

export const useViewport = (options: UseViewportOptions = {}) => {
  const {
    initialViewport,
    minZoom = 0.1,
    maxZoom = 4,
    onViewportChange,
  } = options

  const [viewport, setViewport] = useState<ViewportState>({
    ...DEFAULT_VIEWPORT,
    ...initialViewport,
  })

  // Ref for accessing current viewport in callbacks
  const viewportRef = useRef(viewport)
  viewportRef.current = viewport

  // Pan by delta (screen pixels)
  const pan = useCallback((dx: number, dy: number) => {
    setViewport(v => {
      const newViewport = {
        ...v,
        x: v.x - dx / v.zoom,
        y: v.y - dy / v.zoom,
      }
      onViewportChange?.(newViewport)
      return newViewport
    })
  }, [onViewportChange])

  // Zoom at screen point
  const zoomAt = useCallback((screenX: number, screenY: number, factor: number) => {
    setViewport(v => {
      // Get world position before zoom
      const worldX = (screenX - v.width / 2) / v.zoom + v.x
      const worldY = (screenY - v.height / 2) / v.zoom + v.y

      // Apply zoom with clamping
      const newZoom = Math.max(minZoom, Math.min(maxZoom, v.zoom * factor))

      // Get new world position at same screen point
      const newWorldX = (screenX - v.width / 2) / newZoom + v.x
      const newWorldY = (screenY - v.height / 2) / newZoom + v.y

      // Adjust camera to keep point under cursor
      const newViewport = {
        ...v,
        zoom: newZoom,
        x: v.x + worldX - newWorldX,
        y: v.y + worldY - newWorldY,
      }

      onViewportChange?.(newViewport)
      return newViewport
    })
  }, [minZoom, maxZoom, onViewportChange])

  // Set zoom level directly
  const setZoom = useCallback((zoom: number) => {
    setViewport(v => {
      const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom))
      const newViewport = { ...v, zoom: newZoom }
      onViewportChange?.(newViewport)
      return newViewport
    })
  }, [minZoom, maxZoom, onViewportChange])

  // Update canvas size (no callback - resize doesn't need to notify parent)
  const setSize = useCallback((width: number, height: number) => {
    setViewport(v => ({ ...v, width, height }))
  }, [])

  // Fit viewport to bounds
  const fitToBounds = useCallback((
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    padding = 0.1
  ) => {
    setViewport(v => {
      const boundsWidth = maxX - minX
      const boundsHeight = maxY - minY

      if (boundsWidth <= 0 || boundsHeight <= 0) return v

      // Calculate zoom to fit
      const zoomX = (v.width * (1 - padding)) / boundsWidth
      const zoomY = (v.height * (1 - padding)) / boundsHeight
      const newZoom = Math.max(minZoom, Math.min(maxZoom, Math.min(zoomX, zoomY)))

      // Center on bounds
      const newViewport = {
        ...v,
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2,
        zoom: newZoom,
      }

      onViewportChange?.(newViewport)
      return newViewport
    })
  }, [minZoom, maxZoom, onViewportChange])

  // Convert screen to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number): { x: number; y: number } => {
    const v = viewportRef.current
    return {
      x: (screenX - v.width / 2) / v.zoom + v.x,
      y: (screenY - v.height / 2) / v.zoom + v.y,
    }
  }, [])

  // Convert world to screen coordinates
  const worldToScreen = useCallback((worldX: number, worldY: number): { x: number; y: number } => {
    const v = viewportRef.current
    return {
      x: (worldX - v.x) * v.zoom + v.width / 2,
      y: (worldY - v.y) * v.zoom + v.height / 2,
    }
  }, [])

  // Get visible bounds in world coordinates
  const getVisibleBounds = useCallback((): { minX: number; minY: number; maxX: number; maxY: number } => {
    const v = viewportRef.current
    const halfW = v.width / 2 / v.zoom
    const halfH = v.height / 2 / v.zoom
    return {
      minX: v.x - halfW,
      minY: v.y - halfH,
      maxX: v.x + halfW,
      maxY: v.y + halfH,
    }
  }, [])

  return {
    viewport,
    setViewport,
    pan,
    zoomAt,
    setZoom,
    setSize,
    fitToBounds,
    screenToWorld,
    worldToScreen,
    getVisibleBounds,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// useInteraction - Canvas interactions (mouse, touch, keyboard)
// ─────────────────────────────────────────────────────────────────────────────

interface UseInteractionOptions {
  canvas: HTMLCanvasElement | null
  onPan: (dx: number, dy: number) => void
  onZoom: (screenX: number, screenY: number, factor: number) => void
  onNodeClick: (nodeId: string | null) => void
  onNodeDoubleClick?: (nodeId: string) => void
  onNodeDragStart?: (nodeId: string, x: number, y: number) => void
  onNodeDrag?: (nodeId: string, x: number, y: number) => void
  onNodeDragEnd?: (nodeId: string, x: number, y: number) => void
  hitTest: (screenX: number, screenY: number) => string | null
  screenToWorld: (screenX: number, screenY: number) => { x: number; y: number }
}

export const useInteraction = ({
  canvas,
  onPan,
  onZoom,
  onNodeClick,
  onNodeDoubleClick,
  onNodeDragStart,
  onNodeDrag,
  onNodeDragEnd,
  hitTest,
  screenToWorld,
}: UseInteractionOptions) => {
  const [state, setState] = useState<InteractionState>({
    selectedNodeId: null,
    focusedNodeId: null,
    hoveredNodeId: null,
    isDragging: false,
    isPanning: false,
    dragStartX: 0,
    dragStartY: 0,
  })

  // Refs for current state in event handlers
  const stateRef = useRef(state)
  stateRef.current = state

  const lastPointerRef = useRef({ x: 0, y: 0 })
  const draggedNodeRef = useRef<string | null>(null)

  // Get canvas-relative coordinates
  const getCanvasCoords = useCallback((e: MouseEvent | Touch) => {
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [canvas])

  // Mouse down
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!canvas) return

    const { x, y } = getCanvasCoords(e)
    lastPointerRef.current = { x, y }

    // Check for node hit
    const nodeId = hitTest(x, y)

    if (e.button === 0) {
      // Left click
      if (nodeId) {
        // Start drag
        draggedNodeRef.current = nodeId
        setState(s => ({
          ...s,
          isDragging: true,
          dragStartX: x,
          dragStartY: y,
          selectedNodeId: nodeId,
        }))
        onNodeClick(nodeId)
        const world = screenToWorld(x, y)
        onNodeDragStart?.(nodeId, world.x, world.y)
      } else {
        // Start pan
        setState(s => ({
          ...s,
          isPanning: true,
          dragStartX: x,
          dragStartY: y,
        }))
        onNodeClick(null)
      }
    }
  }, [canvas, getCanvasCoords, hitTest, onNodeClick, onNodeDragStart, screenToWorld])

  // Mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvas) return

    const { x, y } = getCanvasCoords(e)
    const dx = x - lastPointerRef.current.x
    const dy = y - lastPointerRef.current.y
    lastPointerRef.current = { x, y }

    const current = stateRef.current

    if (current.isDragging && draggedNodeRef.current) {
      // Dragging node
      const world = screenToWorld(x, y)
      onNodeDrag?.(draggedNodeRef.current, world.x, world.y)
    } else if (current.isPanning) {
      // Panning viewport
      onPan(dx, dy)
    } else {
      // Hovering
      const nodeId = hitTest(x, y)
      if (nodeId !== current.hoveredNodeId) {
        setState(s => ({ ...s, hoveredNodeId: nodeId }))
        // Update cursor
        canvas.style.cursor = nodeId ? 'grab' : 'default'
      }
    }
  }, [canvas, getCanvasCoords, hitTest, onNodeDrag, onPan, screenToWorld])

  // Mouse up
  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!canvas) return

    const { x, y } = getCanvasCoords(e)
    const current = stateRef.current

    if (current.isDragging && draggedNodeRef.current) {
      const world = screenToWorld(x, y)
      onNodeDragEnd?.(draggedNodeRef.current, world.x, world.y)
    }

    draggedNodeRef.current = null
    setState(s => ({
      ...s,
      isDragging: false,
      isPanning: false,
    }))
  }, [canvas, getCanvasCoords, onNodeDragEnd, screenToWorld])

  // Double click
  const handleDoubleClick = useCallback((e: MouseEvent) => {
    if (!canvas) return

    const { x, y } = getCanvasCoords(e)
    const nodeId = hitTest(x, y)

    if (nodeId && onNodeDoubleClick) {
      onNodeDoubleClick(nodeId)
    }
  }, [canvas, getCanvasCoords, hitTest, onNodeDoubleClick])

  // Wheel (zoom)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!canvas) return

    e.preventDefault()
    const { x, y } = getCanvasCoords(e)

    // Zoom factor based on delta
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    onZoom(x, y, factor)
  }, [canvas, getCanvasCoords, onZoom])

  // Touch events
  const touchStartRef = useRef<{ x: number; y: number; distance?: number } | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!canvas || e.touches.length === 0) return

    e.preventDefault()

    if (e.touches.length === 1) {
      // Single touch - treat like mouse
      const touch = e.touches[0]
      const { x, y } = getCanvasCoords(touch)
      touchStartRef.current = { x, y }
      lastPointerRef.current = { x, y }

      const nodeId = hitTest(x, y)
      if (nodeId) {
        draggedNodeRef.current = nodeId
        setState(s => ({
          ...s,
          isDragging: true,
          selectedNodeId: nodeId,
        }))
        onNodeClick(nodeId)
        const world = screenToWorld(x, y)
        onNodeDragStart?.(nodeId, world.x, world.y)
      } else {
        setState(s => ({ ...s, isPanning: true }))
        onNodeClick(null)
      }
    } else if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = getCanvasCoords(e.touches[0])
      const touch2 = getCanvasCoords(e.touches[1])
      const distance = Math.hypot(touch2.x - touch1.x, touch2.y - touch1.y)
      const centerX = (touch1.x + touch2.x) / 2
      const centerY = (touch1.y + touch2.y) / 2
      touchStartRef.current = { x: centerX, y: centerY, distance }
    }
  }, [canvas, getCanvasCoords, hitTest, onNodeClick, onNodeDragStart, screenToWorld])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!canvas || e.touches.length === 0) return

    e.preventDefault()

    if (e.touches.length === 1) {
      const touch = e.touches[0]
      const { x, y } = getCanvasCoords(touch)
      const dx = x - lastPointerRef.current.x
      const dy = y - lastPointerRef.current.y
      lastPointerRef.current = { x, y }

      const current = stateRef.current
      if (current.isDragging && draggedNodeRef.current) {
        const world = screenToWorld(x, y)
        onNodeDrag?.(draggedNodeRef.current, world.x, world.y)
      } else if (current.isPanning) {
        onPan(dx, dy)
      }
    } else if (e.touches.length === 2 && touchStartRef.current?.distance) {
      const touch1 = getCanvasCoords(e.touches[0])
      const touch2 = getCanvasCoords(e.touches[1])
      const distance = Math.hypot(touch2.x - touch1.x, touch2.y - touch1.y)
      const centerX = (touch1.x + touch2.x) / 2
      const centerY = (touch1.y + touch2.y) / 2

      const factor = distance / touchStartRef.current.distance
      onZoom(centerX, centerY, factor)

      touchStartRef.current = { x: centerX, y: centerY, distance }
    }
  }, [canvas, getCanvasCoords, onNodeDrag, onPan, onZoom, screenToWorld])

  const handleTouchEnd = useCallback(() => {
    if (!canvas) return

    if (stateRef.current.isDragging && draggedNodeRef.current) {
      const world = screenToWorld(lastPointerRef.current.x, lastPointerRef.current.y)
      onNodeDragEnd?.(draggedNodeRef.current, world.x, world.y)
    }

    draggedNodeRef.current = null
    touchStartRef.current = null
    setState(s => ({
      ...s,
      isDragging: false,
      isPanning: false,
    }))
  }, [canvas, onNodeDragEnd, screenToWorld])

  // Keyboard shortcuts
  useEffect(() => {
    if (!canvas) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - deselect
      if (e.key === 'Escape') {
        setState(s => ({ ...s, selectedNodeId: null }))
        onNodeClick(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canvas, onNodeClick])

  // Attach event listeners
  useEffect(() => {
    if (!canvas) return

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('dblclick', handleDoubleClick)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd)

    // Prevent context menu on canvas
    const handleContextMenu = (e: Event) => e.preventDefault()
    canvas.addEventListener('contextmenu', handleContextMenu)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('dblclick', handleDoubleClick)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [
    canvas,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ])

  // Public setters
  const setSelectedNodeId = useCallback((nodeId: string | null) => {
    setState(s => ({ ...s, selectedNodeId: nodeId }))
  }, [])

  const setFocusedNodeId = useCallback((nodeId: string | null) => {
    setState(s => ({ ...s, focusedNodeId: nodeId }))
  }, [])

  return {
    state,
    setSelectedNodeId,
    setFocusedNodeId,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// useGraphEngine - WASM graph engine management (new implementation)
// ─────────────────────────────────────────────────────────────────────────────

// WASM module type (will be generated by wasm-pack)
interface GraphEngineWasm {
  new(): GraphEngineWasm
  init_renderer(canvas: HTMLCanvasElement): void
  resize(width: number, height: number): void
  load_graph(json: string): void
  run_layout(optionsJson: string): string
  init_layout(optionsJson: string): void
  step_layout(iterations: number): string
  is_layout_running(): boolean
  is_converged(): boolean
  hit_test(screenX: number, screenY: number): string | null
  update_node_position(id: string, x: number, y: number): void
  get_all_positions(): string
  get_visible_nodes(): string
  set_selected(nodeId: string | null): void
  set_focused(nodeId: string | null): void
  set_dimmed(nodeIds: string): void
  pan(dx: number, dy: number): void
  zoom_at(screenX: number, screenY: number, factor: number): void
  get_zoom(): number
  fit_view(padding: number): void
  get_viewport(): string
  set_viewport(json: string): void
  render(): void
  node_count(): number
  edge_count(): number
}

interface WasmModule {
  GraphEngine: new () => GraphEngineWasm
}

// Singleton for WASM module
let wasmModule: WasmModule | null = null
let wasmLoadPromise: Promise<WasmModule> | null = null
let wasmInitialized = false

const loadWasm = async (): Promise<WasmModule> => {
  if (wasmModule && wasmInitialized) return wasmModule

  if (wasmLoadPromise) return wasmLoadPromise

  wasmLoadPromise = (async () => {
    try {
      // Dynamic import of WASM module
      // The path will be resolved by Vite's WASM plugin
      const module = await import('../pkg/graph_engine')

      // Initialize WASM before using GraphEngine
      // The default export is the init function that loads the .wasm file
      if (!wasmInitialized && module.default) {
        await module.default()
        wasmInitialized = true
      }

      wasmModule = module as unknown as WasmModule
      return wasmModule
    } catch (error) {
      wasmLoadPromise = null
      wasmInitialized = false
      throw error
    }
  })()

  return wasmLoadPromise
}

interface UseGraphEngineOptions {
  canvas: HTMLCanvasElement | null
  onPositionsUpdate?: (nodes: Node[]) => void
}

export const useGraphEngine = ({ canvas, onPositionsUpdate }: UseGraphEngineOptions) => {
  const engineRef = useRef<GraphEngineWasm | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const [state, setState] = useState<GraphEngineState>({
    isReady: false,
    isLoading: true,
    error: null,
    nodeCount: 0,
    edgeCount: 0,
  })

  // Store nodes for position updates
  const nodesRef = useRef<Node[]>([])

  // Initialize WASM and engine
  useEffect(() => {
    if (!canvas) return

    let mounted = true

    const init = async () => {
      try {
        const wasm = await loadWasm()
        if (!mounted) return

        const engine = new wasm.GraphEngine()
        engine.init_renderer(canvas)
        engine.resize(canvas.width, canvas.height)

        engineRef.current = engine

        setState({
          isReady: true,
          isLoading: false,
          error: null,
          nodeCount: 0,
          edgeCount: 0,
        })
      } catch (error) {
        if (!mounted) return
        setState(s => ({
          ...s,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load WASM',
        }))
      }
    }

    init()

    return () => {
      mounted = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [canvas])

  // Load graph data
  const loadGraph = useCallback((nodes: Node[], edges: Edge[]) => {
    const engine = engineRef.current
    if (!engine) return

    nodesRef.current = nodes
    const json = transformToWasm(nodes, edges)
    engine.load_graph(json)

    setState(s => ({
      ...s,
      nodeCount: engine.node_count(),
      edgeCount: engine.edge_count(),
    }))
  }, [])

  // Run layout (blocking)
  const runLayout = useCallback((options: LayoutOptions): LayoutResult | null => {
    const engine = engineRef.current
    if (!engine) return null

    const resultJson = engine.run_layout(layoutOptionsToWasm(options))
    const result = JSON.parse(resultJson) as LayoutResult

    // Update positions
    if (onPositionsUpdate) {
      const positionsJson = engine.get_all_positions()
      const updatedNodes = applyPositions(nodesRef.current, positionsJson)
      nodesRef.current = updatedNodes
      onPositionsUpdate(updatedNodes)
    }

    return result
  }, [onPositionsUpdate])

  // Start animated layout
  const startAnimatedLayout = useCallback((options: LayoutOptions) => {
    const engine = engineRef.current
    if (!engine) return

    engine.init_layout(layoutOptionsToWasm(options))

    // Animation loop
    const animate = () => {
      if (!engine.is_layout_running()) {
        animationFrameRef.current = null
        return
      }

      // Run 10 iterations per frame
      engine.step_layout(10)
      engine.render()

      // Update positions callback
      if (onPositionsUpdate) {
        const positionsJson = engine.get_all_positions()
        const updatedNodes = applyPositions(nodesRef.current, positionsJson)
        nodesRef.current = updatedNodes
        onPositionsUpdate(updatedNodes)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [onPositionsUpdate])

  // Stop animated layout
  const stopLayout = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  // Render frame
  const render = useCallback(() => {
    engineRef.current?.render()
  }, [])

  // Resize
  const resize = useCallback((width: number, height: number) => {
    engineRef.current?.resize(width, height)
  }, [])

  // Hit test
  const hitTest = useCallback((screenX: number, screenY: number): string | null => {
    return engineRef.current?.hit_test(screenX, screenY) ?? null
  }, [])

  // Update node position (drag)
  const updateNodePosition = useCallback((id: string, x: number, y: number) => {
    engineRef.current?.update_node_position(id, x, y)
  }, [])

  // Selection
  const setSelected = useCallback((nodeId: string | null) => {
    engineRef.current?.set_selected(nodeId)
  }, [])

  const setFocused = useCallback((nodeId: string | null) => {
    engineRef.current?.set_focused(nodeId)
  }, [])

  const setDimmed = useCallback((nodeIds: string[]) => {
    engineRef.current?.set_dimmed(JSON.stringify(nodeIds))
  }, [])

  // Viewport
  const pan = useCallback((dx: number, dy: number) => {
    engineRef.current?.pan(dx, dy)
  }, [])

  const zoomAt = useCallback((screenX: number, screenY: number, factor: number) => {
    engineRef.current?.zoom_at(screenX, screenY, factor)
  }, [])

  const getZoom = useCallback((): number => {
    return engineRef.current?.get_zoom() ?? 1
  }, [])

  const fitView = useCallback((padding = 0.1) => {
    engineRef.current?.fit_view(padding)
  }, [])

  // Get visible nodes for DOM overlay
  const getVisibleNodes = useCallback((): string[] => {
    const json = engineRef.current?.get_visible_nodes()
    if (!json) return []
    return JSON.parse(json) as string[]
  }, [])

  return {
    state,
    loadGraph,
    runLayout,
    startAnimatedLayout,
    stopLayout,
    render,
    resize,
    hitTest,
    updateNodePosition,
    setSelected,
    setFocused,
    setDimmed,
    pan,
    zoomAt,
    getZoom,
    fitView,
    getVisibleNodes,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// useLegacyGraphEngine - Legacy WASM graph engine hook (for backward compat)
// ─────────────────────────────────────────────────────────────────────────────

export interface UseLegacyGraphEngineOptions {
  autoInit?: boolean
}

export interface UseLegacyGraphEngineReturn {
  engine: LegacyGraphEngineType | null
  ready: boolean
  error: Error | null
  initEngine: (canvas: HTMLCanvasElement) => Promise<void>
}

export const useLegacyGraphEngine = (
  options: UseLegacyGraphEngineOptions = {}
): UseLegacyGraphEngineReturn => {
  const [engine, setEngine] = useState<LegacyGraphEngineType | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const initPromiseRef = useRef<Promise<void> | null>(null)

  const initEngine = async (canvas: HTMLCanvasElement) => {
    // Prevent multiple initializations
    if (initPromiseRef.current) {
      return initPromiseRef.current
    }

    const promise = (async () => {
      try {
        setError(null)

        // Dynamic import for code-splitting
        const { GraphEngine } = await import('../lib/wasm-adapter')

        const engineInstance = new GraphEngine()
        await engineInstance.init(canvas)

        setEngine(engineInstance)
        setReady(true)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to initialize graph engine')
        setError(error)
        throw error
      }
    })()

    initPromiseRef.current = promise
    return promise
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (engine) {
        engine.dispose()
      }
    }
  }, [engine])

  return {
    engine,
    ready,
    error,
    initEngine
  }
}
