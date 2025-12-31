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

  it('sends join messages when joining a room', async () => {
    const { wsClient } = await loadClient()
    wsClient.connect('ws://example.com', 'token')
    wsClient.joinRoom('room-1')

    const instance = WebSocketMock.instances[0]
    expect(instance.sent[0]).toBe(JSON.stringify({ type: 'join', payload: 'room-1' }))
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
})
