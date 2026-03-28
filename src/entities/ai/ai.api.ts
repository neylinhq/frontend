import { api, type ApiResponse } from '@/shared/api/client'
import { STREAM_API_URL } from '@/shared/config/env'
import { logger } from '@/shared/lib/logger'
import { parseSSEStream } from '@/shared/lib/sse'

import type { AIModel, EnrichType } from './ai.schema'

export interface NodeReference {
  id: string
  label: string
  type: string
}

export interface ProposalData {
  type: 'edit' | 'new_node' | 'connection' | 'exercise' | 'graph_fragment'

  // For edit
  field?: 'description' | 'content' | 'examples' | 'sources'
  current?: string
  value?: string
  nodeId?: string
  nodeVersion?: number

  // For new_node
  newNode?: {
    label: string
    nodeType: string
    description: string
    content?: string
  }

  // For connection
  connection?: {
    fromLabel: string
    toLabel: string
    relation: string
    reasoning: string
  }

  // For exercise
  exercise?: {
    type: string
    difficulty: number
    question: string
    options?: string[]
    answer: unknown
    explanation?: string
    data?: Record<string, unknown>
  }

  // For graph_fragment (unified nodes + edges)
  graphFragment?: {
    title: string
    nodes: Array<{
      tempId: string
      label: string
      nodeType: string
      description: string
      content?: string
    }>
    edges: Array<{
      tempId: string
      fromRef: string
      toRef: string
      fromIsNew: boolean
      toIsNew: boolean
      relation: string
    }>
    reasoning?: string
  }
}

export interface ChatWithMapResponse {
  action: 'chat' | 'proposal'
  message: string
  proposal?: ProposalData
  proposals?: ProposalData[] // Multiple proposals (for batch exercises)
  sourceNodes: NodeReference[]
  tokensUsed: number
}

// Streaming types
export interface ChatStreamChunk {
  type: 'text' | 'sources' | 'proposal' | 'done' | 'error'
  content?: string
  sourceNodes?: NodeReference[]
  proposal?: ProposalData
  proposals?: ProposalData[] // Multiple proposals (for batch exercises)
  /** AI brand identifier for avatar icons (e.g., 'openai', 'anthropic', 'deepseek') */
  brand?: string
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
    const response = await api.post<ApiResponse<ChatWithMapResponse>>(`/maps/${mapId}/chat`, {
      question,
      model,
      topK,
      nodeId,
      currentNodeId,
      history
    })
    return response.data
  },

  // Streaming RAG Chat
  chatWithMapStream: async (
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
      /** Timeout in milliseconds (default: 5 minutes) */
      timeout?: number
    }
  ): Promise<void> => {
    // Setup timeout (default 5 minutes)
    const timeoutMs = options?.timeout ?? 5 * 60 * 1000
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let abortController: AbortController | null = null

    // Create internal AbortController for timeout
    if (!options?.signal) {
      abortController = new AbortController()
    }

    const signal = options?.signal ?? abortController?.signal

    // Setup timeout handler
    if (timeoutMs > 0) {
      timeoutId = setTimeout(() => {
        abortController?.abort()
        onChunk({ type: 'error', content: 'Request timed out' })
      }, timeoutMs)
    }

    try {
      const response = await fetch(`${STREAM_API_URL}/maps/${mapId}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          question,
          model: options?.model,
          topK: options?.topK,
          nodeId: options?.nodeId,
          currentNodeId: options?.currentNodeId,
          history: options?.history
        }),
        signal
      })

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData?.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch {
          // Ignore JSON parse errors
        }
        throw new Error(errorMessage)
      }

      await parseSSEStream(
        response,
        (chunk) => onChunk(chunk as ChatStreamChunk),
        signal
      )
    } catch (error) {
      logger.error('[AI Stream] Stream error:', error)
      if ((error as Error).name !== 'AbortError') {
        throw error
      }
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
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
