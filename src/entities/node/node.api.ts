import { api, type ApiResponse } from '@/shared/api/client'
import type { Node } from './node.schema'
import type { CreateNodeRequest, UpdateNodeRequest, UpdatePositionsRequest } from './node.schema'

export const nodeApi = {
  // Existing node operations
  create: async (mapId: string, data: CreateNodeRequest): Promise<Node> => {
    const response = await api.post<ApiResponse<Node>>(`/maps/${mapId}/nodes`, data)
    return response.data
  },

  get: async (mapId: string, nodeId: string): Promise<Node> => {
    const response = await api.get<ApiResponse<Node>>(`/maps/${mapId}/nodes/${nodeId}`)
    return response.data
  },

  list: async (mapId: string, type?: string): Promise<Node[]> => {
    const params = type ? `?type=${type}` : ''
    const response = await api.get<ApiResponse<Node[]>>(`/maps/${mapId}/nodes${params}`)
    return response.data
  },

  update: async (mapId: string, nodeId: string, data: UpdateNodeRequest): Promise<Node> => {
    const response = await api.patch<ApiResponse<Node>>(`/maps/${mapId}/nodes/${nodeId}`, data)
    return response.data
  },

  delete: async (mapId: string, nodeId: string): Promise<void> => {
    await api.delete(`/maps/${mapId}/nodes/${nodeId}`)
  },

  updatePositions: async (mapId: string, data: UpdatePositionsRequest): Promise<void> => {
    await api.patch(`/maps/${mapId}/nodes/positions`, data)
  },

  // RAG operations
  generateEmbedding: async (mapId: string, nodeId: string): Promise<void> => {
    await api.post(`/maps/${mapId}/nodes/${nodeId}/embedding`)
  }
}
