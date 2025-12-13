let wasm

function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc()
  wasm.__wbindgen_externrefs.set(idx, obj)
  return idx
}

function getArrayF32FromWasm0(ptr, len) {
  ptr = ptr >>> 0
  return getFloat32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len)
}

function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len)
}

let cachedDataViewMemory0 = null
function getDataViewMemory0() {
  if (
    cachedDataViewMemory0 === null ||
    cachedDataViewMemory0.buffer.detached === true ||
    (cachedDataViewMemory0.buffer.detached === undefined &&
      cachedDataViewMemory0.buffer !== wasm.memory.buffer)
  ) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer)
  }
  return cachedDataViewMemory0
}

let cachedFloat32ArrayMemory0 = null
function getFloat32ArrayMemory0() {
  if (cachedFloat32ArrayMemory0 === null || cachedFloat32ArrayMemory0.byteLength === 0) {
    cachedFloat32ArrayMemory0 = new Float32Array(wasm.memory.buffer)
  }
  return cachedFloat32ArrayMemory0
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0
  return decodeText(ptr, len)
}

let cachedUint8ArrayMemory0 = null
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer)
  }
  return cachedUint8ArrayMemory0
}

function handleError(f, args) {
  try {
    return f.apply(this, args)
  } catch (e) {
    const idx = addToExternrefTable0(e)
    wasm.__wbindgen_exn_store(idx)
  }
}

function isLikeNone(x) {
  return x === undefined || x === null
}

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1, 1) >>> 0
  getUint8ArrayMemory0().set(arg, ptr / 1)
  WASM_VECTOR_LEN = arg.length
  return ptr
}

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg)
    const ptr = malloc(buf.length, 1) >>> 0
    getUint8ArrayMemory0()
      .subarray(ptr, ptr + buf.length)
      .set(buf)
    WASM_VECTOR_LEN = buf.length
    return ptr
  }

  let len = arg.length
  let ptr = malloc(len, 1) >>> 0

  const mem = getUint8ArrayMemory0()

  let offset = 0

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset)
    if (code > 0x7f) {
      break
    }
    mem[ptr + offset] = code
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset)
    }
    ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len)
    const ret = cachedTextEncoder.encodeInto(arg, view)

    offset += ret.written
    ptr = realloc(ptr, len, offset, 1) >>> 0
  }

  WASM_VECTOR_LEN = offset
  return ptr
}

function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx)
  wasm.__externref_table_dealloc(idx)
  return value
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true })
cachedTextDecoder.decode()
const MAX_SAFARI_DECODE_BYTES = 2146435072
let numBytesDecoded = 0
function decodeText(ptr, len) {
  numBytesDecoded += len
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true })
    cachedTextDecoder.decode()
    numBytesDecoded = len
  }
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len))
}

const cachedTextEncoder = new TextEncoder()

if (!('encodeInto' in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = (arg, view) => {
    const buf = cachedTextEncoder.encode(arg)
    view.set(buf)
    return {
      read: arg.length,
      written: buf.length
    }
  }
}

let WASM_VECTOR_LEN = 0

const GraphEngineFinalization =
  typeof FinalizationRegistry === 'undefined'
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_graphengine_free(ptr >>> 0, 1))

/**
 * Main graph engine exposed to JavaScript
 */
export class GraphEngine {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr
    this.__wbg_ptr = 0
    GraphEngineFinalization.unregister(this)
    return ptr
  }
  free() {
    const ptr = this.__destroy_into_raw()
    wasm.__wbg_graphengine_free(ptr, 0)
  }
  /**
   * Get edge count
   * @returns {number}
   */
  edge_count() {
    const ret = wasm.graphengine_edge_count(this.__wbg_ptr)
    return ret >>> 0
  }
  /**
   * Load graph from JSON string
   * @param {string} json
   */
  load_graph(json) {
    const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.graphengine_load_graph(this.__wbg_ptr, ptr0, len0)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }
  /**
   * Get node count
   * @returns {number}
   */
  node_count() {
    const ret = wasm.graphengine_node_count(this.__wbg_ptr)
    return ret >>> 0
  }
  /**
   * Run complete layout and return result as JSON
   * @param {string} options_json
   * @returns {string}
   */
  run_layout(options_json) {
    let deferred3_0
    let deferred3_1
    try {
      const ptr0 = passStringToWasm0(options_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
      const len0 = WASM_VECTOR_LEN
      const ret = wasm.graphengine_run_layout(this.__wbg_ptr, ptr0, len0)
      var ptr2 = ret[0]
      var len2 = ret[1]
      if (ret[3]) {
        ptr2 = 0
        len2 = 0
        throw takeFromExternrefTable0(ret[2])
      }
      deferred3_0 = ptr2
      deferred3_1 = len2
      return getStringFromWasm0(ptr2, len2)
    } finally {
      wasm.__wbindgen_free(deferred3_0, deferred3_1, 1)
    }
  }
  /**
   * Set dimmed nodes
   * @param {string} node_ids
   */
  set_dimmed(node_ids) {
    const ptr0 = passStringToWasm0(node_ids, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    wasm.graphengine_set_dimmed(this.__wbg_ptr, ptr0, len0)
  }
  /**
   * Initialize animated layout
   * @param {string} options_json
   */
  init_layout(options_json) {
    const ptr0 = passStringToWasm0(options_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.graphengine_init_layout(this.__wbg_ptr, ptr0, len0)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }
  /**
   * Set focused node
   * @param {string | null} [node_id]
   */
  set_focused(node_id) {
    var ptr0 = isLikeNone(node_id)
      ? 0
      : passStringToWasm0(node_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    var len0 = WASM_VECTOR_LEN
    wasm.graphengine_set_focused(this.__wbg_ptr, ptr0, len0)
  }
  /**
   * Single animation step (N iterations)
   * Returns positions as JSON
   * @param {number} iterations
   * @returns {string}
   */
  step_layout(iterations) {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.graphengine_step_layout(this.__wbg_ptr, iterations)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
  /**
   * Get viewport state as JSON
   * @returns {string}
   */
  get_viewport() {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.graphengine_get_viewport(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
  /**
   * Check if layout converged
   * @returns {boolean}
   */
  is_converged() {
    const ret = wasm.graphengine_is_converged(this.__wbg_ptr)
    return ret !== 0
  }
  /**
   * Set selected node
   * @param {string | null} [node_id]
   */
  set_selected(node_id) {
    var ptr0 = isLikeNone(node_id)
      ? 0
      : passStringToWasm0(node_id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    var len0 = WASM_VECTOR_LEN
    wasm.graphengine_set_selected(this.__wbg_ptr, ptr0, len0)
  }
  /**
   * Set viewport state from JSON
   * @param {string} json
   */
  set_viewport(json) {
    const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.graphengine_set_viewport(this.__wbg_ptr, ptr0, len0)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }
  /**
   * Initialize renderer with a canvas element
   * @param {HTMLCanvasElement} canvas
   */
  init_renderer(canvas) {
    const ret = wasm.graphengine_init_renderer(this.__wbg_ptr, canvas)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }
  /**
   * Get all node positions as JSON
   * @returns {string}
   */
  get_all_positions() {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.graphengine_get_all_positions(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
  /**
   * Get visible node IDs for DOM overlay
   * @returns {string}
   */
  get_visible_nodes() {
    let deferred1_0
    let deferred1_1
    try {
      const ret = wasm.graphengine_get_visible_nodes(this.__wbg_ptr)
      deferred1_0 = ret[0]
      deferred1_1 = ret[1]
      return getStringFromWasm0(ret[0], ret[1])
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1)
    }
  }
  /**
   * Check if layout animation is running
   * @returns {boolean}
   */
  is_layout_running() {
    const ret = wasm.graphengine_is_layout_running(this.__wbg_ptr)
    return ret !== 0
  }
  /**
   * Load SDF font atlas from tiny-sdf format for GPU text rendering
   * This uses single-channel SDF from Mapbox's tiny-sdf library
   * Called once at startup or when font changes
   * @param {Uint8Array} image_data
   * @param {number} width
   * @param {number} height
   * @param {string} metrics_json
   */
  load_sdf_atlas_data(image_data, width, height, metrics_json) {
    const ptr0 = passArray8ToWasm0(image_data, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ptr1 = passStringToWasm0(metrics_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    const ret = wasm.graphengine_load_sdf_atlas_data(
      this.__wbg_ptr,
      ptr0,
      len0,
      width,
      height,
      ptr1,
      len1
    )
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }
  /**
   * Load MSDF font atlas for GPU text rendering
   * Called once at startup with atlas image data and JSON metrics
   * @param {Uint8Array} image_data
   * @param {number} width
   * @param {number} height
   * @param {string} metrics_json
   */
  load_font_atlas_data(image_data, width, height, metrics_json) {
    const ptr0 = passArray8ToWasm0(image_data, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ptr1 = passStringToWasm0(metrics_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    const ret = wasm.graphengine_load_font_atlas_data(
      this.__wbg_ptr,
      ptr0,
      len0,
      width,
      height,
      ptr1,
      len1
    )
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }
  /**
   * Load icon sprite atlas for GPU icon rendering
   * Called once at startup with atlas image data and JSON coords
   * @param {Uint8Array} image_data
   * @param {number} width
   * @param {number} height
   * @param {string} icons_json
   */
  load_icon_atlas_data(image_data, width, height, icons_json) {
    const ptr0 = passArray8ToWasm0(image_data, wasm.__wbindgen_malloc)
    const len0 = WASM_VECTOR_LEN
    const ptr1 = passStringToWasm0(icons_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    const ret = wasm.graphengine_load_icon_atlas_data(
      this.__wbg_ptr,
      ptr0,
      len0,
      width,
      height,
      ptr1,
      len1
    )
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }
  /**
   * Update single node position (for drag)
   * @param {string} id
   * @param {number} x
   * @param {number} y
   */
  update_node_position(id, x, y) {
    const ptr0 = passStringToWasm0(id, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    wasm.graphengine_update_node_position(this.__wbg_ptr, ptr0, len0, x, y)
  }
  /**
   * Create a new graph engine
   */
  constructor() {
    const ret = wasm.graphengine_new()
    this.__wbg_ptr = ret >>> 0
    GraphEngineFinalization.register(this, this.__wbg_ptr, this)
    return this
  }
  /**
   * Pan the viewport
   * @param {number} dx
   * @param {number} dy
   */
  pan(dx, dy) {
    wasm.graphengine_pan(this.__wbg_ptr, dx, dy)
  }
  /**
   * Render the graph
   */
  render() {
    wasm.graphengine_render(this.__wbg_ptr)
  }
  /**
   * Resize the canvas
   * Returns false if dimensions are invalid
   * @param {number} width
   * @param {number} height
   * @returns {boolean}
   */
  resize(width, height) {
    const ret = wasm.graphengine_resize(this.__wbg_ptr, width, height)
    return ret !== 0
  }
  /**
   * Zoom at screen point
   * @param {number} screen_x
   * @param {number} screen_y
   * @param {number} factor
   */
  zoom_at(screen_x, screen_y, factor) {
    wasm.graphengine_zoom_at(this.__wbg_ptr, screen_x, screen_y, factor)
  }
  /**
   * Fit viewport to show all nodes
   * @param {number} padding
   */
  fit_view(padding) {
    wasm.graphengine_fit_view(this.__wbg_ptr, padding)
  }
  /**
   * Get current zoom level
   * @returns {number}
   */
  get_zoom() {
    const ret = wasm.graphengine_get_zoom(this.__wbg_ptr)
    return ret
  }
  /**
   * Hit test at screen coordinates
   * Returns node ID if hit, null otherwise
   * @param {number} screen_x
   * @param {number} screen_y
   * @returns {string | undefined}
   */
  hit_test(screen_x, screen_y) {
    const ret = wasm.graphengine_hit_test(this.__wbg_ptr, screen_x, screen_y)
    let v1
    if (ret[0] !== 0) {
      v1 = getStringFromWasm0(ret[0], ret[1]).slice()
      wasm.__wbindgen_free(ret[0], ret[1] * 1, 1)
    }
    return v1
  }
  /**
   * Set theme colors from JSON
   * Called from JS when theme changes (light/dark mode toggle, etc.)
   * Note: Does not call update_render_data() to avoid wasm-bindgen borrow conflicts.
   * Theme is used directly in render() so it takes effect on next frame.
   * @param {string} json
   */
  set_theme(json) {
    const ptr0 = passStringToWasm0(json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len0 = WASM_VECTOR_LEN
    const ret = wasm.graphengine_set_theme(this.__wbg_ptr, ptr0, len0)
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0])
    }
  }
}
if (Symbol.dispose) {
  GraphEngine.prototype[Symbol.dispose] = GraphEngine.prototype.free
}

/**
 * Initialize panic hook for better error messages in browser console
 */
export function init() {
  wasm.init()
}

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default'])

async function __wbg_load(module, imports) {
  if (typeof Response === 'function' && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      try {
        return await WebAssembly.instantiateStreaming(module, imports)
      } catch (e) {
        const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type)

        if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
          console.warn(
            '`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n',
            e
          )
        } else {
          throw e
        }
      }
    }

    const bytes = await module.arrayBuffer()
    return await WebAssembly.instantiate(bytes, imports)
  } else {
    const instance = await WebAssembly.instantiate(module, imports)

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module }
    } else {
      return instance
    }
  }
}

function __wbg_get_imports() {
  const imports = {}
  imports.wbg = {}
  imports.wbg.__wbg___wbindgen_boolean_get_dea25b33882b895b = arg0 => {
    const v = arg0
    const ret = typeof v === 'boolean' ? v : undefined
    return isLikeNone(ret) ? 0xffffff : ret ? 1 : 0
  }
  imports.wbg.__wbg___wbindgen_is_undefined_f6b95eab589e0269 = arg0 => {
    const ret = arg0 === undefined
    return ret
  }
  imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = (arg0, arg1) => {
    throw new Error(getStringFromWasm0(arg0, arg1))
  }
  imports.wbg.__wbg_activeTexture_59810c16ea8d6e34 = (arg0, arg1) => {
    arg0.activeTexture(arg1 >>> 0)
  }
  imports.wbg.__wbg_attachShader_ce575704294db9cc = (arg0, arg1, arg2) => {
    arg0.attachShader(arg1, arg2)
  }
  imports.wbg.__wbg_bindBuffer_c24c31cbec41cb21 = (arg0, arg1, arg2) => {
    arg0.bindBuffer(arg1 >>> 0, arg2)
  }
  imports.wbg.__wbg_bindTexture_6ed714c0afe8b8d1 = (arg0, arg1, arg2) => {
    arg0.bindTexture(arg1 >>> 0, arg2)
  }
  imports.wbg.__wbg_bindVertexArray_ced27387a0718508 = (arg0, arg1) => {
    arg0.bindVertexArray(arg1)
  }
  imports.wbg.__wbg_blendFunc_046483861de36edd = (arg0, arg1, arg2) => {
    arg0.blendFunc(arg1 >>> 0, arg2 >>> 0)
  }
  imports.wbg.__wbg_bufferData_69dbeea8e1d79f7b = (arg0, arg1, arg2, arg3) => {
    arg0.bufferData(arg1 >>> 0, arg2, arg3 >>> 0)
  }
  imports.wbg.__wbg_call_abb4ff46ce38be40 = function () {
    return handleError((arg0, arg1) => {
      const ret = arg0.call(arg1)
      return ret
    }, arguments)
  }
  imports.wbg.__wbg_clearColor_66e5dad6393f32ec = (arg0, arg1, arg2, arg3, arg4) => {
    arg0.clearColor(arg1, arg2, arg3, arg4)
  }
  imports.wbg.__wbg_clear_00ac71df5db8ab17 = (arg0, arg1) => {
    arg0.clear(arg1 >>> 0)
  }
  imports.wbg.__wbg_compileShader_ba337110bed419e1 = (arg0, arg1) => {
    arg0.compileShader(arg1)
  }
  imports.wbg.__wbg_createBuffer_465b645a46535184 = arg0 => {
    const ret = arg0.createBuffer()
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_createProgram_ffe9d4a2cba210f4 = arg0 => {
    const ret = arg0.createProgram()
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_createShader_f88f9b82748ef6c0 = (arg0, arg1) => {
    const ret = arg0.createShader(arg1 >>> 0)
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_createTexture_41211a4e8ae0afec = arg0 => {
    const ret = arg0.createTexture()
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_createVertexArray_997b3c5b1091afd9 = arg0 => {
    const ret = arg0.createVertexArray()
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_drawArraysInstanced_5a3cccf98d769264 = (arg0, arg1, arg2, arg3, arg4) => {
    arg0.drawArraysInstanced(arg1 >>> 0, arg2, arg3, arg4)
  }
  imports.wbg.__wbg_drawArrays_a8ad03dae79ec56f = (arg0, arg1, arg2, arg3) => {
    arg0.drawArrays(arg1 >>> 0, arg2, arg3)
  }
  imports.wbg.__wbg_enableVertexAttribArray_2898de871f949393 = (arg0, arg1) => {
    arg0.enableVertexAttribArray(arg1 >>> 0)
  }
  imports.wbg.__wbg_enable_2d8bb952637ad17a = (arg0, arg1) => {
    arg0.enable(arg1 >>> 0)
  }
  imports.wbg.__wbg_error_7534b8e9a36f1ab4 = (arg0, arg1) => {
    let deferred0_0
    let deferred0_1
    try {
      deferred0_0 = arg0
      deferred0_1 = arg1
      console.error(getStringFromWasm0(arg0, arg1))
    } finally {
      wasm.__wbindgen_free(deferred0_0, deferred0_1, 1)
    }
  }
  imports.wbg.__wbg_error_7bc7d576a6aaf855 = arg0 => {
    console.error(arg0)
  }
  imports.wbg.__wbg_getContext_01f42b234e833f0a = function () {
    return handleError((arg0, arg1, arg2) => {
      const ret = arg0.getContext(getStringFromWasm0(arg1, arg2))
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
    }, arguments)
  }
  imports.wbg.__wbg_getProgramInfoLog_a0ff8b0971fcaf48 = (arg0, arg1, arg2) => {
    const ret = arg1.getProgramInfoLog(arg2)
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    var len1 = WASM_VECTOR_LEN
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
  }
  imports.wbg.__wbg_getProgramParameter_c777611a448a6ccd = (arg0, arg1, arg2) => {
    const ret = arg0.getProgramParameter(arg1, arg2 >>> 0)
    return ret
  }
  imports.wbg.__wbg_getShaderInfoLog_862d8c35c68d02c8 = (arg0, arg1, arg2) => {
    const ret = arg1.getShaderInfoLog(arg2)
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    var len1 = WASM_VECTOR_LEN
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
  }
  imports.wbg.__wbg_getShaderParameter_b8a41abb0d7d23c3 = (arg0, arg1, arg2) => {
    const ret = arg0.getShaderParameter(arg1, arg2 >>> 0)
    return ret
  }
  imports.wbg.__wbg_getUniformLocation_21ac12bfc569cbbf = (arg0, arg1, arg2, arg3) => {
    const ret = arg0.getUniformLocation(arg1, getStringFromWasm0(arg2, arg3))
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_instanceof_WebGl2RenderingContext_121e4c8c95b128ef = arg0 => {
    let result
    try {
      result = arg0 instanceof WebGL2RenderingContext
    } catch (_) {
      result = false
    }
    const ret = result
    return ret
  }
  imports.wbg.__wbg_instanceof_Window_b5cf7783caa68180 = arg0 => {
    let result
    try {
      result = arg0 instanceof Window
    } catch (_) {
      result = false
    }
    const ret = result
    return ret
  }
  imports.wbg.__wbg_linkProgram_93f76a2f5030041e = (arg0, arg1) => {
    arg0.linkProgram(arg1)
  }
  imports.wbg.__wbg_log_1d990106d99dacb7 = arg0 => {
    console.log(arg0)
  }
  imports.wbg.__wbg_new_8a6f238a6ece86ea = () => {
    const ret = new Error()
    return ret
  }
  imports.wbg.__wbg_new_no_args_cb138f77cf6151ee = (arg0, arg1) => {
    const ret = new Function(getStringFromWasm0(arg0, arg1))
    return ret
  }
  imports.wbg.__wbg_now_8cf15d6e317793e1 = arg0 => {
    const ret = arg0.now()
    return ret
  }
  imports.wbg.__wbg_performance_c77a440eff2efd9b = arg0 => {
    const ret = arg0.performance
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_set_height_6f8f8ef4cb40e496 = (arg0, arg1) => {
    arg0.height = arg1 >>> 0
  }
  imports.wbg.__wbg_set_width_7ff7a22c6e9f423e = (arg0, arg1) => {
    arg0.width = arg1 >>> 0
  }
  imports.wbg.__wbg_shaderSource_aea71cfa376fc985 = (arg0, arg1, arg2, arg3) => {
    arg0.shaderSource(arg1, getStringFromWasm0(arg2, arg3))
  }
  imports.wbg.__wbg_stack_0ed75d68575b0f3c = (arg0, arg1) => {
    const ret = arg1.stack
    const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc)
    const len1 = WASM_VECTOR_LEN
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
  }
  imports.wbg.__wbg_static_accessor_GLOBAL_769e6b65d6557335 = () => {
    const ret = typeof global === 'undefined' ? null : global
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1 = () => {
    const ret = typeof globalThis === 'undefined' ? null : globalThis
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_static_accessor_SELF_08f5a74c69739274 = () => {
    const ret = typeof self === 'undefined' ? null : self
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_static_accessor_WINDOW_a8924b26aa92d024 = () => {
    const ret = typeof window === 'undefined' ? null : window
    return isLikeNone(ret) ? 0 : addToExternrefTable0(ret)
  }
  imports.wbg.__wbg_texImage2D_f519f02c55e45fb0 = function () {
    return handleError((arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) => {
      arg0.texImage2D(
        arg1 >>> 0,
        arg2,
        arg3,
        arg4,
        arg5,
        arg6,
        arg7 >>> 0,
        arg8 >>> 0,
        arg9 === 0 ? undefined : getArrayU8FromWasm0(arg9, arg10)
      )
    }, arguments)
  }
  imports.wbg.__wbg_texParameteri_3a52bfd2ef280632 = (arg0, arg1, arg2, arg3) => {
    arg0.texParameteri(arg1 >>> 0, arg2 >>> 0, arg3)
  }
  imports.wbg.__wbg_uniform1f_b47da9590d2c2cf1 = (arg0, arg1, arg2) => {
    arg0.uniform1f(arg1, arg2)
  }
  imports.wbg.__wbg_uniform1i_85131b7388bc8e3f = (arg0, arg1, arg2) => {
    arg0.uniform1i(arg1, arg2)
  }
  imports.wbg.__wbg_uniform4f_1e4aad4d202f9f6c = (arg0, arg1, arg2, arg3, arg4, arg5) => {
    arg0.uniform4f(arg1, arg2, arg3, arg4, arg5)
  }
  imports.wbg.__wbg_uniformMatrix4fv_62e9aaf2b4268690 = (arg0, arg1, arg2, arg3, arg4) => {
    arg0.uniformMatrix4fv(arg1, arg2 !== 0, getArrayF32FromWasm0(arg3, arg4))
  }
  imports.wbg.__wbg_useProgram_4632a62f19deea67 = (arg0, arg1) => {
    arg0.useProgram(arg1)
  }
  imports.wbg.__wbg_vertexAttribDivisor_4f37e0f7c1197d16 = (arg0, arg1, arg2) => {
    arg0.vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0)
  }
  imports.wbg.__wbg_vertexAttribPointer_880223685613a791 = (
    arg0,
    arg1,
    arg2,
    arg3,
    arg4,
    arg5,
    arg6
  ) => {
    arg0.vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6)
  }
  imports.wbg.__wbg_viewport_1b0f7b63c424b52f = (arg0, arg1, arg2, arg3, arg4) => {
    arg0.viewport(arg1, arg2, arg3, arg4)
  }
  imports.wbg.__wbg_warn_6e567d0d926ff881 = arg0 => {
    console.warn(arg0)
  }
  imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = (arg0, arg1) => {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1)
    return ret
  }
  imports.wbg.__wbindgen_cast_cd07b1914aa3d62c = (arg0, arg1) => {
    // Cast intrinsic for `Ref(Slice(F32)) -> NamedExternref("Float32Array")`.
    const ret = getArrayF32FromWasm0(arg0, arg1)
    return ret
  }
  imports.wbg.__wbindgen_init_externref_table = () => {
    const table = wasm.__wbindgen_externrefs
    const offset = table.grow(4)
    table.set(0, undefined)
    table.set(offset + 0, undefined)
    table.set(offset + 1, null)
    table.set(offset + 2, true)
    table.set(offset + 3, false)
  }

  return imports
}

function __wbg_finalize_init(instance, module) {
  wasm = instance.exports
  __wbg_init.__wbindgen_wasm_module = module
  cachedDataViewMemory0 = null
  cachedFloat32ArrayMemory0 = null
  cachedUint8ArrayMemory0 = null

  wasm.__wbindgen_start()
  return wasm
}

function initSync(module) {
  if (wasm !== undefined) {
    return wasm
  }

  if (typeof module !== 'undefined') {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ;({ module } = module)
    } else {
      console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
    }
  }

  const imports = __wbg_get_imports()
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module)
  }
  const instance = new WebAssembly.Instance(module, imports)
  return __wbg_finalize_init(instance, module)
}

async function __wbg_init(module_or_path) {
  if (wasm !== undefined) {
    return wasm
  }

  if (typeof module_or_path !== 'undefined') {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ;({ module_or_path } = module_or_path)
    } else {
      console.warn(
        'using deprecated parameters for the initialization function; pass a single object instead'
      )
    }
  }

  if (typeof module_or_path === 'undefined') {
    module_or_path = new URL('graph_engine_bg.wasm', import.meta.url)
  }
  const imports = __wbg_get_imports()

  if (
    typeof module_or_path === 'string' ||
    (typeof Request === 'function' && module_or_path instanceof Request) ||
    (typeof URL === 'function' && module_or_path instanceof URL)
  ) {
    module_or_path = fetch(module_or_path)
  }

  const { instance, module } = await __wbg_load(await module_or_path, imports)

  return __wbg_finalize_init(instance, module)
}

export { initSync }
export default __wbg_init
