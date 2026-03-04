import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createQueryWrapper, createTestQueryClient } from '@/shared/tests'

let nodeApi: typeof import('../node.api').nodeApi
let nodeQueries: typeof import('../node.queries')

beforeEach(async () => {
  vi.resetModules()
  vi.doMock('../node.api', () => ({
    nodeApi: {
      create: vi.fn(),
      get: vi.fn(),
      list: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updatePositions: vi.fn(),
      generateEmbedding: vi.fn()
    }
  }))
  ;({ nodeApi } = await import('../node.api'))
  nodeQueries = await import('../node.queries')
})

describe('node queries', () => {
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

  it('fetches node lists and details', async () => {
    vi.mocked(nodeApi.list).mockResolvedValue([node])
    vi.mocked(nodeApi.get).mockResolvedValue(node)

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result: listResult } = renderHook(() => nodeQueries.useNodes('map-1'), { wrapper })
    await waitFor(() => expect(listResult.current.data).toEqual([node]))
    expect(nodeApi.list).toHaveBeenCalledWith('map-1', undefined)

    const { result: typedResult } = renderHook(() => nodeQueries.useNodes('map-1', 'concept'), {
      wrapper
    })
    await waitFor(() => expect(typedResult.current.data).toEqual([node]))
    expect(nodeApi.list).toHaveBeenCalledWith('map-1', 'concept')

    const { result: nodeResult } = renderHook(() => nodeQueries.useNode('map-1', 'node-1'), {
      wrapper
    })
    await waitFor(() => expect(nodeResult.current.data).toEqual(node))
  })

  it('disables queries when identifiers are missing', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    renderHook(() => nodeQueries.useNodes('', 'concept'), { wrapper })
    renderHook(() => nodeQueries.useNode('map-1', ''), { wrapper })

    await Promise.resolve()
    expect(nodeApi.list).not.toHaveBeenCalled()
    expect(nodeApi.get).not.toHaveBeenCalled()
  })

  it('handles node mutations', async () => {
    vi.mocked(nodeApi.create).mockResolvedValue(node)
    vi.mocked(nodeApi.update).mockResolvedValue(node)
    vi.mocked(nodeApi.delete).mockResolvedValue(undefined)
    vi.mocked(nodeApi.generateEmbedding).mockResolvedValue(undefined)

    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = createQueryWrapper(queryClient)

    const { result: createNode } = renderHook(() => nodeQueries.useCreateNode('map-1'), { wrapper })
    await act(async () => {
      await createNode.current.mutateAsync({
        label: 'Node',
        type: 'concept',
        position: { x: 0, y: 0 }
      })
    })

    const { result: updateNode } = renderHook(() => nodeQueries.useUpdateNode('map-1', 'node-1'), {
      wrapper
    })
    await act(async () => {
      await updateNode.current.mutateAsync({ label: 'Updated' })
    })

    const { result: deleteNode } = renderHook(() => nodeQueries.useDeleteNode('map-1'), { wrapper })
    await act(async () => {
      await deleteNode.current.mutateAsync('node-1')
    })

    const { result: generate } = renderHook(() => nodeQueries.useGenerateEmbedding('map-1'), {
      wrapper
    })
    await act(async () => {
      await generate.current.mutateAsync('node-1')
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: nodeQueries.nodeKeys.list('map-1') })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: nodeQueries.nodeKeys.detail('map-1', 'node-1')
    })
    expect(nodeApi.generateEmbedding).toHaveBeenCalledWith('map-1', 'node-1')
  })

  it('controls similar nodes query with enabled flag', async () => {
    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result: disabled } = renderHook(() => nodeQueries.useSimilarNodes('map-1', 'node-1'), {
      wrapper
    })
    expect(disabled.current.data).toBeUndefined()

    const { result: enabled } = renderHook(
      () => nodeQueries.useSimilarNodes('map-1', 'node-1', { enabled: true }),
      { wrapper }
    )
    await waitFor(() => expect(enabled.current.data).toEqual({ nodes: [], similarity: [] }))
  })
})
