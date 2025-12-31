import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createQueryWrapper, createTestQueryClient } from '@/shared/tests'

vi.mock('../map.api', () => ({
  mapApi: {
    getMaps: vi.fn(),
    getMapById: vi.fn(),
    createMap: vi.fn(),
    updateMap: vi.fn(),
    deleteMap: vi.fn(),
    getDashboardMaps: vi.fn(),
    discoverMaps: vi.fn(),
    searchMaps: vi.fn(),
    copyMap: vi.fn(),
    setVisibility: vi.fn(),
    getFullMap: vi.fn(),
    analyzeGraph: vi.fn(),
    getNodes: vi.fn(),
    getNodeWithContent: vi.fn(),
    createNode: vi.fn(),
    updateNode: vi.fn(),
    deleteNode: vi.fn(),
    updateNodePosition: vi.fn(),
    updateNodePositions: vi.fn(),
    getEdges: vi.fn(),
    createEdge: vi.fn(),
    updateEdge: vi.fn(),
    deleteEdge: vi.fn(),
    getMapHistory: vi.fn(),
    getMapHistorySummary: vi.fn(),
    applyFragment: vi.fn()
  }
}))

import { mapApi } from '../map.api'
import {
  mapKeys,
  useAnalyzeGraph,
  useApplyGraphFragment,
  useCopyMap,
  useCreateEdge,
  useCreateMap,
  useCreateNode,
  useDashboardMaps,
  useDeleteEdge,
  useDeleteMap,
  useDeleteNode,
  useDiscoverMaps,
  useFullMap,
  useGraphAnalysis,
  useLightweightMap,
  useMap,
  useMapEdges,
  useMapHistory,
  useMapHistorySummary,
  useMapNodes,
  useMaps,
  useNodeWithContent,
  useSearchMaps,
  useSetVisibility,
  useUpdateEdge,
  useUpdateMap,
  useUpdateNode,
  useUpdateNodePosition,
  useUpdateNodePositions
} from '../map.queries'

describe('map queries', () => {
  const mapEntity = {
    id: 'map-1',
    title: 'Map',
    description: 'Desc',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    nodesCount: 0,
    edgesCount: 0,
    isPublic: false
  }

  const node = {
    id: 'node-1',
    mapId: 'map-1',
    label: 'Node',
    type: 'concept',
    position: { x: 0, y: 0 },
    metadata: {},
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  const edge = {
    id: 'edge-1',
    mapId: 'map-1',
    sourceNodeId: 'node-1',
    targetNodeId: 'node-2',
    relationType: 'related-to',
    strength: 0.5,
    bidirectional: false,
    metadata: { confidence: 0.5, createdBy: 'user' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  const fullMap = {
    ...mapEntity,
    nodes: [node],
    edges: [edge],
    aiAnalysis: {
      lastAnalyzed: '2024-01-01T00:00:00.000Z',
      gaps: [],
      suggestions: [],
      complexityScore: 0.5,
      completenessScore: 0.5,
      structuralIssues: []
    }
  }

  const discoverResponse = {
    maps: [mapEntity],
    totalCount: 1,
    ownedCount: 1,
    publicCount: 0
  }

  const dashboardResponse = {
    owned: { maps: [mapEntity], total: 1, hasMore: false },
    public: { maps: [], total: 0, hasMore: false }
  }

  const searchResponse = {
    maps: [{ ...mapEntity, matchedNodes: [{ id: 'node-1', label: 'Node' }] }],
    totalCount: 1,
    query: 'search',
    searchedIn: 'maps'
  }

  const historyResponse = { events: [], totalCount: 0 }
  const historySummary = {
    totalEvents: 0,
    latestVersion: 1,
    nodesCreated: 0,
    nodesUpdated: 0,
    nodesDeleted: 0,
    edgesCreated: 0,
    edgesDeleted: 0,
    aiChangesCount: 0,
    userChangesCount: 0
  }

  it('fetches map queries', async () => {
    vi.mocked(mapApi.getMaps).mockResolvedValue({ maps: [mapEntity], total: 1 })
    vi.mocked(mapApi.getMapById).mockResolvedValue(mapEntity)
    vi.mocked(mapApi.getNodes).mockResolvedValue([node])
    vi.mocked(mapApi.getEdges).mockResolvedValue({ edges: [edge], total: 1 })
    vi.mocked(mapApi.getFullMap).mockResolvedValue(fullMap)
    vi.mocked(mapApi.getNodeWithContent).mockResolvedValue(node)
    vi.mocked(mapApi.analyzeGraph).mockResolvedValue(fullMap.aiAnalysis)
    vi.mocked(mapApi.getDashboardMaps).mockResolvedValue(dashboardResponse)
    vi.mocked(mapApi.discoverMaps).mockResolvedValue(discoverResponse)
    vi.mocked(mapApi.searchMaps).mockResolvedValue(searchResponse)
    vi.mocked(mapApi.getMapHistory).mockResolvedValue(historyResponse)
    vi.mocked(mapApi.getMapHistorySummary).mockResolvedValue(historySummary)

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result: mapsResult } = renderHook(() => useMaps(), { wrapper })
    await waitFor(() => expect(mapsResult.current.data).toEqual({ maps: [mapEntity], total: 1 }))

    const { result: mapResult } = renderHook(() => useMap('map-1'), { wrapper })
    await waitFor(() => expect(mapResult.current.data).toEqual(mapEntity))

    const { result: nodesResult } = renderHook(() => useMapNodes('map-1'), { wrapper })
    await waitFor(() => expect(nodesResult.current.data).toEqual([node]))

    const { result: edgesResult } = renderHook(() => useMapEdges('map-1'), { wrapper })
    await waitFor(() => expect(edgesResult.current.data).toEqual({ edges: [edge], total: 1 }))

    const { result: fullResult } = renderHook(() => useFullMap('map-1'), { wrapper })
    await waitFor(() => expect(fullResult.current.data).toEqual(fullMap))

    const { result: lightResult } = renderHook(() => useLightweightMap('map-1'), { wrapper })
    await waitFor(() => expect(lightResult.current.data).toEqual(fullMap))

    const { result: nodeContent } = renderHook(() => useNodeWithContent('map-1', 'node-1'), {
      wrapper
    })
    await waitFor(() => expect(nodeContent.current.data).toEqual(node))

    const { result: analysis } = renderHook(() => useGraphAnalysis('map-1'), { wrapper })
    await waitFor(() => expect(analysis.current.data).toEqual(fullMap.aiAnalysis))

    const { result: dashboard } = renderHook(() => useDashboardMaps(), { wrapper })
    await waitFor(() => expect(dashboard.current.data).toEqual(dashboardResponse))

    const { result: discover } = renderHook(() => useDiscoverMaps({ filter: 'all' }), { wrapper })
    await waitFor(() => expect(discover.current.data).toEqual(discoverResponse))

    const { result: search } = renderHook(
      () => useSearchMaps({ query: 'search', mode: 'maps', limit: 10, offset: 0 }),
      { wrapper }
    )
    await waitFor(() => expect(search.current.data).toEqual(searchResponse))

    const { result: history } = renderHook(() => useMapHistory('map-1'), { wrapper })
    await waitFor(() => expect(history.current.data).toEqual(historyResponse))

    const { result: summary } = renderHook(() => useMapHistorySummary('map-1'), { wrapper })
    await waitFor(() => expect(summary.current.data).toEqual(historySummary))
  })

  it('handles map mutations', async () => {
    vi.mocked(mapApi.createMap).mockResolvedValue(mapEntity)
    vi.mocked(mapApi.updateMap).mockResolvedValue(mapEntity)
    vi.mocked(mapApi.deleteMap).mockResolvedValue(undefined)
    vi.mocked(mapApi.createNode).mockResolvedValue(node)
    vi.mocked(mapApi.updateNode).mockResolvedValue(node)
    vi.mocked(mapApi.deleteNode).mockResolvedValue(undefined)
    vi.mocked(mapApi.createEdge).mockResolvedValue(edge)
    vi.mocked(mapApi.updateEdge).mockResolvedValue(edge)
    vi.mocked(mapApi.deleteEdge).mockResolvedValue(undefined)
    vi.mocked(mapApi.analyzeGraph).mockResolvedValue(fullMap.aiAnalysis)
    vi.mocked(mapApi.applyFragment).mockResolvedValue({
      createdNodes: [node],
      createdEdges: [edge],
      tempIdMapping: { temp: 'node-1' }
    })
    vi.mocked(mapApi.copyMap).mockResolvedValue(mapEntity)
    vi.mocked(mapApi.setVisibility).mockResolvedValue(mapEntity)
    vi.mocked(mapApi.updateNodePosition).mockResolvedValue(undefined)
    vi.mocked(mapApi.updateNodePositions).mockResolvedValue(undefined)

    const queryClient = createTestQueryClient()
    queryClient.setQueryData(mapKeys.discover('all'), discoverResponse)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = createQueryWrapper(queryClient)

    const { result: createMap } = renderHook(() => useCreateMap(), { wrapper })
    await act(async () => {
      await createMap.current.mutateAsync({ title: 'Map' })
    })

    const { result: updateMap } = renderHook(() => useUpdateMap('map-1'), { wrapper })
    await act(async () => {
      await updateMap.current.mutateAsync({ title: 'New' })
    })

    const { result: deleteMap } = renderHook(() => useDeleteMap(), { wrapper })
    await act(async () => {
      await deleteMap.current.mutateAsync('map-1')
    })

    const updatedDiscover = queryClient.getQueryData(mapKeys.discover('all'))
    expect(updatedDiscover).toEqual({
      maps: [],
      totalCount: 0,
      ownedCount: 0,
      publicCount: 0
    })

    const { result: createNode } = renderHook(() => useCreateNode('map-1'), { wrapper })
    await act(async () => {
      await createNode.current.mutateAsync({
        label: 'Node',
        type: 'concept',
        position: { x: 0, y: 0 }
      })
    })

    const { result: updateNode } = renderHook(() => useUpdateNode('map-1'), { wrapper })
    await act(async () => {
      await updateNode.current.mutateAsync({ id: 'node-1', data: { label: 'New' } })
    })

    const { result: deleteNode } = renderHook(() => useDeleteNode('map-1'), { wrapper })
    await act(async () => {
      await deleteNode.current.mutateAsync('node-1')
    })

    const { result: createEdge } = renderHook(() => useCreateEdge('map-1'), { wrapper })
    await act(async () => {
      await createEdge.current.mutateAsync({
        sourceNodeId: 'node-1',
        targetNodeId: 'node-2',
        relationType: 'related-to'
      })
    })

    const { result: updateEdge } = renderHook(() => useUpdateEdge('map-1'), { wrapper })
    await act(async () => {
      await updateEdge.current.mutateAsync({ id: 'edge-1', data: { label: 'Edge' } })
    })

    const { result: deleteEdge } = renderHook(() => useDeleteEdge('map-1'), { wrapper })
    await act(async () => {
      await deleteEdge.current.mutateAsync('edge-1')
    })

    const { result: analyze } = renderHook(() => useAnalyzeGraph('map-1'), { wrapper })
    await act(async () => {
      await analyze.current.mutateAsync()
    })

    const { result: applyFragment } = renderHook(() => useApplyGraphFragment('map-1'), { wrapper })
    await act(async () => {
      await applyFragment.current.mutateAsync({
        nodes: [
          {
            tempId: 'temp',
            label: 'Node',
            type: 'concept',
            description: 'desc',
            positionX: 0,
            positionY: 0
          }
        ],
        edges: [
          {
            fromRef: 'temp',
            toRef: 'temp2',
            fromIsNew: true,
            toIsNew: true,
            relationType: 'related-to'
          }
        ]
      })
    })

    const { result: copy } = renderHook(() => useCopyMap(), { wrapper })
    await act(async () => {
      await copy.current.mutateAsync('map-1')
    })

    const { result: visibility } = renderHook(() => useSetVisibility(), { wrapper })
    await act(async () => {
      await visibility.current.mutateAsync({ mapId: 'map-1', isPublic: true })
    })

    const { result: updatePosition } = renderHook(() => useUpdateNodePosition('map-1'), { wrapper })
    await act(async () => {
      await updatePosition.current.mutateAsync({ id: 'node-1', position: { x: 1, y: 2 } })
    })

    const { result: updatePositions } = renderHook(() => useUpdateNodePositions('map-1'), { wrapper })
    await act(async () => {
      await updatePositions.current.mutateAsync([{ id: 'node-1', position: { x: 1, y: 2 } }])
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: mapKeys.lists() })
    expect(mapApi.deleteMap).toHaveBeenCalledWith('map-1')
  })
})