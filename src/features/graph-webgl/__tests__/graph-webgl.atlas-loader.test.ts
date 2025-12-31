import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { loadFontAtlas, loadIconAtlas, preloadAtlases } from '../lib/atlas-loader'

class OffscreenCanvasMock {
  width: number
  height: number

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  getContext() {
    return {
      drawImage: vi.fn(),
      getImageData: () => ({
        data: new Uint8ClampedArray(this.width * this.height * 4)
      })
    }
  }
}

describe('atlas loader', () => {
  beforeEach(() => {
    vi.stubGlobal('OffscreenCanvas', OffscreenCanvasMock)
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 2, height: 3 }))
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.endsWith('.json')) {
          return {
            json: async () => ({ atlas: { width: 2, height: 3 }, icons: {} })
          }
        }
        return {
          blob: async () => new Blob()
        }
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads font atlas data', async () => {
    const result = await loadFontAtlas('/assets', 'inter-msdf')
    expect(result.width).toBe(2)
    expect(result.height).toBe(3)
    expect(result.metrics).toBeTruthy()
  })

  it('loads icon atlas data', async () => {
    const result = await loadIconAtlas('/assets')
    expect(result.width).toBe(2)
    expect(result.height).toBe(3)
    expect(result.coords).toBeTruthy()
  })

  it('preloads all atlases', async () => {
    const result = await preloadAtlases('/assets')
    expect(result.font).toBeTruthy()
    expect(result.icons).toBeTruthy()
  })
})
