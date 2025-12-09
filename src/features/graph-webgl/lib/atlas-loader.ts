/**
 * Atlas Loader - Load MSDF font atlas and icon sprite atlas
 *
 * Loads atlas images and metadata for GPU text and icon rendering.
 */

export interface FontMetrics {
  atlas: {
    width: number
    height: number
    pxRange: number
    fontSize: number
    lineHeight: number
  }
  glyphs: Record<
    number, // codepoint
    {
      advance: number
      atlasBounds: { left: number; bottom: number; right: number; top: number }
      planeBounds: { left: number; bottom: number; right: number; top: number }
    }
  >
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
async function loadImageAsBytes(url: string): Promise<{ data: Uint8Array; width: number; height: number }> {
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
    height: imageBitmap.height,
  }
}

/**
 * Convert msdf-atlas-gen JSON format to our FontMetrics format
 */
function convertMsdfMetrics(raw: any): FontMetrics {
  const atlas = raw.atlas || {}
  const metrics = raw.metrics || {}

  const glyphs: FontMetrics['glyphs'] = {}

  for (const glyph of raw.glyphs || []) {
    const codepoint = glyph.unicode

    glyphs[codepoint] = {
      advance: glyph.advance || 0,
      atlasBounds: glyph.atlasBounds || { left: 0, bottom: 0, right: 0, top: 0 },
      planeBounds: glyph.planeBounds || { left: 0, bottom: 0, right: 0, top: 0 },
    }
  }

  return {
    atlas: {
      width: atlas.width || 1024,
      height: atlas.height || 1024,
      pxRange: atlas.distanceRange || 4,
      fontSize: metrics.emSize || 32,
      lineHeight: metrics.lineHeight || 1.2,
    },
    glyphs,
  }
}

/**
 * Load MSDF font atlas
 * @param basePath Base path to assets (e.g., '/assets')
 * @param fontName Font name (e.g., 'inter-msdf')
 */
export async function loadFontAtlas(basePath = '/assets', fontName = 'inter-msdf'): Promise<LoadedFontAtlas> {
  const [imageResult, metricsResponse] = await Promise.all([
    loadImageAsBytes(`${basePath}/${fontName}.png`),
    fetch(`${basePath}/${fontName}.json`),
  ])

  const rawMetrics = await metricsResponse.json()
  const metrics = convertMsdfMetrics(rawMetrics)

  return {
    imageData: imageResult.data,
    width: imageResult.width,
    height: imageResult.height,
    metrics,
  }
}

/**
 * Load icon sprite atlas
 * @param basePath Base path to assets (e.g., '/assets')
 */
export async function loadIconAtlas(basePath = '/assets'): Promise<LoadedIconAtlas> {
  const [imageResult, coordsResponse] = await Promise.all([
    loadImageAsBytes(`${basePath}/icons.png`),
    fetch(`${basePath}/icons.json`),
  ])

  const coords: IconAtlas = await coordsResponse.json()

  return {
    imageData: imageResult.data,
    width: imageResult.width,
    height: imageResult.height,
    coords,
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
  const [font, icons] = await Promise.all([
    loadFontAtlas(basePath),
    loadIconAtlas(basePath),
  ])

  return { font, icons }
}
