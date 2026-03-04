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
    const baseUrl = import.meta.env.VITE_API_URL || '/api'
    expect(fetchMock).toHaveBeenCalledWith(
      `${baseUrl}/maps/map-1/chat/stream`,
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

  it('logs parse errors and ignores non-data lines', async () => {
    const encoder = new TextEncoder()
    const chunks = [encoder.encode('event: ping\n'), encoder.encode('data: {not-json}\n')]
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
    const controller = new AbortController()
    await aiApi.chatWithMapStream('map-1', 'Question?', onChunk, {
      timeout: 100000,
      signal: controller.signal
    })

    expect(onChunk).not.toHaveBeenCalled()
    expect(logger.warn).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('rejects when response body is missing', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      body: null
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(aiApi.chatWithMapStream('map-1', 'Question?', vi.fn())).rejects.toThrow(
      'No response body'
    )
    expect(logger.error).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('uses fallback error message when error response cannot be parsed', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('bad json')
      }
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(aiApi.chatWithMapStream('map-1', 'Question?', vi.fn())).rejects.toThrow(
      'HTTP error! status: 500'
    )
    expect(logger.error).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('uses status fallback when error payload is missing message', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: {} })
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(aiApi.chatWithMapStream('map-1', 'Question?', vi.fn())).rejects.toThrow(
      'HTTP error! status: 400'
    )
    expect(logger.error).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('resolves on AbortError', async () => {
    const abortError = new Error('aborted')
    abortError.name = 'AbortError'
    const fetchMock = vi.fn().mockRejectedValue(abortError)
    vi.stubGlobal('fetch', fetchMock)

    await expect(aiApi.chatWithMapStream('map-1', 'Question?', vi.fn())).resolves.toBeUndefined()
    expect(logger.error).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('aborts on timeout and emits error chunk', async () => {
    vi.useFakeTimers()
    const onChunk = vi.fn()
    const fetchMock = vi.fn((_url: string, options: RequestInit) => {
      const signal = options.signal as AbortSignal | undefined
      return new Promise((_, reject) => {
        if (signal) {
          signal.addEventListener('abort', () => {
            const error = new Error('aborted')
            error.name = 'AbortError'
            reject(error)
          })
        }
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const promise = aiApi.chatWithMapStream('map-1', 'Question?', onChunk, { timeout: 1 })
    vi.advanceTimersByTime(1)
    await expect(promise).resolves.toBeUndefined()

    expect(onChunk).toHaveBeenCalledWith({ type: 'error', content: 'Request timed out' })
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })
})
