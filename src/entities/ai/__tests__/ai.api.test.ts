import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

vi.mock('@/shared/lib/logger', () => ({
  logger: {
    warn: vi.fn(),
    error: vi.fn()
  }
}))

import { api } from '@/shared/api/client'
import { logger } from '@/shared/lib/logger'
import { aiApi } from '../ai.api'

describe('aiApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls ai endpoints', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] })
    vi.mocked(api.post).mockResolvedValue({
      data: { action: 'chat', message: 'ok', sourceNodes: [], tokensUsed: 1 }
    })

    await aiApi.listModels()
    await aiApi.enrichNode('map-1', 'node-1', 'description', true)
    await aiApi.analyzeMap('map-1', 'model-1', true)
    await aiApi.chatWithMap('map-1', 'Question?', 'model-1', 3, 'node-1', 'node-2', [
      { role: 'user', content: 'Hi' }
    ])
    await aiApi.generateEmbeddings('map-1')

    expect(api.get).toHaveBeenCalledWith('/ai/models')
    expect(api.post).toHaveBeenCalledWith('/maps/map-1/nodes/node-1/enrich', {
      enrichType: 'description',
      async: true
    })
  })

  it('streams chat responses', async () => {
    const encoder = new TextEncoder()
    const chunks = [
      encoder.encode('data: {"type":"text","content":"Hello"}\n'),
      encoder.encode('data: {"type":"done"}\n')
    ]
    const reader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({ done: false, value: chunks[0] })
        .mockResolvedValueOnce({ done: false, value: chunks[1] })
        .mockResolvedValueOnce({ done: true, value: undefined })
    }

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => reader }
    })

    vi.stubGlobal('fetch', fetchMock)

    const onChunk = vi.fn()
    await aiApi.chatWithMapStream('map-1', 'Question?', onChunk, { timeout: 0 })

    expect(onChunk).toHaveBeenCalledWith({ type: 'text', content: 'Hello' })
    expect(onChunk).toHaveBeenCalledWith({ type: 'done' })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/maps/map-1/chat/stream',
      expect.objectContaining({ method: 'POST' })
    )

    vi.unstubAllGlobals()
  })

  it('rejects when stream returns error', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: 'Server error' } })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(aiApi.chatWithMapStream('map-1', 'Question?', vi.fn())).rejects.toThrow(
      'Server error'
    )
    expect(logger.error).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })
})