import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef } from 'react'

import type { ViewportState } from '@/features/graph-webgl'
import { type FullMap, mapApi, mapKeys, type Node } from '@/entities/map'
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

interface CreateNodeWebGLOptions {
  nodes?: Node[]
  viewport?: ViewportState | null
}

const getNodesCenter = (nodes: Node[]) => {
  if (nodes.length === 0) {
    return { x: 0, y: 0 }
  }
  const sum = nodes.reduce(
    (acc, node) => {
      acc.x += node.position.x
      acc.y += node.position.y
      return acc
    },
    { x: 0, y: 0 }
  )
  return {
    x: sum.x / nodes.length,
    y: sum.y / nodes.length
  }
}

/**
 * WebGL variant of create-node mutation.
 * Uses WebGL viewport center instead of React Flow viewport.
 */
export const useCreateNodeMutationWebGL = ({
  nodes = [],
  viewport = null
}: CreateNodeWebGLOptions = {}) => {
  const queryClient = useQueryClient()
  const pendingConnections = useNodeCreationStore(state => state.pendingConnections)

  const nodesRef = useRef(nodes)
  const viewportRef = useRef(viewport)

  useEffect(() => {
    nodesRef.current = nodes
  }, [nodes])

  useEffect(() => {
    viewportRef.current = viewport
  }, [viewport])

  const getViewportCenter = useCallback(() => {
    const currentViewport = viewportRef.current
    if (currentViewport) {
      return { x: currentViewport.x, y: currentViewport.y }
    }
    return getNodesCenter(nodesRef.current)
  }, [])

  const getCreatePosition = useCallback(() => {
    const currentNodes = nodesRef.current
    const connectedNodeIds = pendingConnections.map(c => c.targetNodeId)
    const positionNearConnections = calculatePositionNearConnections(connectedNodeIds, currentNodes)

    return (
      positionNearConnections ??
      calculateSmartPosition({
        center: getViewportCenter(),
        existingNodes: currentNodes
      })
    )
  }, [getViewportCenter, pendingConnections])

  return useMutation({
    mutationFn: async ({ mapId, label, type, description }: CreateNodeInput) => {
      const position = getCreatePosition()

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
      await queryClient.cancelQueries({ queryKey: mapKeys.fullMap(mapId) })

      const previousFullMap = queryClient.getQueryData<FullMap>(mapKeys.fullMap(mapId))
      const position = getCreatePosition()

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

      queryClient.setQueryData<FullMap>(mapKeys.fullMap(mapId), old => {
        if (!old) {
          return old
        }
        return {
          ...old,
          nodes: [...old.nodes, optimisticNode]
        }
      })

      return { previousFullMap, optimisticNode }
    },

    onError: (_err, variables, context) => {
      if (context?.previousFullMap) {
        queryClient.setQueryData(mapKeys.fullMap(variables.mapId), context.previousFullMap)
      }
    },

    onSuccess: (newNode, variables, context) => {
      queryClient.setQueryData<FullMap>(mapKeys.fullMap(variables.mapId), old => {
        if (!old) {
          return old
        }
        return {
          ...old,
          nodes: old.nodes.map(n => (n.id === context?.optimisticNode.id ? newNode : n))
        }
      })
    },

    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: mapKeys.fullMap(variables.mapId) })
      queryClient.invalidateQueries({ queryKey: mapKeys.mapNodes(variables.mapId) })
    }
  })
}
