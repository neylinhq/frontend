import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { nodeApi } from './node.api'
import type { CreateNodeRequest, UpdateNodeRequest } from './node.schema'

export const nodeKeys = {
  all: ['nodes'] as const,
  lists: () => [...nodeKeys.all, 'list'] as const,
  list: (mapId: string) => [...nodeKeys.lists(), mapId] as const,
  details: () => [...nodeKeys.all, 'detail'] as const,
  detail: (mapId: string, nodeId: string) => [...nodeKeys.details(), mapId, nodeId] as const,
  similar: (mapId: string, nodeId: string) => [...nodeKeys.all, 'similar', mapId, nodeId] as const
}

export const useNodes = (mapId: string, type?: string) => {
  return useQuery({
    queryKey: type ? [...nodeKeys.list(mapId), type] : nodeKeys.list(mapId),
    queryFn: () => nodeApi.list(mapId, type),
    enabled: !!mapId
  })
}

export const useNode = (mapId: string, nodeId: string) => {
  return useQuery({
    queryKey: nodeKeys.detail(mapId, nodeId),
    queryFn: () => nodeApi.get(mapId, nodeId),
    enabled: !!mapId && !!nodeId
  })
}

export const useCreateNode = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateNodeRequest) => nodeApi.create(mapId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.list(mapId) })
    }
  })
}

export const useUpdateNode = (mapId: string, nodeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateNodeRequest) => nodeApi.update(mapId, nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.detail(mapId, nodeId) })
      queryClient.invalidateQueries({ queryKey: nodeKeys.list(mapId) })
    }
  })
}

export const useDeleteNode = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nodeId: string) => nodeApi.delete(mapId, nodeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nodeKeys.list(mapId) })
    }
  })
}

// RAG queries
export const useSimilarNodes = (
  mapId: string,
  nodeId: string,
  options?: { limit?: number; threshold?: number; enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...nodeKeys.similar(mapId, nodeId), options?.limit, options?.threshold],
    queryFn: () => nodeApi.findSimilar(mapId, nodeId, options),
    enabled: options?.enabled !== false && !!mapId && !!nodeId
  })
}

export const useGenerateEmbedding = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nodeId: string) => nodeApi.generateEmbedding(mapId, nodeId),
    onSuccess: (_, nodeId) => {
      // Invalidate similar queries for this node
      queryClient.invalidateQueries({ queryKey: nodeKeys.similar(mapId, nodeId) })
    }
  })
}
