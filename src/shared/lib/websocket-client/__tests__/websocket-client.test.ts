import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

class WebSocketMock {
  static instances: WebSocketMock[] = []
  static OPEN = 1

  readyState = WebSocketMock.OPEN
  url: string
  sent: string[] = []

  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onclose: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(url: string) {
    this.url = url
    WebSocketMock.instances.push(this)
  }

  send(data: string) {
    this.sent.push(data)
  }

  close() {
    this.readyState = 3
    this.onclose?.()
  }
}

const loadClient = async () => {
  vi.resetModules()
  return await import('../websocket-client')
}

beforeEach(() => {
  WebSocketMock.instances = []
  vi.stubGlobal('WebSocket', WebSocketMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('wsClient', () => {
  it('subscribes to message types', async () => {
    const { wsClient } = await loadClient()
    wsClient.connect('ws://example.com', 'token')

    const handler = vi.fn()
    wsClient.subscribe('ping', handler)

    const instance = WebSocketMock.instances[0]
    instance.onmessage?.({ data: JSON.stringify({ type: 'ping', payload: 'ok' }) } as MessageEvent)

    expect(handler).toHaveBeenCalledWith({ type: 'ping', payload: 'ok' })
    wsClient.disconnect()
  })

  it('reuses handler sets for repeated subscriptions', async () => {
    const { wsClient } = await loadClient()
    wsClient.connect('ws://example.com', 'token')

    const handlerA = vi.fn()
    const handlerB = vi.fn()
    wsClient.subscribe('ping', handlerA)
    wsClient.subscribe('ping', handlerB)

    const instance = WebSocketMock.instances[0]
    instance.onmessage?.({ data: JSON.stringify({ type: 'ping', payload: 'ok' }) } as MessageEvent)

    expect(handlerA).toHaveBeenCalled()
    expect(handlerB).toHaveBeenCalled()
    wsClient.disconnect()
  })

  it('sends join messages when joining a room', async () => {
    const { wsClient } = await loadClient()
    wsClient.connect('ws://example.com', 'token')
    wsClient.joinRoom('room-1')

    const instance = WebSocketMock.instances[0]
    expect(instance.sent[0]).toBe(JSON.stringify({ type: 'join', payload: 'room-1' }))
    wsClient.disconnect()
  })

  it('sends leave messages when leaving a room', async () => {
    const { wsClient } = await loadClient()
    wsClient.connect('ws://example.com', 'token')
    wsClient.joinRoom('room-1')
    wsClient.leaveRoom('room-1')

    const instance = WebSocketMock.instances[0]
    expect(instance.sent[1]).toBe(JSON.stringify({ type: 'leave', payload: 'room-1' }))
    wsClient.disconnect()
  })

  it('reconnects after close with backoff', async () => {
    vi.useFakeTimers()
    const { wsClient } = await loadClient()
    wsClient.connect('ws://example.com', 'token')

    const instance = WebSocketMock.instances[0]
    instance.onclose?.()

    expect(WebSocketMock.instances.length).toBe(1)
    vi.advanceTimersByTime(1000)
    expect(WebSocketMock.instances.length).toBe(2)
    wsClient.disconnect()
  })

  it('handles socket errors without throwing', async () => {
    const { wsClient } = await loadClient()
    wsClient.connect('ws://example.com', 'token')

    const instance = WebSocketMock.instances[0]
    expect(() => instance.onerror?.()).not.toThrow()
    wsClient.disconnect()
  })

  it('unsubscribes handlers', async () => {
    const { wsClient } = await loadClient()
    wsClient.connect('ws://example.com', 'token')

    const handler = vi.fn()
    const unsubscribe = wsClient.subscribe('ping', handler)
    unsubscribe()

    const instance = WebSocketMock.instances[0]
    instance.onmessage?.({ data: JSON.stringify({ type: 'ping', payload: 'ok' }) } as MessageEvent)

    expect(handler).not.toHaveBeenCalled()
    wsClient.disconnect()
  })

  it('rejoins rooms on open', async () => {
    const { wsClient } = await loadClient()
    wsClient.joinRoom('room-1')
    wsClient.connect('ws://example.com', 'token')

    const instance = WebSocketMock.instances[0]
    instance.onopen?.()

    expect(instance.sent[0]).toBe(JSON.stringify({ type: 'join', payload: 'room-1' }))
    wsClient.disconnect()
  })

  it('does not send when socket is closed', async () => {
    const { wsClient } = await loadClient()
    wsClient.connect('ws://example.com', 'token')

    const instance = WebSocketMock.instances[0]
    instance.readyState = 3
    wsClient.send({ type: 'ping', payload: 'noop' })

    expect(instance.sent).toHaveLength(0)
    wsClient.disconnect()
  })

  it('stops reconnect attempts after max', async () => {
    vi.useFakeTimers()
    const { wsClient } = await loadClient()
    wsClient.connect('ws://example.com', 'token')

    const instance = WebSocketMock.instances[0]
    ;(wsClient as { reconnectAttempts: number; maxReconnects: number }).reconnectAttempts =
      (wsClient as { maxReconnects: number }).maxReconnects

    instance.onclose?.()
    vi.advanceTimersByTime(1000)

    expect(WebSocketMock.instances.length).toBe(1)
    wsClient.disconnect()
  })
})
