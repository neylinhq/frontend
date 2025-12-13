import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { wsClient } from '@/shared/lib/websocket-client'

export const useWebSocket = (mapId: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!mapId) {
      return
    }

    wsClient.joinRoom(mapId)

    const unsubTaskCompleted = wsClient.subscribe('ai.task.completed', () => {
      queryClient.invalidateQueries({ queryKey: ['maps', mapId] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    })

    const unsubNodeUpdated = wsClient.subscribe('node.updated', () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    })

    const unsubEdgeCreated = wsClient.subscribe('edge.created', () => {
      queryClient.invalidateQueries({ queryKey: ['edges'] })
    })

    return () => {
      unsubTaskCompleted()
      unsubNodeUpdated()
      unsubEdgeCreated()
      wsClient.leaveRoom(mapId)
    }
  }, [mapId, queryClient])
}
