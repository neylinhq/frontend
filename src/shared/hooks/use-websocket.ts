import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { wsClient } from '@/shared/lib/websocket-client'

export const useWebSocket = (mapId: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!mapId) return

    wsClient.joinRoom(mapId)

    const unsubTaskCompleted = wsClient.subscribe('ai.task.completed', msg => {
      console.log('[WS] AI task completed:', msg.payload)
      queryClient.invalidateQueries({ queryKey: ['maps', mapId] })
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    })

    const unsubNodeUpdated = wsClient.subscribe('node.updated', msg => {
      console.log('[WS] Node updated:', msg.payload)
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    })

    const unsubEdgeCreated = wsClient.subscribe('edge.created', msg => {
      console.log('[WS] Edge created:', msg.payload)
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
