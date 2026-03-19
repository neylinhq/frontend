/**
 * SDF Icon Atlas Generator
 *
 * Renders SVG icon paths to canvas, then computes a Signed Distance Field
 * for each icon. The resulting SDF atlas can be rendered via the same MSDF/SDF
 * shader as text — infinitely scalable, tinted by GPU uniform.
 *
 * Pipeline: SVG path → Canvas 2D (high-res) → EDT distance field → SDF atlas texture
 */

// SVG paths from @untitledui/icons-react/outline (24×24 viewBox, stroke)
const ICON_PATHS: Record<string, string> = {
  brain:
    'M12 12h.01m3.525 3.536c-4.686 4.686-10.068 6.902-12.02 4.95-1.953-1.953.263-7.335 4.949-12.021s10.068-6.903 12.02-4.95c1.953 1.952-.263 7.334-4.949 12.02m0-7.072c4.686 4.687 6.902 10.069 4.95 12.021-1.953 1.953-7.335-.263-12.021-4.95-4.686-4.686-6.902-10.068-4.95-12.02 1.953-1.953 7.335.263 12.021 4.95M12.499 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0',
  lightbulb:
    'M15 16.5V19c0 .932 0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C13.398 22 12.932 22 12 22s-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C9 20.398 9 19.932 9 19v-2.5m6 0c2.649-1.157 4.5-3.924 4.5-7a7.5 7.5 0 0 0-15 0c0 3.076 1.851 5.843 4.5 7m6 0H9',
  'file-text':
    'M4 6.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C6.28 2 7.12 2 8.8 2h6.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C20 4.28 20 5.12 20 6.8v10.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.72 22 16.88 22 15.2 22H8.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C4 19.72 4 18.88 4 17.2z',
  target:
    'M22 12c0 5.523-4.477 10-10 10m10-10c0-5.523-4.477-10-10-10m10 10h-4m-6 10C6.477 22 2 17.523 2 12m10 10v-4M2 12C2 6.477 6.477 2 12 2M2 12h4m6-10v4',
  question:
    'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10',
  zap: 'M13 2 4.093 12.688c-.348.418-.523.628-.525.804a.5.5 0 0 0 .185.397c.138.111.41.111.955.111H12l-1 8 8.907-10.688c.348-.418.523-.628.525-.804a.5.5 0 0 0-.185-.397c-.138-.111-.41-.111-.955-.111H12z',
  user: 'M20 21c0-1.396 0-2.093-.172-2.661a4 4 0 0 0-2.667-2.667c-.568-.172-1.265-.172-2.661-.172h-5c-1.396 0-2.093 0-2.661.172a4 4 0 0 0-2.667 2.667C4 18.907 4 19.604 4 21M16.5 7.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0',
  'graduation-cap':
    'M5 10v6.011c0 .36 0 .539.055.697a1 1 0 0 0 .23.374c.118.12.278.2.6.36l5.4 2.7c.262.131.393.197.53.223q.186.034.37 0c.137-.026.268-.091.53-.223l5.4-2.7c.322-.16.482-.24.6-.36a1 1 0 0 0 .23-.374c.055-.158.055-.338.055-.697v-6.01M2 8.5l9.642-4.822c.131-.066.197-.098.266-.111a.5.5 0 0 1 .184 0c.069.013.135.045.266.11L22 8.5l-9.642 4.821c-.131.066-.197.099-.266.111a.5.5 0 0 1-.184 0c-.069-.012-.135-.045-.266-.11z'
}

/** Cell size in pixels for each icon in the SDF atlas */
const RENDER_SIZE = 512 // High-res render before distance transform (4× supersampling)
const SDF_SIZE = 128 // Final SDF cell size in atlas
const SDF_RADIUS = 16 // Distance field radius in pixels
const STROKE_WIDTH = 1.75 // SVG stroke width (viewBox units)

export interface SdfIconAtlasResult {
  /** RGBA pixel data for WebGL texture upload */
  imageData: Uint8Array
  width: number
  height: number
  /** JSON string with icon atlas coords for WASM */
  coordsJson: string
}

/**
 * Compute 1D squared Euclidean Distance Transform (Felzenszwalb & Huttenlocher)
 * This is the core algorithm from tiny-sdf / Mapbox.
 */
function edt1d(
  data: Float64Array,
  offset: number,
  stride: number,
  length: number,
  f: Float64Array,
  d: Float64Array,
  v: Int32Array,
  z: Float64Array
) {
  v[0] = 0
  z[0] = -Infinity
  z[1] = Infinity
  f[0] = data[offset]

  let k = 0
  for (let q = 1; q < length; q++) {
    f[q] = data[offset + q * stride]
    let s: number
    do {
      const r = v[k]
      s = (f[q] - f[r] + q * q - r * r) / (q - r) / 2
      if (s <= z[k]) {
        k--
      } else {
        break
      }
    } while (k > -1)

    k++
    v[k] = q
    z[k] = s
    z[k + 1] = Infinity
  }

  let j = 0
  for (let q = 0; q < length; q++) {
    while (z[j + 1] < q) { j++ }
    const r = v[j]
    const qr = q - r
    d[q] = f[r] + qr * qr
  }

  for (let q = 0; q < length; q++) {
    data[offset + q * stride] = d[q]
  }
}

function edt2d(data: Float64Array, width: number, height: number) {
  const maxDim = Math.max(width, height)
  const f = new Float64Array(maxDim)
  const d = new Float64Array(maxDim)
  const v = new Int32Array(maxDim)
  const z = new Float64Array(maxDim + 1)

  // Horizontal pass
  for (let y = 0; y < height; y++) {
    edt1d(data, y * width, 1, width, f, d, v, z)
  }
  // Vertical pass
  for (let x = 0; x < width; x++) {
    edt1d(data, x, width, height, f, d, v, z)
  }
}

/**
 * Render an SVG stroke path to a canvas and compute its SDF.
 * Returns a single-channel Uint8Array where 0.75 = edge (like tiny-sdf).
 */
function renderIconSdf(pathData: string, size: number, radius: number): Uint8Array {
  const renderScale = RENDER_SIZE / 24 // viewBox 24 → render pixels
  const pad = Math.ceil(radius * (RENDER_SIZE / size))

  // Render SVG stroke to high-res canvas
  const renderCanvas = document.createElement('canvas')
  const renderSize = RENDER_SIZE + pad * 2
  renderCanvas.width = renderSize
  renderCanvas.height = renderSize
  const rctx = renderCanvas.getContext('2d')!

  rctx.clearRect(0, 0, renderSize, renderSize)
  rctx.translate(pad, pad)
  rctx.scale(renderScale, renderScale)
  rctx.strokeStyle = 'white'
  rctx.lineWidth = STROKE_WIDTH
  rctx.lineCap = 'round'
  rctx.lineJoin = 'round'
  const path = new Path2D(pathData)
  rctx.stroke(path)

  // Get alpha channel as binary mask
  const imgData = rctx.getImageData(0, 0, renderSize, renderSize)
  const alpha = imgData.data

  // Compute distance fields (inside and outside)
  const INF = 1e20
  const outer = new Float64Array(renderSize * renderSize)
  const inner = new Float64Array(renderSize * renderSize)

  for (let i = 0; i < renderSize * renderSize; i++) {
    const a = alpha[i * 4 + 3] / 255 // alpha channel
    if (a > 0.5) {
      outer[i] = 0
      inner[i] = INF
    } else {
      outer[i] = INF
      inner[i] = 0
    }
  }

  edt2d(outer, renderSize, renderSize)
  edt2d(inner, renderSize, renderSize)

  // Downsample and encode as SDF (0-255, 192 = edge)
  const result = new Uint8Array(size * size)
  const scale = renderSize / size

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Sample center of destination pixel in source
      const sx = Math.floor((x + 0.5) * scale)
      const sy = Math.floor((y + 0.5) * scale)
      const si = sy * renderSize + sx

      const dist = Math.sqrt(outer[si]) - Math.sqrt(inner[si])
      // dist is in renderSize units; radius is in SDF output units — scale up
      const sdfValue = Math.round(192 - (dist * 192) / (radius * scale))
      result[y * size + x] = Math.max(0, Math.min(255, sdfValue))
    }
  }

  return result
}

/**
 * Generate SDF icon atlas at runtime in the browser.
 * Each icon is rendered as a single-channel SDF, packed into an RGBA atlas
 * (R channel = SDF distance, G=B=0, A=255).
 *
 * Compatible with the existing SDF text shader (single-channel mode).
 */
export function generateSdfIconAtlas(): SdfIconAtlasResult {
  const names = Object.keys(ICON_PATHS)
  const cols = names.length
  const atlasWidth = SDF_SIZE * cols
  const atlasHeight = SDF_SIZE

  // RGBA output (SDF in R channel for single-channel SDF shader)
  const rgba = new Uint8Array(atlasWidth * atlasHeight * 4)

  const icons: Record<
    string,
    { x: number; y: number; width: number; height: number; uv: [number, number, number, number] }
  > = {}

  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const sdf = renderIconSdf(ICON_PATHS[name], SDF_SIZE, SDF_RADIUS)
    const x = i * SDF_SIZE

    // Copy SDF into RGBA atlas (R=SDF, G=SDF, B=SDF, A=255)
    for (let py = 0; py < SDF_SIZE; py++) {
      for (let px = 0; px < SDF_SIZE; px++) {
        const srcIdx = py * SDF_SIZE + px
        const dstIdx = ((py) * atlasWidth + (x + px)) * 4
        const v = sdf[srcIdx]
        rgba[dstIdx] = v     // R
        rgba[dstIdx + 1] = v // G
        rgba[dstIdx + 2] = v // B
        rgba[dstIdx + 3] = 255 // A
      }
    }

    icons[name] = {
      x,
      y: 0,
      width: SDF_SIZE,
      height: SDF_SIZE,
      uv: [x / atlasWidth, 0, SDF_SIZE / atlasWidth, 1.0]
    }
  }

  return {
    imageData: rgba,
    width: atlasWidth,
    height: atlasHeight,
    coordsJson: JSON.stringify({
      atlas: { width: atlasWidth, height: atlasHeight, iconSize: SDF_SIZE, sdf: true },
      icons
    })
  }
}
