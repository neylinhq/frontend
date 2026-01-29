import { beforeEach, describe, expect, it, vi } from 'vitest'

let api: typeof import('@/shared/api/client').api
let mapApi: typeof import('../map.api').mapApi

describe('mapApi', () => {
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
    ;({ mapApi } = await import('../map.api'))
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

  it('builds query strings and uses fallback totals', async () => {
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: [{ id: 'map-1' }] })
      .mockResolvedValueOnce({ data: [{ id: 'edge-1' }] })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: {} })

    const mapsResult = await mapApi.getMaps(1, 2)
    expect(mapsResult.total).toBe(1)
    expect(api.get).toHaveBeenCalledWith('/maps?limit=1&offset=2', { cookies: undefined })

    const edgesResult = await mapApi.getEdges('map-1', 5, 10)
    expect(edgesResult.total).toBe(1)
    expect(api.get).toHaveBeenCalledWith('/maps/map-1/edges?limit=5&offset=10')

    await mapApi.getDashboardMaps({ publicLimit: 2 })
    expect(api.get).toHaveBeenCalledWith('/maps/dashboard?publicLimit=2', { cookies: undefined })

    await mapApi.getDashboardMaps({})
    expect(api.get).toHaveBeenCalledWith('/maps/dashboard', { cookies: undefined })

    await mapApi.discoverMaps({
      filter: 'public',
      sortBy: 'createdAt',
      sortOrder: 'asc',
      limit: 10,
      offset: 5
    })
    expect(api.get).toHaveBeenCalledWith(
      '/maps/discover?filter=public&sortBy=createdAt&sortOrder=asc&limit=10&offset=5',
      { cookies: undefined }
    )

    await mapApi.discoverMaps({})
    expect(api.get).toHaveBeenCalledWith('/maps/discover?', { cookies: undefined })

    await mapApi.searchMaps({
      query: 'q',
      mode: 'maps',
      filter: 'public',
      limit: 5,
      offset: 1
    })
    expect(api.get).toHaveBeenCalledWith(
      '/maps/search?q=q&mode=maps&filter=public&limit=5&offset=1'
    )

    await mapApi.getNodes('map-1', 'concept')
    expect(api.get).toHaveBeenCalledWith('/maps/map-1/nodes?type=concept')

    await mapApi.getMapHistory('map-1', { limit: 2, offset: 3 })
    expect(api.get).toHaveBeenCalledWith('/maps/map-1/history?limit=2&offset=3')
  })
})
