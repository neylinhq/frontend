import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createQueryWrapper, createTestQueryClient } from '@/shared/tests'

vi.mock('../progress.api', () => ({
  progressApi: {
    getNodeProgress: vi.fn(),
    getAllNodeProgress: vi.fn(),
    updateNodeProgress: vi.fn(),
    reviewNode: vi.fn(),
    toggleBookmark: vi.fn(),
    getMapProgress: vi.fn(),
    updateViewport: vi.fn(),
    updateMapProgress: vi.fn(),
    setFavorite: vi.fn(),
    getMapStats: vi.fn()
  }
}))

import { progressApi } from '../progress.api'
import {
  progressKeys,
  useAllNodeProgress,
  useMapProgress,
  useMapStats,
  useNodeProgress,
  useReviewNode,
  useSetFavorite,
  useToggleBookmark,
  useUpdateMapProgress,
  useUpdateNodeProgress,
  useUpdateViewport
} from '../progress.queries'

describe('progress queries', () => {
  const nodeProgress = {
    id: 'progress-1',
    userId: 'user-1',
    nodeId: 'node-1',
    confidence: 0.5,
    masteryLevel: 'learning',
    reviewCount: 0,
    correctStreak: 0,
    notes: null,
    isBookmarked: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  const mapProgress = {
    id: 'map-progress-1',
    userId: 'user-1',
    mapId: 'map-1',
    viewport: { x: 0, y: 0, zoom: 1 },
    isFavorite: false,
    overallProgress: 0,
    nodesMastered: 0,
    nodesLearning: 0,
    nodesTotal: 0,
    eloRating: 1500,
    glickoRating: 1500,
    studySettings: {},
    preferredRatingSystem: 'elo',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }

  it('fetches progress queries', async () => {
    vi.mocked(progressApi.getNodeProgress).mockResolvedValue(nodeProgress)
    vi.mocked(progressApi.getAllNodeProgress).mockResolvedValue([nodeProgress])
    vi.mocked(progressApi.getMapProgress).mockResolvedValue(mapProgress)
    vi.mocked(progressApi.getMapStats).mockResolvedValue(mapProgress)

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result: nodeResult } = renderHook(
      () => useNodeProgress('map-1', 'node-1'),
      { wrapper }
    )
    await waitFor(() => expect(nodeResult.current.data).toEqual(nodeProgress))

    const { result: allResult } = renderHook(() => useAllNodeProgress('map-1'), { wrapper })
    await waitFor(() => expect(allResult.current.data).toEqual([nodeProgress]))

    const { result: mapResult } = renderHook(() => useMapProgress('map-1'), { wrapper })
    await waitFor(() => expect(mapResult.current.data).toEqual(mapProgress))

    const { result: statsResult } = renderHook(() => useMapStats('map-1'), { wrapper })
    await waitFor(() => expect(statsResult.current.data).toEqual(mapProgress))
  })

  it('invalidates queries on mutations', async () => {
    vi.mocked(progressApi.updateNodeProgress).mockResolvedValue(nodeProgress)
    vi.mocked(progressApi.reviewNode).mockResolvedValue(nodeProgress)
    vi.mocked(progressApi.toggleBookmark).mockResolvedValue(nodeProgress)
    vi.mocked(progressApi.updateViewport).mockResolvedValue(mapProgress)
    vi.mocked(progressApi.updateMapProgress).mockResolvedValue(mapProgress)
    vi.mocked(progressApi.setFavorite).mockResolvedValue(mapProgress)

    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = createQueryWrapper(queryClient)

    const { result: updateNode } = renderHook(() => useUpdateNodeProgress('map-1', 'node-1'), {
      wrapper
    })
    await act(async () => {
      await updateNode.current.mutateAsync({ confidence: 0.7 })
    })

    const { result: reviewNode } = renderHook(() => useReviewNode('map-1', 'node-1'), { wrapper })
    await act(async () => {
      await reviewNode.current.mutateAsync({ correct: true })
    })

    const { result: toggleBookmark } = renderHook(() => useToggleBookmark('map-1'), { wrapper })
    await act(async () => {
      await toggleBookmark.current.mutateAsync('node-1')
    })

    const { result: updateViewport } = renderHook(() => useUpdateViewport('map-1'), { wrapper })
    await act(async () => {
      await updateViewport.current.mutateAsync({ viewport: { x: 1, y: 2, zoom: 1 } })
    })

    const { result: updateMap } = renderHook(() => useUpdateMapProgress('map-1'), { wrapper })
    await act(async () => {
      await updateMap.current.mutateAsync({ isFavorite: true })
    })

    const { result: setFavorite } = renderHook(() => useSetFavorite('map-1'), { wrapper })
    await act(async () => {
      await setFavorite.current.mutateAsync(true)
    })

    expect(progressApi.updateNodeProgress).toHaveBeenCalledWith('map-1', 'node-1', {
      confidence: 0.7
    })
    expect(progressApi.reviewNode).toHaveBeenCalledWith('map-1', 'node-1', { correct: true })
    expect(progressApi.toggleBookmark).toHaveBeenCalledWith('map-1', 'node-1')
    expect(progressApi.updateViewport).toHaveBeenCalledWith('map-1', {
      viewport: { x: 1, y: 2, zoom: 1 }
    })
    expect(progressApi.updateMapProgress).toHaveBeenCalledWith('map-1', { isFavorite: true })
    expect(progressApi.setFavorite).toHaveBeenCalledWith('map-1', true)

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: progressKeys.nodeProgressDetail('map-1', 'node-1')
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: progressKeys.mapProgressDetail('map-1') })
  })
})