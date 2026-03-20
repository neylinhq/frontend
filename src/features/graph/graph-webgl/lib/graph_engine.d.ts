/* tslint:disable */
/* eslint-disable */

export class GraphEngine {
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Get edge count
   */
  edge_count(): number;
  /**
   * Load graph from JSON string
   */
  load_graph(json: string): void;
  /**
   * Get node count
   */
  node_count(): number;
  /**
   * Run complete layout and return result as JSON
   */
  run_layout(options_json: string): string;
  /**
   * Set dimmed nodes
   */
  set_dimmed(node_ids: string): void;
  /**
   * Initialize animated layout
   */
  init_layout(options_json: string): void;
  /**
   * Set focused node
   */
  set_focused(node_id?: string | null): void;
  /**
   * Single animation step (N iterations)
   * Returns positions as JSON
   */
  step_layout(iterations: number): string;
  /**
   * Get viewport state as JSON
   */
  get_viewport(): string;
  /**
   * Check if layout converged
   */
  is_converged(): boolean;
  /**
   * Set selected node
   */
  set_selected(node_id?: string | null): void;
  /**
   * Set viewport state from JSON
   */
  set_viewport(json: string): void;
  /**
   * Initialize renderer with a canvas element
   */
  init_renderer(canvas: HTMLCanvasElement): void;
  /**
   * Set hovered edge badge ID (for hover highlight). Pass empty string to clear.
   */
  set_hovered_edge(edge_id: string): void;
  /**
   * Get all node positions as JSON
   */
  get_all_positions(): string;
  /**
   * Get visible node IDs for DOM overlay
   */
  get_visible_nodes(): string;
  /**
   * Check if layout animation is running
   */
  is_layout_running(): boolean;
  /**
   * Set render parameters (style + quality knobs) from JSON.
   */
  set_render_params(json: string): void;
  /**
   * Set selected nodes (multi-select)
   */
  set_selected_nodes(node_ids: string): void;
  /**
   * Hit test edge badge at screen coordinates.
   * Returns JSON: { edgeId, screenX, screenY } or null.
   */
  hit_test_edge_badge(screen_x: number, screen_y: number): string | undefined;
  /**
   * Load SDF font atlas from tiny-sdf format for GPU text rendering
   * This uses single-channel SDF from Mapbox's tiny-sdf library
   * Called once at startup or when font changes
   */
  load_sdf_atlas_data(image_data: Uint8Array, width: number, height: number, metrics_json: string): void;
  /**
   * Load MSDF font atlas for GPU text rendering
   * Called once at startup with atlas image data and JSON metrics
   */
  load_font_atlas_data(image_data: Uint8Array, width: number, height: number, metrics_json: string): void;
  /**
   * Load icon sprite atlas for GPU icon rendering
   * Called once at startup with atlas image data and JSON coords
   */
  load_icon_atlas_data(image_data: Uint8Array, width: number, height: number, icons_json: string): void;
  /**
   * Update single node position (for drag)
   */
  update_node_position(id: string, x: number, y: number): void;
  /**
   * Load bitmap font atlas from Canvas 2D rasterized glyphs
   * Image data is RGBA. Uses simple texture sampling (no SDF math).
   */
  load_bitmap_atlas_data(image_data: Uint8Array, width: number, height: number, metrics_json: string): void;
  /**
   * Create a new graph engine
   */
  constructor();
  /**
   * Pan the viewport
   */
  pan(dx: number, dy: number): void;
  /**
   * Render the graph
   */
  render(): void;
  /**
   * Resize the canvas
   * Returns false if dimensions are invalid
   */
  resize(width: number, height: number): boolean;
  /**
   * Set device pixel ratio for correct screen-space rendering
   */
  set_dpr(dpr: number): void;
  /**
   * Zoom at screen point
   */
  zoom_at(screen_x: number, screen_y: number, factor: number): void;
  /**
   * Fit viewport to show all nodes
   */
  fit_view(padding: number): void;
  /**
   * Get current zoom level
   */
  get_zoom(): number;
  /**
   * Hit test at screen coordinates
   * Returns node ID if hit, null otherwise
   */
  hit_test(screen_x: number, screen_y: number): string | undefined;
  /**
   * Set theme colors from JSON
   * Called from JS when theme changes (light/dark mode toggle, etc.)
   * Note: Does not call update_render_data() to avoid wasm-bindgen borrow conflicts.
   * Theme is used directly in render() so it takes effect on next frame.
   */
  set_theme(json: string): void;
}

/**
 * Initialize panic hook for better error messages in browser console
 */
export function init(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_graphengine_free: (a: number, b: number) => void;
  readonly graphengine_edge_count: (a: number) => number;
  readonly graphengine_fit_view: (a: number, b: number) => void;
  readonly graphengine_get_all_positions: (a: number) => [number, number];
  readonly graphengine_get_viewport: (a: number) => [number, number];
  readonly graphengine_get_visible_nodes: (a: number) => [number, number];
  readonly graphengine_get_zoom: (a: number) => number;
  readonly graphengine_hit_test: (a: number, b: number, c: number) => [number, number];
  readonly graphengine_hit_test_edge_badge: (a: number, b: number, c: number) => [number, number];
  readonly graphengine_init_layout: (a: number, b: number, c: number) => [number, number];
  readonly graphengine_init_renderer: (a: number, b: any) => [number, number];
  readonly graphengine_is_converged: (a: number) => number;
  readonly graphengine_is_layout_running: (a: number) => number;
  readonly graphengine_load_bitmap_atlas_data: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly graphengine_load_font_atlas_data: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly graphengine_load_graph: (a: number, b: number, c: number) => [number, number];
  readonly graphengine_load_icon_atlas_data: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly graphengine_load_sdf_atlas_data: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number];
  readonly graphengine_new: () => number;
  readonly graphengine_node_count: (a: number) => number;
  readonly graphengine_pan: (a: number, b: number, c: number) => void;
  readonly graphengine_render: (a: number) => void;
  readonly graphengine_resize: (a: number, b: number, c: number) => number;
  readonly graphengine_run_layout: (a: number, b: number, c: number) => [number, number, number, number];
  readonly graphengine_set_dimmed: (a: number, b: number, c: number) => void;
  readonly graphengine_set_dpr: (a: number, b: number) => void;
  readonly graphengine_set_focused: (a: number, b: number, c: number) => void;
  readonly graphengine_set_hovered_edge: (a: number, b: number, c: number) => void;
  readonly graphengine_set_render_params: (a: number, b: number, c: number) => [number, number];
  readonly graphengine_set_selected: (a: number, b: number, c: number) => void;
  readonly graphengine_set_selected_nodes: (a: number, b: number, c: number) => void;
  readonly graphengine_set_theme: (a: number, b: number, c: number) => [number, number];
  readonly graphengine_set_viewport: (a: number, b: number, c: number) => [number, number];
  readonly graphengine_step_layout: (a: number, b: number) => [number, number];
  readonly graphengine_update_node_position: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly graphengine_zoom_at: (a: number, b: number, c: number, d: number) => void;
  readonly init: () => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
