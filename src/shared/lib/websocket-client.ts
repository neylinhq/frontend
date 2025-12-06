type MessageHandler = (message: WSMessage) => void

interface WSMessage {
  type: string
  room?: string
  payload: unknown
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private handlers: Map<string, Set<MessageHandler>> = new Map()
  private reconnectAttempts = 0
  private maxReconnects = 5
  private rooms: Set<string> = new Set()
  private url = ''
  private token = ''

  connect(url: string, token: string) {
    this.url = url
    this.token = token
    this.ws = new WebSocket(`${url}?token=${token}`)

    this.ws.onopen = () => {
      console.log('[WS] Connected')
      this.reconnectAttempts = 0
      this.rooms.forEach(room => this.joinRoom(room))
    }

    this.ws.onmessage = event => {
      const message: WSMessage = JSON.parse(event.data)
      this.handlers.get(message.type)?.forEach(handler => handler(message))
    }

    this.ws.onclose = () => {
      console.log('[WS] Disconnected')
      if (this.reconnectAttempts < this.maxReconnects) {
        setTimeout(
          () => {
            this.reconnectAttempts++
            this.connect(this.url, this.token)
          },
          2 ** this.reconnectAttempts * 1000
        )
      }
    }

    this.ws.onerror = error => {
      console.error('[WS] Error:', error)
    }
  }

  subscribe(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)

    return () => {
      this.handlers.get(type)?.delete(handler)
    }
  }

  joinRoom(roomId: string) {
    this.rooms.add(roomId)
    this.send({ type: 'join', payload: roomId })
  }

  leaveRoom(roomId: string) {
    this.rooms.delete(roomId)
    this.send({ type: 'leave', payload: roomId })
  }

  send(message: WSMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    }
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }
}

export const wsClient = new WebSocketClient()
