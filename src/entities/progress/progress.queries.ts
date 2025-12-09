import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { progressApi } from './progress.api'
import type {
  UpdateNodeProgressRequest,
  UpdateMapProgressRequest,
  ReviewNodeRequest
} from './progress.schema'

export const progressKeys = {
  all: ['progress'] as const,
  // Node progress
  nodeProgress: () => [...progressKeys.all, 'node'] as const,
  nodeProgressDetail: (mapId: string, nodeId: string) =>
    [...progressKeys.nodeProgress(), mapId, nodeId] as const,
  allNodeProgress: (mapId: string) => [...progressKeys.nodeProgress(), mapId, 'all'] as const,
  // Map progress
  mapProgress: () => [...progressKeys.all, 'map'] as const,
  mapProgressDetail: (mapId: string) => [...progressKeys.mapProgress(), mapId] as const,
  mapStats: (mapId: string) => [...progressKeys.mapProgress(), mapId, 'stats'] as const
}

// Node progress queries
export const useNodeProgress = (mapId: string, nodeId: string) => {
  return useQuery({
    queryKey: progressKeys.nodeProgressDetail(mapId, nodeId),
    queryFn: () => progressApi.getNodeProgress(mapId, nodeId),
    enabled: !!mapId && !!nodeId
  })
}

export const useAllNodeProgress = (mapId: string) => {
  return useQuery({
    queryKey: progressKeys.allNodeProgress(mapId),
    queryFn: () => progressApi.getAllNodeProgress(mapId),
    enabled: !!mapId
  })
}

export const useUpdateNodeProgress = (mapId: string, nodeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateNodeProgressRequest) =>
      progressApi.updateNodeProgress(mapId, nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.nodeProgressDetail(mapId, nodeId)
      })
      queryClient.invalidateQueries({
        queryKey: progressKeys.allNodeProgress(mapId)
      })
      queryClient.invalidateQueries({
        queryKey: progressKeys.mapStats(mapId)
      })
    }
  })
}

export const useReviewNode = (mapId: string, nodeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ReviewNodeRequest) => progressApi.reviewNode(mapId, nodeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.nodeProgressDetail(mapId, nodeId)
      })
      queryClient.invalidateQueries({
        queryKey: progressKeys.allNodeProgress(mapId)
      })
      queryClient.invalidateQueries({
        queryKey: progressKeys.mapStats(mapId)
      })
    }
  })
}

export const useToggleBookmark = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (nodeId: string) => progressApi.toggleBookmark(mapId, nodeId),
    onSuccess: (_, nodeId) => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.nodeProgressDetail(mapId, nodeId)
      })
      queryClient.invalidateQueries({
        queryKey: progressKeys.allNodeProgress(mapId)
      })
    }
  })
}

// Map progress queries
export const useMapProgress = (mapId: string) => {
  return useQuery({
    queryKey: progressKeys.mapProgressDetail(mapId),
    queryFn: () => progressApi.getMapProgress(mapId),
    enabled: !!mapId
  })
}

export const useUpdateViewport = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateMapProgressRequest) => progressApi.updateViewport(mapId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.mapProgressDetail(mapId)
      })
    }
  })
}

export const useSetFavorite = (mapId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (isFavorite: boolean) => progressApi.setFavorite(mapId, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.mapProgressDetail(mapId)
      })
    }
  })
}

export const useMapStats = (mapId: string) => {
  return useQuery({
    queryKey: progressKeys.mapStats(mapId),
    queryFn: () => progressApi.getMapStats(mapId),
    enabled: !!mapId
  })
}
