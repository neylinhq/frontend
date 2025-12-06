import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactFlow } from '@xyflow/react'
import { mapApi } from '@/entities/map/map.api'
import { mapKeys } from '@/entities/map/map.queries'
import type { NodeType } from '@/entities/node'
import { NODE_CREATION_CONFIG } from '../lib/node-creation.constants'

interface CreateNodeInput {
  mapId: string
  label: string
  type: NodeType
  description?: string
}

/**
 * Hook for creating a new node with automatic position calculation
 */
export const useCreateNodeMutation = () => {
  const queryClient = useQueryClient()
  const reactFlow = useReactFlow()

  return useMutation({
    mutationFn: async ({ mapId, label, type, description }: CreateNodeInput) => {
      // Calculate position for new node
      const viewport = reactFlow.getViewport()
      const center = reactFlow.screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      })

      // Add some random offset to avoid overlapping nodes
      const randomOffset = {
        x: (Math.random() - 0.5) * NODE_CREATION_CONFIG.NODE_SPAWN_OFFSET_PX,
        y: (Math.random() - 0.5) * NODE_CREATION_CONFIG.NODE_SPAWN_OFFSET_PX
      }

      const position = {
        x: center.x + randomOffset.x,
        y: center.y + randomOffset.y
      }

      return mapApi.createNode(mapId, {
        label,
        type,
        description,
        position,
        metadata: {
          reviewCount: 0
        }
      })
    },

    onSuccess: (_, variables) => {
      // Invalidate map nodes to refetch
      queryClient.invalidateQueries({
        queryKey: mapKeys.mapNodes(variables.mapId)
      })

      // Invalidate full map
      queryClient.invalidateQueries({
        queryKey: mapKeys.fullMap(variables.mapId)
      })
    }
  })
}
