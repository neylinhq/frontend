import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactFlow, useViewport } from '@xyflow/react'
import { mapApi, mapKeys } from '@/entities/map'
import type { NodeType } from '@/entities/node'
import { NODE_CREATION_CONFIG } from './node-creation.constants'

interface CreateNodeInput {
  mapId: string
  label: string
  type: NodeType
  description?: string
}

/**
 * Hook for creating a new node with automatic position calculation.
 * Must be used inside ReactFlowProvider.
 */
export const useCreateNodeMutation = () => {
  const queryClient = useQueryClient()
  const reactFlow = useReactFlow()
  const viewport = useViewport()

  return useMutation({
    mutationFn: async ({ mapId, label, type, description }: CreateNodeInput) => {
      // Calculate viewport dimensions in flow coordinates
      const viewportWidthInFlow = window.innerWidth / viewport.zoom
      const viewportHeightInFlow = window.innerHeight / viewport.zoom

      // Get top-left corner of viewport in flow coordinates
      const viewportTopLeft = reactFlow.screenToFlowPosition({ x: 0, y: 0 })

      // Calculate center of visible viewport
      const center = {
        x: viewportTopLeft.x + viewportWidthInFlow / 2,
        y: viewportTopLeft.y + viewportHeightInFlow / 2
      }

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
