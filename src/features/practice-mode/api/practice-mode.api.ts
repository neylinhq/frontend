import { api, type ApiResponse } from '@/shared/api/client'
import { STREAM_API_URL } from '@/shared/config/env'
import { parseSSEStream } from '@/shared/lib/sse'

// --- Types ---

export interface NodeEvaluation {
  nodeId: string
  quality: number
}

export interface TutorChunk {
  type: 'text' | 'done' | 'error' | 'node_evaluations' | 'content_correction' | 'quality'
  content?: string
  evaluations?: NodeEvaluation[]
  quality?: number
  stabilityBefore?: number
  stabilityAfter?: number
}

export interface SubgraphNode {
  nodeId: string
  label: string
  status: 'upcoming' | 'completed'
  complexity: number
  mastery: string
  quality?: number
}

export interface SubgraphEdge {
  sourceNodeId: string
  targetNodeId: string
  relationType: string
}

export interface SessionSubgraph {
  nodes: SubgraphNode[]
  edges: SubgraphEdge[]
}

export interface TutorMessageInput {
  message: string
  nodeId: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  locale?: string
  sessionSubgraph?: SessionSubgraph
}

export interface StartSessionResult {
  sessionId: string
  nodeQueue: string[]
  sessionSubgraph?: SessionSubgraph
  productiveFailureNodes?: string[]
}

export interface ExpandDirection {
  direction: string
  nodeLabels: string[]
  description: string
}

/** @deprecated use ExpandDirection */
export type ExpandSuggestion = ExpandDirection

export const practiceModeApi = {
  /**
   * Start a scoped session and get the node chain.
   */
  startScopedSession: async (
    mapId: string,
    mode: 'tutor' | 'review',
    scopeNodeIds: string[]
  ): Promise<StartSessionResult> => {
    const response = await api.post<ApiResponse<StartSessionResult>>(
      `/maps/${mapId}/practice/sessions`,
      {
        type: mode === 'tutor' ? 'learn' : 'review',
        mode,
        scopeNodeIds,
      }
    )
    return (response as ApiResponse<StartSessionResult>).data
  },

  /**
   * Send a tutor message via SSE streaming.
   */
  tutorMessage: async (
    mapId: string,
    input: TutorMessageInput,
    onChunk: (chunk: TutorChunk) => void,
    signal?: AbortSignal
  ): Promise<void> => {
    const abortController = signal ? null : new AbortController()
    const effectiveSignal = signal ?? abortController?.signal

    const timeoutId = setTimeout(() => {
      abortController?.abort()
      onChunk({ type: 'error', content: 'Request timed out' })
    }, 3 * 60 * 1000)

    try {
      const response = await fetch(`${STREAM_API_URL}/maps/${mapId}/practice/tutor/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: input.message,
          nodeId: input.nodeId,
          history: input.history,
          locale: input.locale,
          sessionSubgraph: input.sessionSubgraph,
        }),
        signal: effectiveSignal,
      })

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData?.error?.message) {
            errorMessage = errorData.error.message
          }
        } catch {
          // ignore
        }
        throw new Error(errorMessage)
      }

      await parseSSEStream(
        response,
        (chunk) => onChunk(chunk as TutorChunk),
        effectiveSignal
      )
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        throw error
      }
    } finally {
      clearTimeout(timeoutId)
    }
  },

  /**
   * Get expand suggestions for nodes not yet covered.
   */
  getExpandSuggestions: async (
    mapId: string,
    coveredNodeIds: string[]
  ): Promise<ExpandDirection[]> => {
    const response = await api.post<ApiResponse<{ suggestions: ExpandDirection[] }>>(
      `/maps/${mapId}/practice/sessions/expand-suggestions`,
      { coveredNodeIds }
    )
    return (response as ApiResponse<{ suggestions: ExpandDirection[] }>).data.suggestions ?? []
  },
}
