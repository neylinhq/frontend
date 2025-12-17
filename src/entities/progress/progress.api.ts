import { api } from '@/shared/api/client'
import type {
  ReviewNodeRequest,
  UpdateMapProgressRequest,
  UpdateNodeProgressRequest,
  UserMapProgress,
  UserNodeProgress
} from './progress.schema'

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const progressApi = {
  // Node progress operations
  getNodeProgress: async (mapId: string, nodeId: string): Promise<UserNodeProgress> => {
    const response = await api.get<ApiResponse<UserNodeProgress>>(
      `/maps/${mapId}/nodes/${nodeId}/progress`
    )
    return response.data
  },

  getAllNodeProgress: async (mapId: string): Promise<UserNodeProgress[]> => {
    const response = await api.get<ApiResponse<UserNodeProgress[]>>(`/maps/${mapId}/progress/nodes`)
    return response.data
  },

  updateNodeProgress: async (
    mapId: string,
    nodeId: string,
    data: UpdateNodeProgressRequest
  ): Promise<UserNodeProgress> => {
    const response = await api.patch<ApiResponse<UserNodeProgress>>(
      `/maps/${mapId}/nodes/${nodeId}/progress`,
      data
    )
    return response.data
  },

  reviewNode: async (
    mapId: string,
    nodeId: string,
    data: ReviewNodeRequest
  ): Promise<UserNodeProgress> => {
    const response = await api.post<ApiResponse<UserNodeProgress>>(
      `/maps/${mapId}/nodes/${nodeId}/review`,
      data
    )
    return response.data
  },

  toggleBookmark: async (mapId: string, nodeId: string): Promise<UserNodeProgress> => {
    const response = await api.post<ApiResponse<UserNodeProgress>>(
      `/maps/${mapId}/nodes/${nodeId}/bookmark`
    )
    return response.data
  },

  // Map progress operations
  getMapProgress: async (mapId: string): Promise<UserMapProgress> => {
    const response = await api.get<ApiResponse<UserMapProgress>>(`/maps/${mapId}/progress`)
    return response.data
  },

  updateViewport: async (mapId: string, data: UpdateMapProgressRequest): Promise<UserMapProgress> => {
    const response = await api.patch<ApiResponse<UserMapProgress>>(
      `/maps/${mapId}/progress/viewport`,
      data
    )
    return response.data
  },

  updateMapProgress: async (
    mapId: string,
    data: UpdateMapProgressRequest
  ): Promise<UserMapProgress> => {
    const response = await api.patch<ApiResponse<UserMapProgress>>(`/maps/${mapId}/progress`, data)
    return response.data
  },

  setFavorite: async (mapId: string, isFavorite: boolean): Promise<UserMapProgress> => {
    const response = await api.patch<ApiResponse<UserMapProgress>>(
      `/maps/${mapId}/progress/favorite`,
      { isFavorite }
    )
    return response.data
  },

  // Stats
  getMapStats: async (mapId: string): Promise<UserMapProgress> => {
    const response = await api.get<ApiResponse<UserMapProgress>>(`/maps/${mapId}/progress/stats`)
    return response.data
  }
}
