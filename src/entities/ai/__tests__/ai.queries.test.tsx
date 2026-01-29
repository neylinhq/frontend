import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createQueryWrapper, createTestQueryClient } from '@/shared/tests'

vi.mock('../ai.api', () => ({
  aiApi: {
    listModels: vi.fn(),
    enrichNode: vi.fn(),
    analyzeMap: vi.fn()
  }
}))

import { aiApi } from '../ai.api'
import { aiKeys, useAIModels, useAnalyzeMap, useEnrichNode, useSelectedModel } from '../ai.queries'

describe('ai queries', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('fetches models', async () => {
    const models = [
      { id: 'model-1', name: 'Model 1', provider: 'openai', tier: 'pro' }
    ]
    vi.mocked(aiApi.listModels).mockResolvedValue(models)

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useAIModels(), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual(models))
    expect(aiApi.listModels).toHaveBeenCalled()
    expect(result.current.isLoading).toBe(false)
    expect(aiKeys.models()).toEqual(['ai', 'models'])
  })

  it('defaults to first model when selection is missing', async () => {
    const models = [
      { id: 'model-1', name: 'Model 1', provider: 'openai', tier: 'pro' },
      { id: 'model-2', name: 'Model 2', provider: 'anthropic', tier: 'fast' }
    ]
    vi.mocked(aiApi.listModels).mockResolvedValue(models)

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useSelectedModel(), { wrapper })

    await waitFor(() => expect(result.current.selectedModel).toBe('model-1'))
    expect(localStorage.getItem('neylin:selected-ai-model')).toBe('model-1')
  })

  it('keeps valid stored model and updates selection', async () => {
    const models = [
      { id: 'model-1', name: 'Model 1', provider: 'openai', tier: 'pro' },
      { id: 'model-2', name: 'Model 2', provider: 'anthropic', tier: 'fast' }
    ]
    localStorage.setItem('neylin:selected-ai-model', 'model-2')
    vi.mocked(aiApi.listModels).mockResolvedValue(models)

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useSelectedModel(), { wrapper })

    await waitFor(() => expect(result.current.selectedModel).toBe('model-2'))

    act(() => {
      result.current.setSelectedModel('model-1')
    })

    expect(localStorage.getItem('neylin:selected-ai-model')).toBe('model-1')
  })

  it('handles missing window and empty models', async () => {
    vi.resetModules()
    vi.doMock('@/shared/config/env', () => ({ IS_BROWSER: false }))
    const { aiApi } = await import('../ai.api')
    const { useSelectedModel } = await import('../ai.queries')

    vi.mocked(aiApi.listModels).mockResolvedValue([])

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useSelectedModel(), { wrapper })

    await waitFor(() => expect(result.current.selectedModel).toBe(''))
    expect(aiApi.listModels).toHaveBeenCalled()
    vi.doUnmock('@/shared/config/env')
    vi.resetModules()
  })

  it('invalidates queries after enrich and analysis', async () => {
    vi.mocked(aiApi.enrichNode).mockResolvedValue({})
    vi.mocked(aiApi.analyzeMap).mockResolvedValue({})

    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = createQueryWrapper(queryClient)

    const { result: enrichResult } = renderHook(() => useEnrichNode(), { wrapper })
    await act(async () => {
      await enrichResult.current.mutateAsync({
        mapId: 'map-1',
        nodeId: 'node-1',
        enrichType: 'all'
      })
    })

    const { result: analyzeResult } = renderHook(() => useAnalyzeMap(), { wrapper })
    await act(async () => {
      await analyzeResult.current.mutateAsync({ mapId: 'map-1', model: 'model-1' })
    })

    expect(aiApi.enrichNode).toHaveBeenCalledWith('map-1', 'node-1', 'all', true)
    expect(aiApi.analyzeMap).toHaveBeenCalledWith('map-1', 'model-1', true)
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['nodes'] })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['maps'] })
  })
})
