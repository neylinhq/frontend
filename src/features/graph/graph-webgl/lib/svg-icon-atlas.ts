/**
 * Generate high-DPI icon atlas from SVG paths at runtime.
 * Renders @untitledui outline icons into a canvas atlas for WebGL.
 */

// SVG paths from @untitledui/icons-react/outline (24x24 viewBox, stroke-based)
export const ICON_PATHS: Record<string, string> = {
  'brain':
    'M12 12h.01m3.525 3.536c-4.686 4.686-10.068 6.902-12.02 4.95-1.953-1.953.263-7.335 4.949-12.021s10.068-6.903 12.02-4.95c1.953 1.952-.263 7.334-4.949 12.02m0-7.072c4.686 4.687 6.902 10.069 4.95 12.021-1.953 1.953-7.335-.263-12.021-4.95-4.686-4.686-6.902-10.068-4.95-12.02 1.953-1.953 7.335.263 12.021 4.95M12.499 12a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0',
  'lightbulb':
    'M15 16.5V19c0 .932 0 1.398-.152 1.765a2 2 0 0 1-1.083 1.083C13.398 22 12.932 22 12 22s-1.398 0-1.765-.152a2 2 0 0 1-1.083-1.083C9 20.398 9 19.932 9 19v-2.5m6 0c2.649-1.157 4.5-3.924 4.5-7a7.5 7.5 0 0 0-15 0c0 3.076 1.851 5.843 4.5 7m6 0H9',
  'file-text':
    'M4 6.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C6.28 2 7.12 2 8.8 2h6.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C20 4.28 20 5.12 20 6.8v10.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C17.72 22 16.88 22 15.2 22H8.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C4 19.72 4 18.88 4 17.2z',
  'target':
    'M22 12c0 5.523-4.477 10-10 10m10-10c0-5.523-4.477-10-10-10m10 10h-4m-6 10C6.477 22 2 17.523 2 12m10 10v-4M2 12C2 6.477 6.477 2 12 2M2 12h4m6-10v4',
  'question':
    'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3m.08 4h.01M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10',
  'zap':
    'M13 2 4.093 12.688c-.348.418-.523.628-.525.804a.5.5 0 0 0 .185.397c.138.111.41.111.955.111H12l-1 8 8.907-10.688c.348-.418.523-.628.525-.804a.5.5 0 0 0-.185-.397c-.138-.111-.41-.111-.955-.111H12z',
  'user':
    'M20 21c0-1.396 0-2.093-.172-2.661a4 4 0 0 0-2.667-2.667c-.568-.172-1.265-.172-2.661-.172h-5c-1.396 0-2.093 0-2.661.172a4 4 0 0 0-2.667 2.667C4 18.907 4 19.604 4 21M16.5 7.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0',
  'graduation-cap':
    'M5 10v6.011c0 .36 0 .539.055.697a1 1 0 0 0 .23.374c.118.12.278.2.6.36l5.4 2.7c.262.131.393.197.53.223q.186.034.37 0c.137-.026.268-.091.53-.223l5.4-2.7c.322-.16.482-.24.6-.36a1 1 0 0 0 .23-.374c.055-.158.055-.338.055-.697v-6.01M2 8.5l9.642-4.822c.131-.066.197-.098.266-.111a.5.5 0 0 1 .184 0c.069.013.135.045.266.11L22 8.5l-9.642 4.821c-.131.066-.197.099-.266.111a.5.5 0 0 1-.184 0c-.069-.012-.135-.045-.266-.11z'
}

const ICON_SIZE = 256 // px per icon cell (high DPI, crisp up to ~1000% zoom)
const STROKE_WIDTH = 1.75

export interface SvgIconAtlasResult {
  imageData: Uint8Array
  width: number
  height: number
  coordsJson: string
}

/**
 * Generate icon atlas from SVG paths rendered at high DPI.
 * Returns RGBA pixel data + JSON coordinates for WebGL upload.
 */
export function generateSvgIconAtlas(
  color = 'white',
  size = ICON_SIZE
): SvgIconAtlasResult {
  const names = Object.keys(ICON_PATHS)
  const atlasWidth = size * names.length
  const atlasHeight = size

  const canvas = document.createElement('canvas')
  canvas.width = atlasWidth
  canvas.height = atlasHeight
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, atlasWidth, atlasHeight)

  const icons: Record<string, { x: number; y: number; width: number; height: number; uv: [number, number, number, number] }> = {}

  // Render each SVG synchronously via Path2D
  for (let i = 0; i < names.length; i++) {
    const name = names[i]
    const pathData = ICON_PATHS[name]
    const x = i * size

    ctx.save()
    ctx.translate(x, 0)
    // Scale from 24x24 viewBox to size×size with padding
    const pad = size * 0.1
    const scale = (size - pad * 2) / 24
    ctx.translate(pad, pad)
    ctx.scale(scale, scale)

    ctx.strokeStyle = color
    ctx.lineWidth = STROKE_WIDTH
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = 'none'

    const path = new Path2D(pathData)
    ctx.stroke(path)
    ctx.restore()

    icons[name] = {
      x,
      y: 0,
      width: size,
      height: size,
      uv: [x / atlasWidth, 0, size / atlasWidth, 1.0]
    }
  }

  const imageData = ctx.getImageData(0, 0, atlasWidth, atlasHeight)
  const coordsJson = JSON.stringify({
    atlas: { width: atlasWidth, height: atlasHeight, iconSize: size },
    icons
  })

  return {
    imageData: new Uint8Array(imageData.data.buffer),
    width: atlasWidth,
    height: atlasHeight,
    coordsJson
  }
}
