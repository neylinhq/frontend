import { describe, expect, it, vi } from 'vitest'

let drawResult: any = {
  data: new Uint8ClampedArray([255]),
  width: 1,
  height: 1,
  glyphWidth: 1,
  glyphHeight: 1,
  glyphTop: 1,
  glyphLeft: 0,
  glyphAdvance: 1
}

const mockDraw = () => drawResult

vi.mock('@mapbox/tiny-sdf', () => ({
  default: class {
    draw() {
      return mockDraw()
    }
  }
}))

import { createSDFAtlas, SDFAtlas } from '../lib/sdf-atlas'

describe('SDFAtlas', () => {
  it('caches glyphs and updates atlas data', () => {
    const atlas = new SDFAtlas({ atlasSize: 8 })
    const glyph = atlas.getGlyph('A')
    expect(glyph?.char).toBe('A')

    const cached = atlas.getGlyph('A')
    expect(cached).toBe(glyph)

    const atlasData = atlas.getAtlasData()
    expect(atlasData.dirty).toBe(true)

    const secondRead = atlas.getAtlasData()
    expect(secondRead.dirty).toBe(false)
  })

  it('returns null for empty input', () => {
    const atlas = new SDFAtlas({ atlasSize: 8 })
    expect(atlas.getGlyph('')).toBeNull()
  })

  it('handles empty glyphs and missing glyphLeft', () => {
    drawResult = {
      data: new Uint8ClampedArray(),
      width: 0,
      height: 0,
      glyphWidth: 0,
      glyphHeight: 0,
      glyphTop: 2,
      glyphLeft: undefined,
      glyphAdvance: 5
    }

    const atlas = new SDFAtlas({ atlasSize: 8 })
    const glyph = atlas.getGlyph(' ')
    expect(glyph?.width).toBe(0)
    expect(glyph?.glyphLeft).toBe(0)
  })

  it('fills glyphLeft fallback for non-empty glyphs', () => {
    drawResult = {
      data: new Uint8ClampedArray([255]),
      width: 1,
      height: 1,
      glyphWidth: 1,
      glyphHeight: 1,
      glyphTop: 1,
      glyphLeft: undefined,
      glyphAdvance: 1
    }

    const atlas = new SDFAtlas({ atlasSize: 8 })
    const glyph = atlas.getGlyph('B')
    expect(glyph?.glyphLeft).toBe(0)
  })

  it('returns null when atlas is full', () => {
    drawResult = {
      data: new Uint8ClampedArray([255]),
      width: 4,
      height: 4,
      glyphWidth: 4,
      glyphHeight: 4,
      glyphTop: 1,
      glyphLeft: 0,
      glyphAdvance: 1
    }

    const atlas = new SDFAtlas({ atlasSize: 2 })
    expect(atlas.getGlyph('A')).toBeNull()
  })

  it('returns glyph metrics json', () => {
    drawResult = {
      data: new Uint8ClampedArray([255]),
      width: 1,
      height: 1,
      glyphWidth: 1,
      glyphHeight: 1,
      glyphTop: 1,
      glyphLeft: 0,
      glyphAdvance: 1
    }
    const atlas = new SDFAtlas({ atlasSize: 8 })
    atlas.getGlyph('A')
    const json = atlas.getGlyphMetricsJson()
    expect(json).toContain('"atlas"')
  })

  it('returns shader params', () => {
    const atlas = new SDFAtlas({ fontSize: 10, radius: 3 })
    expect(atlas.getShaderParams()).toEqual({ pxRange: 6, fontSize: 10 })
  })

  it('creates atlas with default charset', () => {
    drawResult = {
      data: new Uint8ClampedArray([255]),
      width: 1,
      height: 1,
      glyphWidth: 1,
      glyphHeight: 1,
      glyphTop: 1,
      glyphLeft: 0,
      glyphAdvance: 1
    }
    const atlas = createSDFAtlas({ atlasSize: 256 })
    const glyph = atlas.getGlyph('A')
    expect(glyph).toBeTruthy()
  })
})
