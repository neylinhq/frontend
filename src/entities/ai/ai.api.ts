import { api } from '@/shared/api/client'
import type { AIModel, EnrichType } from './ai.schema'

interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface NodeReference {
  id: string
  label: string
  type: string
}

export interface ChatWithMapResponse {
  answer: string
  sourceNodes: NodeReference[]
  tokensUsed: number
}

export interface EmbeddingsResponse {
  totalNodes: number
  embeddedNodes: number
  skippedNodes: number
  failedNodes: number
}

export const aiApi = {
  // Get available AI models
  listModels: async (): Promise<AIModel[]> => {
    const response = await api.get<ApiResponse<AIModel[]>>('/ai/models')
    return response.data
  },

  // Node operations
  enrichNode: async (mapId: string, nodeId: string, enrichType: EnrichType, async = true) =>
    api.post(`/maps/${mapId}/nodes/${nodeId}/enrich`, { enrichType, async }),

  suggestContent: async (mapId: string, nodeId: string) =>
    api.post(`/maps/${mapId}/nodes/${nodeId}/suggest`),

  factCheck: async (mapId: string, nodeId: string) =>
    api.post(`/maps/${mapId}/nodes/${nodeId}/fact-check`),

  // Map operations
  analyzeMap: async (mapId: string, model: string, async = true) =>
    api.post(`/maps/${mapId}/analyze`, { model, async }),

  suggestEdges: async (mapId: string) => api.post(`/maps/${mapId}/suggest-edges`),

  generateNodes: async (mapId: string, gaps: string[]) =>
    api.post(`/maps/${mapId}/generate-nodes`, { gaps }),

  detectGaps: async (mapId: string) => api.post(`/maps/${mapId}/detect-gaps`),

  // RAG Chat
  chatWithMap: async (
    mapId: string,
    question: string,
    model?: string,
    topK?: number
  ): Promise<ChatWithMapResponse> => {
    const response = await api.post<ApiResponse<ChatWithMapResponse>>(
      `/maps/${mapId}/chat`,
      { question, model, topK }
    )
    return response.data
  },

  // Generate embeddings for all nodes in a map
  generateEmbeddings: async (mapId: string): Promise<EmbeddingsResponse> => {
    const response = await api.post<ApiResponse<EmbeddingsResponse>>(
      `/maps/${mapId}/embeddings`
    )
    return response.data
  },

  // Exercise operations
  generateExercises: async (
    mapId: string,
    options: {
      nodeIds?: string[]
      types?: string[]
      difficulty?: number
      count?: number
    }
  ) => api.post(`/maps/${mapId}/exercises/generate`, options),

  getNextExercise: async (mapId: string) => api.get(`/maps/${mapId}/exercises/next`),

  submitAnswer: async (exerciseId: string, answer: unknown) =>
    api.post(`/exercises/${exerciseId}/answer`, { answer }),

  // Task status
  getTaskStatus: async (taskId: string) => api.get(`/ai/tasks/${taskId}`),

  cancelTask: async (taskId: string) => api.delete(`/ai/tasks/${taskId}`)
}
