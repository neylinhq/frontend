# Real-time Data

## Стратегии

| Подход | Latency | Сложность | Когда использовать |
|--------|---------|-----------|-------------------|
| Polling | Высокая | Низкая | Редкие обновления, простота |
| SSE | Средняя | Средняя | Односторонний поток (notifications) |
| WebSocket | Низкая | Высокая | Bidirectional, частые обновления |

---

## Polling

### С React Query

```tsx
// entities/notifications/notifications.queries.ts
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getUnread,
    refetchInterval: 30_000,  // Каждые 30 секунд
    refetchIntervalInBackground: false  // Не обновлять когда tab неактивен
  })
}
```

### Conditional Polling

```tsx
export const useMapSync = (mapId: string) => {
  const [isEditing, setIsEditing] = useState(false)

  return useQuery({
    queryKey: ['map', mapId],
    queryFn: () => mapApi.getById(mapId),
    // Polling только когда не редактируем
    refetchInterval: isEditing ? false : 10_000
  })
}
```

---

## Server-Sent Events (SSE)

### Backend

```go
// Go/Fiber
app.Get("/api/events", func(c *fiber.Ctx) error {
    c.Set("Content-Type", "text/event-stream")
    c.Set("Cache-Control", "no-cache")
    c.Set("Connection", "keep-alive")

    for {
        event := <-eventChannel
        c.Write([]byte(fmt.Sprintf("data: %s\n\n", event)))
        c.Context().Response.BodyWriter().Flush()
    }
})
```

### Frontend

```tsx
// shared/lib/use-sse.ts
export const useSSE = (url: string, onMessage: (data: any) => void) => {
  useEffect(() => {
    const eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onMessage(data)
    }

    eventSource.onerror = () => {
      eventSource.close()
      // Reconnect logic
    }

    return () => eventSource.close()
  }, [url, onMessage])
}

// Использование
useSSE('/api/events', (data) => {
  if (data.type === 'node_updated') {
    queryClient.invalidateQueries({ queryKey: ['nodes'] })
  }
})
```

---

## WebSocket

### Подключение

```tsx
// shared/lib/websocket.ts
class WebSocketClient {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private listeners = new Map<string, Set<(data: any) => void>>()

  connect(url: string) {
    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.reconnectAttempts = 0
      console.log('WebSocket connected')
    }

    this.ws.onmessage = (event) => {
      const { type, payload } = JSON.parse(event.data)
      this.listeners.get(type)?.forEach(cb => cb(payload))
    }

    this.ws.onclose = () => {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000)
        setTimeout(() => this.connect(url), delay)
      }
    }
  }

  subscribe(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(callback)

    return () => this.listeners.get(type)?.delete(callback)
  }

  send(type: string, payload: any) {
    this.ws?.send(JSON.stringify({ type, payload }))
  }

  disconnect() {
    this.ws?.close()
  }
}

export const wsClient = new WebSocketClient()
```

### React Hook

```tsx
// shared/hooks/use-websocket.ts
export const useWebSocket = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    wsClient.connect(import.meta.env.VITE_WS_URL)

    // Подписки на события
    const unsubNodeUpdated = wsClient.subscribe('node:updated', (node) => {
      queryClient.setQueryData(['nodes', node.id], node)
    })

    const unsubNodeDeleted = wsClient.subscribe('node:deleted', ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    })

    return () => {
      unsubNodeUpdated()
      unsubNodeDeleted()
      wsClient.disconnect()
    }
  }, [queryClient])
}
```

### Интеграция с React Query

```tsx
// features/graph/model/use-realtime-nodes.ts
export const useRealtimeNodes = (mapId: string) => {
  const queryClient = useQueryClient()

  // 1. Базовый запрос
  const query = useQuery({
    queryKey: ['nodes', mapId],
    queryFn: () => nodesApi.getByMap(mapId)
  })

  // 2. WebSocket для обновлений
  useEffect(() => {
    const unsub = wsClient.subscribe('node:updated', (node) => {
      if (node.mapId === mapId) {
        // Optimistic update в кэше
        queryClient.setQueryData(['nodes', mapId], (old: Node[]) =>
          old.map(n => n.id === node.id ? node : n)
        )
      }
    })

    return unsub
  }, [mapId, queryClient])

  return query
}
```

---

## Optimistic Updates

```tsx
// entities/node/node.queries.ts
export const useUpdateNode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: nodeApi.update,

    // Optimistic update
    onMutate: async (updatedNode) => {
      // Отменить текущие запросы
      await queryClient.cancelQueries({ queryKey: ['nodes'] })

      // Сохранить предыдущее значение
      const previousNodes = queryClient.getQueryData(['nodes'])

      // Optimistically update
      queryClient.setQueryData(['nodes'], (old: Node[]) =>
        old.map(n => n.id === updatedNode.id ? updatedNode : n)
      )

      return { previousNodes }
    },

    // Rollback при ошибке
    onError: (err, variables, context) => {
      queryClient.setQueryData(['nodes'], context?.previousNodes)
    },

    // Sync с сервером
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    }
  })
}
```

---

## Offline Support

```tsx
// shared/lib/offline-queue.ts
class OfflineQueue {
  private queue: Array<{ action: string; payload: any }> = []

  add(action: string, payload: any) {
    this.queue.push({ action, payload })
    localStorage.setItem('offline-queue', JSON.stringify(this.queue))
  }

  async flush() {
    const items = [...this.queue]
    this.queue = []

    for (const item of items) {
      try {
        await this.executeAction(item)
      } catch {
        // Вернуть в очередь
        this.queue.push(item)
      }
    }

    localStorage.setItem('offline-queue', JSON.stringify(this.queue))
  }

  private async executeAction({ action, payload }: { action: string; payload: any }) {
    switch (action) {
      case 'updateNode':
        return nodeApi.update(payload)
      case 'createNode':
        return nodeApi.create(payload)
    }
  }
}

export const offlineQueue = new OfflineQueue()

// При восстановлении соединения
window.addEventListener('online', () => {
  offlineQueue.flush()
})
```

---

## Reconnection Strategy

### Exponential Backoff

```tsx
const reconnect = (attempt: number, maxAttempts: number) => {
  if (attempt >= maxAttempts) {
    console.error('Max reconnection attempts reached')
    return
  }

  // Экспоненциальная задержка: 1s, 2s, 4s, 8s, 16s, max 30s
  const delay = Math.min(1000 * 2 ** attempt, 30000)

  setTimeout(() => {
    wsClient.connect()
  }, delay)
}
```

### With Jitter

```tsx
// Добавляем случайность чтобы не перегружать сервер
const delay = Math.min(1000 * 2 ** attempt, 30000)
const jitter = Math.random() * 1000
setTimeout(() => wsClient.connect(), delay + jitter)
```

---

## Чеклист

- [ ] Выбрана правильная стратегия (polling/SSE/WS)
- [ ] Reconnection с exponential backoff
- [ ] Optimistic updates для UX
- [ ] Offline queue для надёжности
- [ ] Cleanup подписок в useEffect
- [ ] Интеграция с React Query cache

---

## См. также

- [04-state.md](./04-state.md) — React Query интеграция
- [07-error-handling.md](./07-error-handling.md) — Обработка ошибок соединения
