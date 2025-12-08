import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useReactFlow, useViewport } from '@xyflow/react'
import { mapApi, mapKeys, type FullMap, type Node } from '@/entities/map'
import type { NodeType } from '@/entities/node'
import { calculatePositionNearConnections, calculateSmartPosition } from '../lib/smart-positioning'
import { useNodeCreationStore } from './node-creation.store'

interface CreateNodeInput {
  mapId: string
  label: string
  type: NodeType
  description?: string
}

interface MutationContext {
  previousFullMap: FullMap | undefined
  optimisticNode: Node
}

/**
 * Hook for creating a new node with automatic position calculation.
 * Must be used inside ReactFlowProvider.
 */
export const useCreateNodeMutation = () => {
  const queryClient = useQueryClient()
  const reactFlow = useReactFlow()
  const viewport = useViewport()
  const pendingConnections = useNodeCreationStore(state => state.pendingConnections)

  return useMutation({
    mutationFn: async ({ mapId, label, type, description }: CreateNodeInput) => {
      const currentNodes = reactFlow.getNodes()

      // Calculate viewport center
      const viewportWidthInFlow = window.innerWidth / viewport.zoom
      const viewportHeightInFlow = window.innerHeight / viewport.zoom
      const viewportTopLeft = reactFlow.screenToFlowPosition({ x: 0, y: 0 })
      const viewportCenter = {
        x: viewportTopLeft.x + viewportWidthInFlow / 2,
        y: viewportTopLeft.y + viewportHeightInFlow / 2
      }

      // Calculate position - prefer near connections if any
      const connectedNodeIds = pendingConnections.map(c => c.targetNodeId)
      const positionNearConnections = calculatePositionNearConnections(connectedNodeIds, currentNodes)

      const position = positionNearConnections ?? calculateSmartPosition({
        center: viewportCenter,
        existingNodes: currentNodes
      })

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

    onMutate: async ({ mapId, label, type, description }): Promise<MutationContext> => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: mapKeys.fullMap(mapId) })

      // Snapshot previous value
      const previousFullMap = queryClient.getQueryData<FullMap>(mapKeys.fullMap(mapId))

      // Calculate position for optimistic node
      const currentNodes = reactFlow.getNodes()
      const viewportWidthInFlow = window.innerWidth / viewport.zoom
      const viewportHeightInFlow = window.innerHeight / viewport.zoom
      const viewportTopLeft = reactFlow.screenToFlowPosition({ x: 0, y: 0 })
      const viewportCenter = {
        x: viewportTopLeft.x + viewportWidthInFlow / 2,
        y: viewportTopLeft.y + viewportHeightInFlow / 2
      }

      const connectedNodeIds = pendingConnections.map(c => c.targetNodeId)
      const positionNearConnections = calculatePositionNearConnections(connectedNodeIds, currentNodes)
      const position = positionNearConnections ?? calculateSmartPosition({
        center: viewportCenter,
        existingNodes: currentNodes
      })

      // Create optimistic node
      const optimisticNode: Node = {
        id: `temp-${Date.now()}`,
        mapId,
        label,
        type,
        description: description || '',
        content: '',
        position,
        metadata: {
          reviewCount: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Update cache optimistically
      queryClient.setQueryData<FullMap>(mapKeys.fullMap(mapId), old => {
        if (!old) return old
        return {
          ...old,
          nodes: [...old.nodes, optimisticNode]
        }
      })

      return { previousFullMap, optimisticNode }
    },

    onError: (_err, variables, context) => {
      // Rollback on error
      if (context?.previousFullMap) {
        queryClient.setQueryData(mapKeys.fullMap(variables.mapId), context.previousFullMap)
      }
    },

    onSuccess: (newNode, variables, context) => {
      // Replace temp node with real one
      queryClient.setQueryData<FullMap>(mapKeys.fullMap(variables.mapId), old => {
        if (!old) return old
        return {
          ...old,
          nodes: old.nodes.map(n => (n.id === context?.optimisticNode.id ? newNode : n))
        }
      })
    },

    onSettled: (_, __, variables) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(variables.mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.mapNodes(variables.mapId) })
    }
  })
}
