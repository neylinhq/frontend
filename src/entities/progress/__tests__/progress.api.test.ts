import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn()
  }
}))

import { api } from '@/shared/api/client'

import { progressApi } from '../progress.api'

describe('progressApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls progress endpoints', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    vi.mocked(api.patch).mockResolvedValue({ data: {} })

    await progressApi.getNodeProgress('map-1', 'node-1')
    await progressApi.getAllNodeProgress('map-1')
    await progressApi.updateNodeProgress('map-1', 'node-1', { confidence: 0.5 })
    await progressApi.reviewNode('map-1', 'node-1', { correct: true })
    await progressApi.toggleBookmark('map-1', 'node-1')
    await progressApi.getMapProgress('map-1')
    await progressApi.updateViewport('map-1', { viewport: { x: 1, y: 2, zoom: 1 } })
    await progressApi.updateMapProgress('map-1', { isFavorite: true })
    await progressApi.setFavorite('map-1', true)
    await progressApi.getMapStats('map-1')

    expect(api.get).toHaveBeenCalledWith('/maps/map-1/nodes/node-1/progress')
    expect(api.patch).toHaveBeenCalledWith('/maps/map-1/progress/favorite', { isFavorite: true })
  })
})
