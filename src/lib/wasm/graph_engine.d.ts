/* tslint:disable */
/* eslint-disable */

export class GraphEngine {
  free(): void
  [Symbol.dispose](): void
  /**
   * Create a new GraphEngine instance
   */
  constructor()
  /**
   * Initialize WebGL renderer with canvas element
   *
   * # Arguments
   * * `canvas` - HTML canvas element for WebGL rendering
   *
   * # Returns
   * * Result with unit or error message
   */
  initRenderer(canvas: HTMLCanvasElement): void
  /**
   * Load graph data from JSON
   *
   * # Arguments
   * * `json_data` - JSON string containing nodes and edges
   *
   * # Returns
   * * Result with unit or error message
   */
  loadGraph(json_data: string): void
  /**
   * Export graph data to JSON
   *
   * # Returns
   * * JSON string with graph data
   */
  exportGraph(): string
  /**
   * Run force-directed layout algorithm
   *
   * # Arguments
   * * `iterations` - Number of layout iterations (default: 150)
   *
   * # Returns
   * * Result with unit or error message
   */
  runLayout(iterations?: number | null): void
  /**
   * Render current frame
   *
   * # Returns
   * * Result with unit or error message
   */
  render(): void
  /**
   * Set view transformation (pan and zoom)
   *
   * # Arguments
   * * `pan_x` - Horizontal pan offset
   * * `pan_y` - Vertical pan offset
   * * `zoom` - Zoom level (1.0 = 100%)
   */
  setView(pan_x: number, pan_y: number, zoom: number): void
  /**
   * Set canvas resolution
   *
   * # Arguments
   * * `width` - Canvas width in pixels
   * * `height` - Canvas height in pixels
   */
  setResolution(width: number, height: number): void
  /**
   * Hit test - find node at screen position
   *
   * # Arguments
   * * `screen_x` - Screen X coordinate
   * * `screen_y` - Screen Y coordinate
   *
   * # Returns
   * * Node ID if found, null otherwise
   */
  hitTest(_screen_x: number, _screen_y: number): string | undefined
  /**
   * Select nodes by IDs
   *
   * # Arguments
   * * `node_ids` - JSON array of node IDs
   */
  selectNodes(node_ids_json: string): void
  /**
   * Focus on a specific node
   *
   * # Arguments
   * * `node_id` - Node ID to focus, or null to clear focus
   */
  focusNode(node_id?: string | null): void
  /**
   * Get number of nodes in graph
   */
  getNodeCount(): number
  /**
   * Get number of edges in graph
   */
  getEdgeCount(): number
  /**
   * Get rendering statistics
   *
   * # Returns
   * * JSON string with statistics
   */
  getStats(): string
}

/**
 * Initialize the WASM module
 * This is called automatically when importing the module in JavaScript
 */
export function init(): void

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module

export interface InitOutput {
  readonly memory: WebAssembly.Memory
  readonly __wbg_graphengine_free: (a: number, b: number) => void
  readonly graphengine_new: () => number
  readonly graphengine_initRenderer: (a: number, b: number, c: number) => void
  readonly graphengine_loadGraph: (a: number, b: number, c: number, d: number) => void
  readonly graphengine_exportGraph: (a: number, b: number) => void
  readonly graphengine_runLayout: (a: number, b: number, c: number) => void
  readonly graphengine_render: (a: number, b: number) => void
  readonly graphengine_setView: (a: number, b: number, c: number, d: number) => void
  readonly graphengine_setResolution: (a: number, b: number, c: number) => void
  readonly graphengine_hitTest: (a: number, b: number, c: number, d: number) => void
  readonly graphengine_selectNodes: (a: number, b: number, c: number, d: number) => void
  readonly graphengine_focusNode: (a: number, b: number, c: number) => void
  readonly graphengine_getNodeCount: (a: number) => number
  readonly graphengine_getEdgeCount: (a: number) => number
  readonly graphengine_getStats: (a: number, b: number) => void
  readonly init: () => void
  readonly __wbindgen_export: (a: number) => void
  readonly __wbindgen_export2: (a: number, b: number) => number
  readonly __wbindgen_export3: (a: number, b: number, c: number, d: number) => number
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number
  readonly __wbindgen_export4: (a: number, b: number, c: number) => void
  readonly __wbindgen_start: () => void
}

export type SyncInitInput = BufferSource | WebAssembly.Module

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?:
    | { module_or_path: InitInput | Promise<InitInput> }
    | InitInput
    | Promise<InitInput>
): Promise<InitOutput>
