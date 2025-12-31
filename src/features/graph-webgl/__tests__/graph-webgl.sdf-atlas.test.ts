import { describe, expect, it, vi } from 'vitest'

const mockDraw = () => ({
  data: new Uint8ClampedArray([255]),
  width: 1,
  height: 1,
  glyphWidth: 1,
  glyphHeight: 1,
  glyphTop: 1,
  glyphLeft: 0,
  glyphAdvance: 1
})

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

    const atlasData = atlas.getAtlasData()
    expect(atlasData.dirty).toBe(true)

    const secondRead = atlas.getAtlasData()
    expect(secondRead.dirty).toBe(false)
  })

  it('returns glyph metrics json', () => {
    const atlas = new SDFAtlas({ atlasSize: 8 })
    atlas.getGlyph('A')
    const json = atlas.getGlyphMetricsJson()
    expect(json).toContain('"atlas"')
  })

  it('creates atlas with default charset', () => {
    const atlas = createSDFAtlas({ atlasSize: 8 })
    const glyph = atlas.getGlyph('A')
    expect(glyph).toBeTruthy()
  })
})
