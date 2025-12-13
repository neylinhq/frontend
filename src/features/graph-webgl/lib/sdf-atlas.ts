/**
 * SDF Font Atlas Manager using Mapbox tiny-sdf
 *
 * Generates signed distance field glyphs on-the-fly from system fonts.
 * This is the same approach used by Mapbox GL JS.
 */

import TinySDF from '@mapbox/tiny-sdf'

// Glyph data returned by tiny-sdf
export interface GlyphData {
  data: Uint8ClampedArray // Alpha values 0-255
  width: number
  height: number
  glyphWidth: number
  glyphHeight: number
  glyphTop: number // Ascent from baseline
  glyphLeft: number
  glyphAdvance: number
}

// Cached glyph with atlas position
export interface CachedGlyph {
  char: string
  codepoint: number
  // Position in atlas texture
  x: number
  y: number
  width: number
  height: number
  // Glyph metrics
  glyphWidth: number
  glyphHeight: number
  glyphTop: number
  glyphLeft: number
  glyphAdvance: number
  // UV coordinates (normalized 0-1)
  u: number
  v: number
  uWidth: number
  vHeight: number
}

// Atlas configuration
export interface SDFAtlasConfig {
  fontSize: number
  fontFamily: string
  fontWeight: string
  buffer: number // Padding around glyphs
  radius: number // SDF radius
  cutoff: number // SDF cutoff
  atlasSize: number // Texture size (power of 2)
}

const DEFAULT_CONFIG: SDFAtlasConfig = {
  fontSize: 48, // Larger for better quality when scaled down
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeight: '400',
  buffer: 3,
  radius: 8,
  cutoff: 0.25,
  atlasSize: 1024,
}

/**
 * SDF Font Atlas
 * Manages a texture atlas of SDF glyphs generated on-demand
 */
export class SDFAtlas {
  private config: SDFAtlasConfig
  private sdf: TinySDF
  private glyphs: Map<number, CachedGlyph> = new Map()
  private atlasData: Uint8Array
  private atlasWidth: number
  private atlasHeight: number
  private nextX = 0 // Next glyph position in atlas
  private nextY = 0
  private rowHeight = 0 // Height of current row
  private dirty = false // Atlas needs re-upload

  constructor(config: Partial<SDFAtlasConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    this.sdf = new TinySDF({
      fontSize: this.config.fontSize,
      fontFamily: this.config.fontFamily,
      fontWeight: this.config.fontWeight,
      buffer: this.config.buffer,
      radius: this.config.radius,
      cutoff: this.config.cutoff,
    })

    this.atlasWidth = this.config.atlasSize
    this.atlasHeight = this.config.atlasSize
    // Single-channel (alpha only) - will be uploaded as GL_ALPHA or GL_RED
    this.atlasData = new Uint8Array(this.atlasWidth * this.atlasHeight)
  }

  /**
   * Get or create a glyph in the atlas
   */
  getGlyph(char: string): CachedGlyph | null {
    const codepoint = char.codePointAt(0)
    if (codepoint === undefined) return null

    // Check cache
    let cached = this.glyphs.get(codepoint)
    if (cached) return cached

    // Generate new glyph
    const glyphData = this.sdf.draw(char) as GlyphData

    // Skip empty glyphs (spaces, etc.)
    if (glyphData.width === 0 || glyphData.height === 0) {
      // Still cache it with zero size for advance
      cached = {
        char,
        codepoint,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        glyphWidth: 0,
        glyphHeight: 0,
        glyphTop: glyphData.glyphTop,
        glyphLeft: glyphData.glyphLeft ?? 0,
        glyphAdvance: glyphData.glyphAdvance,
        u: 0,
        v: 0,
        uWidth: 0,
        vHeight: 0,
      }
      this.glyphs.set(codepoint, cached)
      return cached
    }

    // Find position in atlas
    const { x, y } = this.allocateSpace(glyphData.width, glyphData.height)
    if (x < 0) {
      return null // Atlas full
    }

    // Copy glyph data to atlas
    this.copyGlyphToAtlas(glyphData.data, glyphData.width, glyphData.height, x, y)
    this.dirty = true

    // Create cached entry
    cached = {
      char,
      codepoint,
      x,
      y,
      width: glyphData.width,
      height: glyphData.height,
      glyphWidth: glyphData.glyphWidth,
      glyphHeight: glyphData.glyphHeight,
      glyphTop: glyphData.glyphTop,
      glyphLeft: glyphData.glyphLeft ?? 0,
      glyphAdvance: glyphData.glyphAdvance,
      // UV coordinates (normalized)
      u: x / this.atlasWidth,
      v: y / this.atlasHeight,
      uWidth: glyphData.width / this.atlasWidth,
      vHeight: glyphData.height / this.atlasHeight,
    }
    this.glyphs.set(codepoint, cached)

    return cached
  }

  /**
   * Pre-generate glyphs for a character set
   */
  preloadCharset(charset: string): void {
    for (const char of charset) {
      this.getGlyph(char)
    }
  }

  /**
   * Get atlas texture data
   * Returns single-channel (alpha) data
   */
  getAtlasData(): { data: Uint8Array; width: number; height: number; dirty: boolean } {
    const result = {
      data: this.atlasData,
      width: this.atlasWidth,
      height: this.atlasHeight,
      dirty: this.dirty,
    }
    this.dirty = false
    return result
  }

  /**
   * Get all cached glyph metrics for WASM
   * Returns JSON string matching the Rust SdfAtlasJson format
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

    for (const glyph of this.glyphs.values()) {
      glyphsArray.push({
        char: glyph.char,
        codepoint: glyph.codepoint,
        x: glyph.x,
        y: glyph.y,
        width: glyph.width,
        height: glyph.height,
        glyphWidth: glyph.glyphWidth,
        glyphHeight: glyph.glyphHeight,
        glyphTop: glyph.glyphTop,
        glyphLeft: glyph.glyphLeft,
        glyphAdvance: glyph.glyphAdvance,
      })
    }

    return JSON.stringify({
      atlas: {
        width: this.atlasWidth,
        height: this.atlasHeight,
        fontSize: this.config.fontSize,
        buffer: this.config.buffer,
        radius: this.config.radius,
        lineHeight: this.config.fontSize * 1.3, // Standard line height
      },
      glyphs: glyphsArray,
    })
  }

  /**
   * Get config for SDF shader
   */
  getShaderParams(): { pxRange: number; fontSize: number } {
    return {
      pxRange: this.config.radius * 2, // SDF range in pixels
      fontSize: this.config.fontSize,
    }
  }

  // --- Private methods ---

  private allocateSpace(width: number, height: number): { x: number; y: number } {
    // Simple row-based allocation
    if (this.nextX + width > this.atlasWidth) {
      // Move to next row
      this.nextX = 0
      this.nextY += this.rowHeight + 1 // 1px gap between rows
      this.rowHeight = 0
    }

    if (this.nextY + height > this.atlasHeight) {
      // Atlas full
      return { x: -1, y: -1 }
    }

    const x = this.nextX
    const y = this.nextY

    this.nextX += width + 1 // 1px gap between glyphs
    this.rowHeight = Math.max(this.rowHeight, height)

    return { x, y }
  }

  private copyGlyphToAtlas(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    destX: number,
    destY: number
  ): void {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = y * width + x
        const dstIdx = (destY + y) * this.atlasWidth + (destX + x)
        this.atlasData[dstIdx] = data[srcIdx]
      }
    }
  }
}

// Default character sets
export const CHARSET_BASIC =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~'

export const CHARSET_CYRILLIC =
  'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя'

export const CHARSET_EXTENDED = CHARSET_BASIC + CHARSET_CYRILLIC + '—–…«»„"'

/**
 * Create a pre-populated SDF atlas with common characters
 */
export function createSDFAtlas(config?: Partial<SDFAtlasConfig>): SDFAtlas {
  const atlas = new SDFAtlas(config)
  atlas.preloadCharset(CHARSET_EXTENDED)
  return atlas
}
