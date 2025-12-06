import { api } from '@/shared/api/api-client'
import type { CreateNodeRequest, UpdateNodeRequest, UpdatePositionsRequest } from './node.schema'

export const nodeApi = {
  // Existing node operations
  create: async (mapId: string, data: CreateNodeRequest) => api.post(`/maps/${mapId}/nodes`, data),

  get: async (mapId: string, nodeId: string) => api.get(`/maps/${mapId}/nodes/${nodeId}`),

  list: async (mapId: string, type?: string) => {
    const params = type ? { type } : undefined
    return api.get(`/maps/${mapId}/nodes`, { params })
  },

  update: async (mapId: string, nodeId: string, data: UpdateNodeRequest) =>
    api.patch(`/maps/${mapId}/nodes/${nodeId}`, data),

  delete: async (mapId: string, nodeId: string) => api.delete(`/maps/${mapId}/nodes/${nodeId}`),

  updatePositions: async (mapId: string, data: UpdatePositionsRequest) =>
    api.patch(`/maps/${mapId}/nodes/positions`, data),

  // RAG operations
  findSimilar: async (
    mapId: string,
    nodeId: string,
    options?: { limit?: number; threshold?: number }
  ) => {
    const params = {
      limit: options?.limit || 10,
      threshold: options?.threshold || 0.7
    }
    return api.get(`/maps/${mapId}/nodes/${nodeId}/similar`, { params })
  },

  generateEmbedding: async (mapId: string, nodeId: string) =>
    api.post(`/maps/${mapId}/nodes/${nodeId}/embedding`)
}
