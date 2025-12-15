import { api } from '@/shared/api/client'
import type {
  ReviewNodeRequest,
  UpdateMapProgressRequest,
  UpdateNodeProgressRequest
} from './progress.schema'

export const progressApi = {
  // Node progress operations
  getNodeProgress: async (mapId: string, nodeId: string) =>
    api.get(`/maps/${mapId}/nodes/${nodeId}/progress`),

  getAllNodeProgress: async (mapId: string) => api.get(`/maps/${mapId}/progress/nodes`),

  updateNodeProgress: async (mapId: string, nodeId: string, data: UpdateNodeProgressRequest) =>
    api.patch(`/maps/${mapId}/nodes/${nodeId}/progress`, data),

  reviewNode: async (mapId: string, nodeId: string, data: ReviewNodeRequest) =>
    api.post(`/maps/${mapId}/nodes/${nodeId}/review`, data),

  toggleBookmark: async (mapId: string, nodeId: string) =>
    api.post(`/maps/${mapId}/nodes/${nodeId}/bookmark`),

  // Map progress operations
  getMapProgress: async (mapId: string) => api.get(`/maps/${mapId}/progress`),

  updateViewport: async (mapId: string, data: UpdateMapProgressRequest) =>
    api.patch(`/maps/${mapId}/progress/viewport`, data),

  updateMapProgress: async (mapId: string, data: UpdateMapProgressRequest) =>
    api.patch(`/maps/${mapId}/progress`, data),

  setFavorite: async (mapId: string, isFavorite: boolean) =>
    api.patch(`/maps/${mapId}/progress/favorite`, { isFavorite }),

  // Stats
  getMapStats: async (mapId: string) => api.get(`/maps/${mapId}/progress/stats`)
}
