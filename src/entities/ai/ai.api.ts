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

export interface ProposalData {
  field: 'description' | 'content' | 'examples' | 'sources'
  current: string
  value: string
}

export interface ChatWithMapResponse {
  action: 'chat' | 'proposal'
  message: string
  proposal?: ProposalData
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

  // Map operations
  analyzeMap: async (mapId: string, model: string, async = true) =>
    api.post(`/maps/${mapId}/analyze`, { model, async }),

  // RAG Chat - main AI interaction point
  chatWithMap: async (
    mapId: string,
    question: string,
    model?: string,
    topK?: number,
    nodeId?: string,
    currentNodeId?: string,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<ChatWithMapResponse> => {
    const response = await api.post<ApiResponse<ChatWithMapResponse>>(
      `/maps/${mapId}/chat`,
      { question, model, topK, nodeId, currentNodeId, history }
    )
    return response.data
  },

  // Generate embeddings for all nodes in a map
  generateEmbeddings: async (mapId: string): Promise<EmbeddingsResponse> => {
    const response = await api.post<ApiResponse<EmbeddingsResponse>>(
      `/maps/${mapId}/embeddings`,
      {}
    )
    return response.data
  }
}
