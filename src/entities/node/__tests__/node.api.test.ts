import { beforeEach, describe, expect, it, vi } from 'vitest'

let api: typeof import('@/shared/api/client').api
let nodeApi: typeof import('../node.api').nodeApi

describe('nodeApi', () => {
  beforeEach(async () => {
    vi.resetModules()
    vi.doMock('@/shared/api/client', () => ({
      api: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
      }
    }))
    ;({ api } = await import('@/shared/api/client'))
    ;({ nodeApi } = await import('../node.api'))
  })

  it('calls node endpoints', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    vi.mocked(api.patch).mockResolvedValue({ data: {} })
    vi.mocked(api.delete).mockResolvedValue({})

    await nodeApi.create('map-1', {
      mapId: 'map-1',
      label: 'Node',
      type: 'concept',
      position: { x: 0, y: 0 },
      metadata: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    })
    await nodeApi.get('map-1', 'node-1')
    await nodeApi.list('map-1')
    await nodeApi.list('map-1', 'concept')
    await nodeApi.update('map-1', 'node-1', { label: 'Updated' })
    await nodeApi.delete('map-1', 'node-1')
    await nodeApi.updatePositions('map-1', { positions: [{ id: 'node-1', x: 1, y: 2 }] })
    await nodeApi.generateEmbedding('map-1', 'node-1')

    expect(api.post).toHaveBeenCalledWith('/maps/map-1/nodes', expect.any(Object))
    expect(api.get).toHaveBeenCalledWith('/maps/map-1/nodes/node-1')
    expect(api.get).toHaveBeenCalledWith('/maps/map-1/nodes?type=concept')
  })
})
