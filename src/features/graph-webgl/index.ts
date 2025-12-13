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

export { DomOverlay } from './components/dom-overlay'
export { EdgeOverlay } from './components/edge-overlay'
// New Hybrid WebGL + DOM components
export { GraphCanvas, type LayoutPosition } from './components/graph-canvas'
// Legacy exports (for backward compatibility)
export {
  GraphWebGLVisualization as GraphVisualization,
  GraphWebGLVisualization
} from './components/graph-webgl-visualization'
export { MiniMapWebGL } from './components/minimap-webgl'
export { NodeOverlay } from './components/node-overlay'

// Transform utilities
export { applyPositions, transformPositions, transformToWasm } from './lib/transform'
// Types
export type {
  GraphData,
  GraphEngineState,
  InteractionState,
  LayoutOptions,
  LayoutResult,
  NodePosition,
  ViewportState,
  VisibleNode
} from './lib/types'
// Constants
export { DEFAULT_LAYOUT_OPTIONS, DEFAULT_VIEWPORT } from './lib/types'
export type { GraphEdge, GraphNode, GraphStats } from './lib/wasm-adapter'
export { GraphEngine as LegacyGraphEngine } from './lib/wasm-adapter'
// Hooks
export {
  useGraphEngine,
  useInteraction,
  useLegacyGraphEngine,
  useViewport
} from './model/graph-webgl.hooks'

/**
 * Feature flag to switch between WebGL and xyflow renderers.
 * Set to true to enable the WebGL renderer.
 */
export const USE_WEBGL_RENDERER = false
