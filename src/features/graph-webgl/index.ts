/**
 * Graph WebGL - Hybrid WebGL + DOM renderer for high-performance graph visualization
 *
 * This is an alternative to the xyflow-based graph feature.
 * Use the USE_WEBGL_RENDERER flag to switch between implementations.
 *
 * Architecture:
 * - WebGL Canvas (z-index 0): Node backgrounds, edges, selection rings, shadows
 * - DOM Overlay (z-index 1): Text labels, icons, badges (only visible nodes)
 * - UI Controls (z-index 2): Toolbar, minimap, zoom buttons (existing components)
 *
 * Performance targets:
 * - 60 FPS at 10,000+ nodes
 * - ~95% visual identity with current xyflow implementation
 */

// New Hybrid WebGL + DOM components
export { GraphCanvas, type LayoutPosition } from './components/graph-canvas'
export { DomOverlay } from './components/dom-overlay'
export { NodeOverlay } from './components/node-overlay'
export { EdgeOverlay } from './components/edge-overlay'
export { MiniMapWebGL } from './components/minimap-webgl'

// New hooks
export { useGraphEngine } from './model/use-graph-engine'
export { useViewport } from './model/use-viewport'
export { useInteraction } from './model/use-interaction'

// Types
export type {
  GraphEngineState,
  ViewportState,
  LayoutOptions,
  LayoutResult,
  NodePosition,
  VisibleNode,
  InteractionState,
  GraphData,
} from './lib/types'

// Transform utilities
export { transformToWasm, transformPositions, applyPositions } from './lib/transform'

// Constants
export { DEFAULT_LAYOUT_OPTIONS, DEFAULT_VIEWPORT } from './lib/types'

// Legacy exports (for backward compatibility)
export { GraphWebGLVisualization as GraphVisualization } from './components/graph-webgl-visualization'
export type { GraphEdge, GraphNode, GraphStats } from './lib/wasm-adapter'
export { GraphEngine as LegacyGraphEngine } from './lib/wasm-adapter'
export { useGraphEngine as useLegacyGraphEngine } from './model/use-graph-engine.hooks'

/**
 * Feature flag to switch between WebGL and xyflow renderers.
 * Set to true to enable the WebGL renderer.
 */
export const USE_WEBGL_RENDERER = false
