import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}))

import { api } from '@/shared/api/client'
import { mapApi } from '../map.api'

describe('mapApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls map endpoints', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [], meta: { total: 0 } })
    vi.mocked(api.post).mockResolvedValue({ data: {} })
    vi.mocked(api.patch).mockResolvedValue({ data: {} })
    vi.mocked(api.delete).mockResolvedValue({})

    await mapApi.getMaps()
    await mapApi.getMapById('map-1')
    await mapApi.createMap({ title: 'Test' })
    await mapApi.updateMap('map-1', { title: 'New' })
    await mapApi.deleteMap('map-1')
    await mapApi.getDashboardMaps({ ownedLimit: 1 })
    await mapApi.discoverMaps({ filter: 'all', limit: 10, offset: 0 })
    await mapApi.searchMaps({ query: 'test' })
    await mapApi.copyMap('map-1')
    await mapApi.setVisibility('map-1', true)
    await mapApi.getFullMap('map-1')
    await mapApi.analyzeGraph('map-1', 'gpt-4', true)
    await mapApi.getNodes('map-1')
    await mapApi.getNodeWithContent('map-1', 'node-1')
    await mapApi.createNode('map-1', {
      label: 'Node',
      type: 'concept',
      position: { x: 0, y: 0 }
    })
    await mapApi.updateNode('map-1', 'node-1', { label: 'Updated' })
    await mapApi.deleteNode('map-1', 'node-1')
    await mapApi.updateNodePosition('map-1', 'node-1', { x: 1, y: 2 })
    await mapApi.updateNodePositions('map-1', [{ id: 'node-1', x: 1, y: 2 }])
    await mapApi.getEdges('map-1')
    await mapApi.createEdge('map-1', {
      sourceNodeId: 'node-1',
      targetNodeId: 'node-2',
      relationType: 'related-to'
    })
    await mapApi.updateEdge('map-1', 'edge-1', { label: 'Edge' })
    await mapApi.deleteEdge('map-1', 'edge-1')
    await mapApi.getMapHistory('map-1')
    await mapApi.getMapHistorySummary('map-1')
    await mapApi.applyFragment('map-1', {
      nodes: [
        {
          tempId: 'temp-1',
          label: 'Node',
          type: 'concept',
          description: 'desc',
          positionX: 0,
          positionY: 0
        }
      ],
      edges: [
        {
          fromRef: 'temp-1',
          toRef: 'temp-2',
          fromIsNew: true,
          toIsNew: true,
          relationType: 'related-to'
        }
      ]
    })

    expect(api.get).toHaveBeenCalledWith('/maps?limit=20&offset=0', { cookies: undefined })
    expect(api.post).toHaveBeenCalledWith('/maps', { title: 'Test' })
  })
})
