let wasm

function addHeapObject(obj) {
  if (heap_next === heap.length) {
    heap.push(heap.length + 1)
  }
  const idx = heap_next
  heap_next = heap[idx]

  heap[idx] = obj
  return idx
}

function dropObject(idx) {
  if (idx < 132) {
    return
  }
  heap[idx] = heap_next
  heap_next = idx
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

function getObject(idx) {
  return heap[idx]
}

function handleError(f, args) {
  try {
    return f.apply(this, args)
  } catch (e) {
    wasm.__wbindgen_export(addHeapObject(e))
  }
}

const heap = new Array(128).fill(undefined)
heap.push(undefined, null, true, false)

let heap_next = heap.length

function isLikeNone(x) {
  return x === undefined || x === null
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

function takeObject(idx) {
  const ret = getObject(idx)
  dropObject(idx)
  return ret
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
 * Main WASM facade for JavaScript integration
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
   * Create a new GraphEngine instance
   */
  constructor() {
    const ret = wasm.graphengine_new()
    this.__wbg_ptr = ret >>> 0
    GraphEngineFinalization.register(this, this.__wbg_ptr, this)
    return this
  }
  /**
   * Initialize WebGL renderer with canvas element
   *
   * # Arguments
   * * `canvas` - HTML canvas element for WebGL rendering
   *
   * # Returns
   * * Result with unit or error message
   * @param {HTMLCanvasElement} canvas
   */
  initRenderer(canvas) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
      wasm.graphengine_initRenderer(retptr, this.__wbg_ptr, addHeapObject(canvas))
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true)
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true)
      if (r1) {
        throw takeObject(r0)
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16)
    }
  }
  /**
   * Load graph data from JSON
   *
   * # Arguments
   * * `json_data` - JSON string containing nodes and edges
   *
   * # Returns
   * * Result with unit or error message
   * @param {string} json_data
   */
  loadGraph(json_data) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
      const ptr0 = passStringToWasm0(json_data, wasm.__wbindgen_export2, wasm.__wbindgen_export3)
      const len0 = WASM_VECTOR_LEN
      wasm.graphengine_loadGraph(retptr, this.__wbg_ptr, ptr0, len0)
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true)
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true)
      if (r1) {
        throw takeObject(r0)
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16)
    }
  }
  /**
   * Export graph data to JSON
   *
   * # Returns
   * * JSON string with graph data
   * @returns {string}
   */
  exportGraph() {
    let deferred2_0
    let deferred2_1
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
      wasm.graphengine_exportGraph(retptr, this.__wbg_ptr)
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true)
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true)
      var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true)
      var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true)
      var ptr1 = r0
      var len1 = r1
      if (r3) {
        ptr1 = 0
        len1 = 0
        throw takeObject(r2)
      }
      deferred2_0 = ptr1
      deferred2_1 = len1
      return getStringFromWasm0(ptr1, len1)
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16)
      wasm.__wbindgen_export4(deferred2_0, deferred2_1, 1)
    }
  }
  /**
   * Run force-directed layout algorithm
   *
   * # Arguments
   * * `iterations` - Number of layout iterations (default: 150)
   *
   * # Returns
   * * Result with unit or error message
   * @param {number | null} [iterations]
   */
  runLayout(iterations) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
      wasm.graphengine_runLayout(
        retptr,
        this.__wbg_ptr,
        isLikeNone(iterations) ? 0x100000001 : iterations >>> 0
      )
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true)
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true)
      if (r1) {
        throw takeObject(r0)
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16)
    }
  }
  /**
   * Render current frame
   *
   * # Returns
   * * Result with unit or error message
   */
  render() {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
      wasm.graphengine_render(retptr, this.__wbg_ptr)
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true)
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true)
      if (r1) {
        throw takeObject(r0)
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16)
    }
  }
  /**
   * Set view transformation (pan and zoom)
   *
   * # Arguments
   * * `pan_x` - Horizontal pan offset
   * * `pan_y` - Vertical pan offset
   * * `zoom` - Zoom level (1.0 = 100%)
   * @param {number} pan_x
   * @param {number} pan_y
   * @param {number} zoom
   */
  setView(pan_x, pan_y, zoom) {
    wasm.graphengine_setView(this.__wbg_ptr, pan_x, pan_y, zoom)
  }
  /**
   * Set canvas resolution
   *
   * # Arguments
   * * `width` - Canvas width in pixels
   * * `height` - Canvas height in pixels
   * @param {number} width
   * @param {number} height
   */
  setResolution(width, height) {
    wasm.graphengine_setResolution(this.__wbg_ptr, width, height)
  }
  /**
   * Hit test - find node at screen position
   *
   * # Arguments
   * * `screen_x` - Screen X coordinate
   * * `screen_y` - Screen Y coordinate
   *
   * # Returns
   * * Node ID if found, null otherwise
   * @param {number} _screen_x
   * @param {number} _screen_y
   * @returns {string | undefined}
   */
  hitTest(_screen_x, _screen_y) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
      wasm.graphengine_hitTest(retptr, this.__wbg_ptr, _screen_x, _screen_y)
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true)
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true)
      let v1
      if (r0 !== 0) {
        v1 = getStringFromWasm0(r0, r1).slice()
        wasm.__wbindgen_export4(r0, r1 * 1, 1)
      }
      return v1
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16)
    }
  }
  /**
   * Select nodes by IDs
   *
   * # Arguments
   * * `node_ids` - JSON array of node IDs
   * @param {string} node_ids_json
   */
  selectNodes(node_ids_json) {
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
      const ptr0 = passStringToWasm0(
        node_ids_json,
        wasm.__wbindgen_export2,
        wasm.__wbindgen_export3
      )
      const len0 = WASM_VECTOR_LEN
      wasm.graphengine_selectNodes(retptr, this.__wbg_ptr, ptr0, len0)
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true)
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true)
      if (r1) {
        throw takeObject(r0)
      }
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16)
    }
  }
  /**
   * Focus on a specific node
   *
   * # Arguments
   * * `node_id` - Node ID to focus, or null to clear focus
   * @param {string | null} [node_id]
   */
  focusNode(node_id) {
    var ptr0 = isLikeNone(node_id)
      ? 0
      : passStringToWasm0(node_id, wasm.__wbindgen_export2, wasm.__wbindgen_export3)
    var len0 = WASM_VECTOR_LEN
    wasm.graphengine_focusNode(this.__wbg_ptr, ptr0, len0)
  }
  /**
   * Get number of nodes in graph
   * @returns {number}
   */
  getNodeCount() {
    const ret = wasm.graphengine_getNodeCount(this.__wbg_ptr)
    return ret >>> 0
  }
  /**
   * Get number of edges in graph
   * @returns {number}
   */
  getEdgeCount() {
    const ret = wasm.graphengine_getEdgeCount(this.__wbg_ptr)
    return ret >>> 0
  }
  /**
   * Get rendering statistics
   *
   * # Returns
   * * JSON string with statistics
   * @returns {string}
   */
  getStats() {
    let deferred1_0
    let deferred1_1
    try {
      const retptr = wasm.__wbindgen_add_to_stack_pointer(-16)
      wasm.graphengine_getStats(retptr, this.__wbg_ptr)
      var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true)
      var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true)
      deferred1_0 = r0
      deferred1_1 = r1
      return getStringFromWasm0(r0, r1)
    } finally {
      wasm.__wbindgen_add_to_stack_pointer(16)
      wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1)
    }
  }
}
if (Symbol.dispose) {
  GraphEngine.prototype[Symbol.dispose] = GraphEngine.prototype.free
}

/**
 * Initialize the WASM module
 * This is called automatically when importing the module in JavaScript
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
    const v = getObject(arg0)
    const ret = typeof v === 'boolean' ? v : undefined
    return isLikeNone(ret) ? 0xffffff : ret ? 1 : 0
  }
  imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = (arg0, arg1) => {
    throw new Error(getStringFromWasm0(arg0, arg1))
  }
  imports.wbg.__wbg_attachShader_ce575704294db9cc = (arg0, arg1, arg2) => {
    getObject(arg0).attachShader(getObject(arg1), getObject(arg2))
  }
  imports.wbg.__wbg_bindBuffer_c24c31cbec41cb21 = (arg0, arg1, arg2) => {
    getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2))
  }
  imports.wbg.__wbg_bindVertexArray_ced27387a0718508 = (arg0, arg1) => {
    getObject(arg0).bindVertexArray(getObject(arg1))
  }
  imports.wbg.__wbg_blendFunc_046483861de36edd = (arg0, arg1, arg2) => {
    getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0)
  }
  imports.wbg.__wbg_bufferData_69dbeea8e1d79f7b = (arg0, arg1, arg2, arg3) => {
    getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0)
  }
  imports.wbg.__wbg_clearColor_66e5dad6393f32ec = (arg0, arg1, arg2, arg3, arg4) => {
    getObject(arg0).clearColor(arg1, arg2, arg3, arg4)
  }
  imports.wbg.__wbg_clear_00ac71df5db8ab17 = (arg0, arg1) => {
    getObject(arg0).clear(arg1 >>> 0)
  }
  imports.wbg.__wbg_compileShader_ba337110bed419e1 = (arg0, arg1) => {
    getObject(arg0).compileShader(getObject(arg1))
  }
  imports.wbg.__wbg_createBuffer_465b645a46535184 = arg0 => {
    const ret = getObject(arg0).createBuffer()
    return isLikeNone(ret) ? 0 : addHeapObject(ret)
  }
  imports.wbg.__wbg_createProgram_ffe9d4a2cba210f4 = arg0 => {
    const ret = getObject(arg0).createProgram()
    return isLikeNone(ret) ? 0 : addHeapObject(ret)
  }
  imports.wbg.__wbg_createShader_f88f9b82748ef6c0 = (arg0, arg1) => {
    const ret = getObject(arg0).createShader(arg1 >>> 0)
    return isLikeNone(ret) ? 0 : addHeapObject(ret)
  }
  imports.wbg.__wbg_createVertexArray_997b3c5b1091afd9 = arg0 => {
    const ret = getObject(arg0).createVertexArray()
    return isLikeNone(ret) ? 0 : addHeapObject(ret)
  }
  imports.wbg.__wbg_deleteBuffer_ba7f1164cc23b2ca = (arg0, arg1) => {
    getObject(arg0).deleteBuffer(getObject(arg1))
  }
  imports.wbg.__wbg_deleteProgram_3bf297a31d0e6e48 = (arg0, arg1) => {
    getObject(arg0).deleteProgram(getObject(arg1))
  }
  imports.wbg.__wbg_deleteShader_c357bb8fbede8370 = (arg0, arg1) => {
    getObject(arg0).deleteShader(getObject(arg1))
  }
  imports.wbg.__wbg_deleteVertexArray_af80f68f0bea25b7 = (arg0, arg1) => {
    getObject(arg0).deleteVertexArray(getObject(arg1))
  }
  imports.wbg.__wbg_drawArraysInstanced_5a3cccf98d769264 = (arg0, arg1, arg2, arg3, arg4) => {
    getObject(arg0).drawArraysInstanced(arg1 >>> 0, arg2, arg3, arg4)
  }
  imports.wbg.__wbg_drawArrays_a8ad03dae79ec56f = (arg0, arg1, arg2, arg3) => {
    getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3)
  }
  imports.wbg.__wbg_enableVertexAttribArray_2898de871f949393 = (arg0, arg1) => {
    getObject(arg0).enableVertexAttribArray(arg1 >>> 0)
  }
  imports.wbg.__wbg_enable_2d8bb952637ad17a = (arg0, arg1) => {
    getObject(arg0).enable(arg1 >>> 0)
  }
  imports.wbg.__wbg_getAttribLocation_e56db0839c7627ca = (arg0, arg1, arg2, arg3) => {
    const ret = getObject(arg0).getAttribLocation(getObject(arg1), getStringFromWasm0(arg2, arg3))
    return ret
  }
  imports.wbg.__wbg_getContext_01f42b234e833f0a = function () {
    return handleError((arg0, arg1, arg2) => {
      const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2))
      return isLikeNone(ret) ? 0 : addHeapObject(ret)
    }, arguments)
  }
  imports.wbg.__wbg_getProgramInfoLog_a0ff8b0971fcaf48 = (arg0, arg1, arg2) => {
    const ret = getObject(arg1).getProgramInfoLog(getObject(arg2))
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(ret, wasm.__wbindgen_export2, wasm.__wbindgen_export3)
    var len1 = WASM_VECTOR_LEN
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
  }
  imports.wbg.__wbg_getProgramParameter_c777611a448a6ccd = (arg0, arg1, arg2) => {
    const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0)
    return addHeapObject(ret)
  }
  imports.wbg.__wbg_getShaderInfoLog_862d8c35c68d02c8 = (arg0, arg1, arg2) => {
    const ret = getObject(arg1).getShaderInfoLog(getObject(arg2))
    var ptr1 = isLikeNone(ret)
      ? 0
      : passStringToWasm0(ret, wasm.__wbindgen_export2, wasm.__wbindgen_export3)
    var len1 = WASM_VECTOR_LEN
    getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true)
    getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true)
  }
  imports.wbg.__wbg_getShaderParameter_b8a41abb0d7d23c3 = (arg0, arg1, arg2) => {
    const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0)
    return addHeapObject(ret)
  }
  imports.wbg.__wbg_getUniformLocation_21ac12bfc569cbbf = (arg0, arg1, arg2, arg3) => {
    const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3))
    return isLikeNone(ret) ? 0 : addHeapObject(ret)
  }
  imports.wbg.__wbg_height_a07787f693c253d2 = arg0 => {
    const ret = getObject(arg0).height
    return ret
  }
  imports.wbg.__wbg_instanceof_WebGl2RenderingContext_121e4c8c95b128ef = arg0 => {
    let result
    try {
      result = getObject(arg0) instanceof WebGL2RenderingContext
    } catch (_) {
      result = false
    }
    const ret = result
    return ret
  }
  imports.wbg.__wbg_linkProgram_93f76a2f5030041e = (arg0, arg1) => {
    getObject(arg0).linkProgram(getObject(arg1))
  }
  imports.wbg.__wbg_log_1d990106d99dacb7 = arg0 => {
    console.log(getObject(arg0))
  }
  imports.wbg.__wbg_shaderSource_aea71cfa376fc985 = (arg0, arg1, arg2, arg3) => {
    getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3))
  }
  imports.wbg.__wbg_uniform2f_191d769606542c31 = (arg0, arg1, arg2, arg3) => {
    getObject(arg0).uniform2f(getObject(arg1), arg2, arg3)
  }
  imports.wbg.__wbg_uniformMatrix3fv_3b2ed3a816d45543 = (arg0, arg1, arg2, arg3, arg4) => {
    getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, getArrayF32FromWasm0(arg3, arg4))
  }
  imports.wbg.__wbg_useProgram_4632a62f19deea67 = (arg0, arg1) => {
    getObject(arg0).useProgram(getObject(arg1))
  }
  imports.wbg.__wbg_vertexAttribDivisor_4f37e0f7c1197d16 = (arg0, arg1, arg2) => {
    getObject(arg0).vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0)
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
    getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6)
  }
  imports.wbg.__wbg_viewport_1b0f7b63c424b52f = (arg0, arg1, arg2, arg3, arg4) => {
    getObject(arg0).viewport(arg1, arg2, arg3, arg4)
  }
  imports.wbg.__wbg_width_dd0cfe94d42f5143 = arg0 => {
    const ret = getObject(arg0).width
    return ret
  }
  imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = (arg0, arg1) => {
    // Cast intrinsic for `Ref(String) -> Externref`.
    const ret = getStringFromWasm0(arg0, arg1)
    return addHeapObject(ret)
  }
  imports.wbg.__wbindgen_cast_cb9088102bce6b30 = (arg0, arg1) => {
    // Cast intrinsic for `Ref(Slice(U8)) -> NamedExternref("Uint8Array")`.
    const ret = getArrayU8FromWasm0(arg0, arg1)
    return addHeapObject(ret)
  }
  imports.wbg.__wbindgen_cast_cd07b1914aa3d62c = (arg0, arg1) => {
    // Cast intrinsic for `Ref(Slice(F32)) -> NamedExternref("Float32Array")`.
    const ret = getArrayF32FromWasm0(arg0, arg1)
    return addHeapObject(ret)
  }
  imports.wbg.__wbindgen_object_drop_ref = arg0 => {
    takeObject(arg0)
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
