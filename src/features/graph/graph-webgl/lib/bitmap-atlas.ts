/**
 * Bitmap Font Atlas — Canvas 2D glyph rasterizer
 *
 * Renders glyphs using the browser's native text engine (Canvas 2D fillText)
 * and packs them into a texture atlas. This gives perfect font rendering
 * (kerning, hinting, subpixel AA) using any CSS font (e.g., Söhne).
 *
 * Unlike SDF/MSDF, bitmap glyphs are resolution-dependent.
 * Re-rasterize when zoom changes significantly for crisp text at all scales.
 */

export interface BitmapAtlasConfig {
  /** Render font size in px (higher = sharper when scaled down) */
  fontSize: number
  /** CSS font-family */
  fontFamily: string
  /** CSS font-weight */
  fontWeight: string
  /** Padding around each glyph in atlas (px) */
  padding: number
  /** Atlas texture size (power of 2) */
  atlasSize: number
}

export interface BitmapGlyphMetrics {
  codepoint: number
  char: string
  /** Position in atlas */
  x: number
  y: number
  width: number
  height: number
  /** Glyph metrics (in render fontSize units) */
  glyphWidth: number
  glyphHeight: number
  glyphTop: number // ascent from baseline
  glyphLeft: number // left bearing
  glyphAdvance: number // horizontal advance
}

const DEFAULT_CONFIG: BitmapAtlasConfig = {
  fontSize: 128, // 8x typical display size (16px) — more detail for sharp edges
  fontFamily: '"Söhne", ui-sans-serif, system-ui, sans-serif',
  fontWeight: '600',
  padding: 2,
  atlasSize: 2048
}

// Character sets
const CHARSET_BASIC =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'
const CHARSET_CYRILLIC =
  'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя'
const CHARSET_EXTENDED = `${CHARSET_BASIC}${CHARSET_CYRILLIC}—–…«»„"№·`

export class BitmapAtlas {
  private config: BitmapAtlasConfig
  private canvas: OffscreenCanvas
  private ctx: OffscreenCanvasRenderingContext2D
  private glyphs: Map<number, BitmapGlyphMetrics> = new Map()
  private atlasCanvas: OffscreenCanvas
  private atlasCtx: OffscreenCanvasRenderingContext2D
  // Row packing state
  private nextX = 0
  private nextY = 0
  private rowHeight = 0

  constructor(config: Partial<BitmapAtlasConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    // Scratch canvas for measuring individual glyphs
    this.canvas = new OffscreenCanvas(
      this.config.fontSize * 3,
      this.config.fontSize * 3
    )
    this.ctx = this.canvas.getContext('2d')!

    // Atlas canvas
    this.atlasCanvas = new OffscreenCanvas(
      this.config.atlasSize,
      this.config.atlasSize
    )
    this.atlasCtx = this.atlasCanvas.getContext('2d', {
      willReadFrequently: true
    })!
  }

  private setupCtx(ctx: OffscreenCanvasRenderingContext2D) {
    ctx.font = `${this.config.fontWeight} ${this.config.fontSize}px ${this.config.fontFamily}`
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
  }

  /**
   * Render a single glyph and measure its tight bounds.
   * Returns the pixel data and metrics.
   */
  private renderGlyph(char: string): BitmapGlyphMetrics & { pixels: ImageData } | null {
    const { fontSize, padding } = this.config
    const codepoint = char.codePointAt(0)
    if (codepoint === undefined) return null

    const ctx = this.ctx
    const canvasSize = fontSize * 3

    // Clear
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // Setup font
    this.setupCtx(ctx)

    // Measure advance width
    const measured = ctx.measureText(char)
    const advance = measured.width

    // For space and zero-width chars
    if (advance < 0.5 || char === ' ') {
      return {
        codepoint,
        char,
        x: 0, y: 0, width: 0, height: 0,
        glyphWidth: 0, glyphHeight: 0,
        glyphTop: 0, glyphLeft: 0,
        glyphAdvance: advance,
        pixels: new ImageData(1, 1)
      }
    }

    // Draw glyph at a known origin
    const originX = fontSize
    const originY = fontSize * 1.5
    ctx.fillStyle = 'white'
    ctx.fillText(char, originX, originY)

    // Read pixels to find tight bounding box
    const imgData = ctx.getImageData(0, 0, canvasSize, canvasSize)
    const { data } = imgData

    let minX = canvasSize, minY = canvasSize, maxX = 0, maxY = 0
    for (let y = 0; y < canvasSize; y++) {
      for (let x = 0; x < canvasSize; x++) {
        const alpha = data[(y * canvasSize + x) * 4 + 3]
        if (alpha > 0) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }

    if (maxX < minX) {
      // Invisible glyph
      return {
        codepoint, char,
        x: 0, y: 0, width: 0, height: 0,
        glyphWidth: 0, glyphHeight: 0,
        glyphTop: 0, glyphLeft: 0,
        glyphAdvance: advance,
        pixels: new ImageData(1, 1)
      }
    }

    // Add padding
    minX = Math.max(0, minX - padding)
    minY = Math.max(0, minY - padding)
    maxX = Math.min(canvasSize - 1, maxX + padding)
    maxY = Math.min(canvasSize - 1, maxY + padding)

    const glyphW = maxX - minX + 1
    const glyphH = maxY - minY + 1

    // Extract glyph pixels
    const glyphPixels = ctx.getImageData(minX, minY, glyphW, glyphH)

    // Convert to white text with sharpened alpha (premultiplied).
    // Canvas 2D anti-aliasing produces soft edges — apply a contrast curve
    // to tighten them before storing in the atlas.
    const pd = glyphPixels.data
    for (let i = 0; i < pd.length; i += 4) {
      let a = pd[i + 3]
      // Sharpen: sigmoid contrast on alpha (steeper edge transition)
      // Maps 0..255 through a curve that makes mid-values snap to 0 or 255
      const t = a / 255
      const sharpened = t * t * (3 - 2 * t) // smoothstep: tighter than linear
      a = Math.round(sharpened * 255)
      pd[i] = a     // R = alpha (premultiplied white)
      pd[i + 1] = a // G
      pd[i + 2] = a // B
      pd[i + 3] = a // A
    }

    // Metrics relative to the drawing origin
    const glyphLeft = minX - originX
    const glyphTop = originY - minY // distance from baseline to top (positive = above)

    return {
      codepoint, char,
      x: 0, y: 0, // will be set when placed in atlas
      width: glyphW, height: glyphH,
      glyphWidth: maxX - minX + 1 - padding * 2, // actual glyph width without padding
      glyphHeight: maxY - minY + 1 - padding * 2,
      glyphTop,
      glyphLeft,
      glyphAdvance: advance,
      pixels: glyphPixels
    }
  }

  /**
   * Allocate space in the atlas for a glyph of given dimensions
   */
  private allocateSpace(w: number, h: number): { x: number; y: number } | null {
    const { atlasSize } = this.config

    if (this.nextX + w > atlasSize) {
      this.nextX = 0
      this.nextY += this.rowHeight + 1
      this.rowHeight = 0
    }

    if (this.nextY + h > atlasSize) {
      return null // atlas full
    }

    const x = this.nextX
    const y = this.nextY
    this.nextX += w + 1
    this.rowHeight = Math.max(this.rowHeight, h)
    return { x, y }
  }

  /**
   * Pre-render all characters in the charset
   */
  preloadCharset(charset: string = CHARSET_EXTENDED): void {
    for (const char of charset) {
      const glyph = this.renderGlyph(char)
      if (!glyph) continue

      if (glyph.width === 0 || glyph.height === 0) {
        // Space or invisible — cache with zero size
        this.glyphs.set(glyph.codepoint, {
          codepoint: glyph.codepoint,
          char: glyph.char,
          x: 0, y: 0, width: 0, height: 0,
          glyphWidth: 0, glyphHeight: 0,
          glyphTop: glyph.glyphTop,
          glyphLeft: glyph.glyphLeft,
          glyphAdvance: glyph.glyphAdvance
        })
        continue
      }

      const pos = this.allocateSpace(glyph.width, glyph.height)
      if (!pos) {
        console.warn('[BitmapAtlas] Atlas full, cannot fit glyph:', char)
        continue
      }

      // Blit glyph into atlas canvas
      this.atlasCtx.putImageData(glyph.pixels, pos.x, pos.y)

      this.glyphs.set(glyph.codepoint, {
        codepoint: glyph.codepoint,
        char: glyph.char,
        x: pos.x,
        y: pos.y,
        width: glyph.width,
        height: glyph.height,
        glyphWidth: glyph.glyphWidth,
        glyphHeight: glyph.glyphHeight,
        glyphTop: glyph.glyphTop,
        glyphLeft: glyph.glyphLeft,
        glyphAdvance: glyph.glyphAdvance
      })
    }
  }

  /**
   * Get atlas as RGBA Uint8Array for WebGL texture upload
   */
  getAtlasData(): { data: Uint8Array; width: number; height: number } {
    const { atlasSize } = this.config
    const imgData = this.atlasCtx.getImageData(0, 0, atlasSize, atlasSize)
    return {
      data: new Uint8Array(imgData.data.buffer),
      width: atlasSize,
      height: atlasSize
    }
  }

  /**
   * Get glyph metrics JSON compatible with the Rust SdfAtlasJson format
   * (reuses the same JSON schema so we don't need a new Rust parser)
   */
  getGlyphMetricsJson(): string {
    const glyphsArray: Array<{
      char: string
      codepoint: number
      x: number
      y: number
      width: number
      height: number
      glyphWidth: number
      glyphHeight: number
      glyphTop: number
      glyphLeft: number
      glyphAdvance: number
    }> = []

    for (const g of this.glyphs.values()) {
      glyphsArray.push({
        char: g.char,
        codepoint: g.codepoint,
        x: g.x,
        y: g.y,
        width: g.width,
        height: g.height,
        glyphWidth: g.glyphWidth,
        glyphHeight: g.glyphHeight,
        glyphTop: g.glyphTop,
        glyphLeft: g.glyphLeft,
        glyphAdvance: g.glyphAdvance
      })
    }

    return JSON.stringify({
      atlas: {
        width: this.config.atlasSize,
        height: this.config.atlasSize,
        fontSize: this.config.fontSize,
        buffer: this.config.padding,
        radius: 0, // no SDF
        lineHeight: this.config.fontSize * 1.3
      },
      glyphs: glyphsArray
    })
  }
}

/**
 * Create a pre-populated bitmap atlas with common characters
 */
export function createBitmapAtlas(
  config?: Partial<BitmapAtlasConfig>
): BitmapAtlas {
  const atlas = new BitmapAtlas(config)
  atlas.preloadCharset()
  return atlas
}
