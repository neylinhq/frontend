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

// Streaming types
export interface ChatStreamChunk {
  type: 'text' | 'sources' | 'proposal' | 'done' | 'error'
  content?: string
  sourceNodes?: NodeReference[]
  proposal?: ProposalData
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

  // Streaming RAG Chat
  chatWithMapStream: (
    mapId: string,
    question: string,
    onChunk: (chunk: ChatStreamChunk) => void,
    options?: {
      model?: string
      topK?: number
      nodeId?: string
      currentNodeId?: string
      history?: Array<{ role: 'user' | 'assistant'; content: string }>
      signal?: AbortSignal
    }
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || '/api'
        const token = localStorage.getItem('accessToken')

        const response = await fetch(`${baseUrl}/maps/${mapId}/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            question,
            model: options?.model,
            topK: options?.topK,
            nodeId: options?.nodeId,
            currentNodeId: options?.currentNodeId,
            history: options?.history
          }),
          signal: options?.signal
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) {
          throw new Error('No response body')
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // Parse SSE events
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const chunk = JSON.parse(line.slice(6)) as ChatStreamChunk
                onChunk(chunk)
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }

        resolve()
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          resolve() // Aborted, not an error
        } else {
          reject(error)
        }
      }
    })
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
