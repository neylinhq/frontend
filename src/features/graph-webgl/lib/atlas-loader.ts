/**
 * Atlas Loader - Load MSDF font atlas and icon sprite atlas
 *
 * Loads atlas images and metadata for GPU text and icon rendering.
 */

// Raw msdf-atlas-gen JSON format - passed directly to WASM
export interface FontMetrics {
  atlas: {
    type: string
    distanceRange: number
    size: number
    width: number
    height: number
    yOrigin: string
  }
  metrics: {
    emSize: number
    lineHeight: number
    ascender: number
    descender: number
  }
  glyphs: Array<{
    unicode: number
    advance: number
    planeBounds?: { left: number; bottom: number; right: number; top: number }
    atlasBounds?: { left: number; bottom: number; right: number; top: number }
  }>
}

export interface IconAtlas {
  atlas: {
    width: number
    height: number
    iconSize: number
  }
  icons: Record<
    string, // icon name
    {
      x: number
      y: number
      width: number
      height: number
      uv: [number, number, number, number] // [u, v, uWidth, vHeight]
    }
  >
}

export interface LoadedFontAtlas {
  imageData: Uint8Array
  width: number
  height: number
  metrics: FontMetrics
}

export interface LoadedIconAtlas {
  imageData: Uint8Array
  width: number
  height: number
  coords: IconAtlas
}

/**
 * Load image as raw RGBA bytes
 */
async function loadImageAsBytes(
  url: string
): Promise<{ data: Uint8Array; width: number; height: number }> {
  const response = await fetch(url)
  const blob = await response.blob()
  const imageBitmap = await createImageBitmap(blob)

  // Create offscreen canvas to extract pixel data
  const canvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(imageBitmap, 0, 0)

  const imageData = ctx.getImageData(0, 0, imageBitmap.width, imageBitmap.height)

  return {
    data: new Uint8Array(imageData.data.buffer),
    width: imageBitmap.width,
    height: imageBitmap.height
  }
}

/**
 * Load MSDF font atlas
 * @param basePath Base path to assets (e.g., '/assets')
 * @param fontName Font name (e.g., 'inter-msdf')
 */
export async function loadFontAtlas(
  basePath = '/assets',
  fontName = 'inter-msdf'
): Promise<LoadedFontAtlas> {
  const [imageResult, metricsResponse] = await Promise.all([
    loadImageAsBytes(`${basePath}/${fontName}.png`),
    fetch(`${basePath}/${fontName}.json`)
  ])

  // Pass the raw JSON through - WASM expects msdf-atlas-gen format directly
  const rawMetrics = await metricsResponse.json()

  return {
    imageData: imageResult.data,
    width: imageResult.width,
    height: imageResult.height,
    metrics: rawMetrics // Pass raw format, WASM parses it
  }
}

/**
 * Load icon sprite atlas
 * @param basePath Base path to assets (e.g., '/assets')
 */
export async function loadIconAtlas(basePath = '/assets'): Promise<LoadedIconAtlas> {
  const [imageResult, coordsResponse] = await Promise.all([
    loadImageAsBytes(`${basePath}/icons.png`),
    fetch(`${basePath}/icons.json`)
  ])

  const coords: IconAtlas = await coordsResponse.json()

  return {
    imageData: imageResult.data,
    width: imageResult.width,
    height: imageResult.height,
    coords
  }
}

/**
 * Preload all atlases
 * Returns a promise that resolves when both atlases are loaded
 */
export async function preloadAtlases(basePath = '/assets'): Promise<{
  font: LoadedFontAtlas
  icons: LoadedIconAtlas
}> {
  const [font, icons] = await Promise.all([loadFontAtlas(basePath), loadIconAtlas(basePath)])

  return { font, icons }
}
