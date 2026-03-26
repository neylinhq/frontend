import { api } from '@/shared/api/client'
import { STREAM_API_URL } from '@/shared/config/env'

// --- Types ---

export interface LessonPlan {
  concept: string
  steps: LessonStep[]
  takeaway: string
  prerequisite_domains?: string[]
}

export interface LessonStep {
  type: 'activation' | 'explanation' | 'self_explanation' | 'connection' | 'recall' | 'application'
  prompt?: string
  hint?: string
  chunks?: ExplanationChunk[]
  key_ideas?: string[]
  related_concept?: string
  scenario?: string
  question?: string
  answer?: string
}

export interface ExplanationChunk {
  text: string
  check?: {
    question: string
    options: Array<{ id: string; content: string; correct: boolean }>
  }
}

export interface EvaluateStepOutput {
  quality: number
  has_key_ideas: boolean[]
  feedback: string
  encouragement: string
}

export interface TutorChunk {
  type: 'text' | 'done' | 'error'
  content?: string
}

export interface TutorMessageInput {
  message: string
  nodeId: string
  history: Array<{ role: 'user' | 'assistant'; content: string }>
  locale?: string
}

export interface StartSessionResult {
  sessionId: string
  nodeQueue: string[]
}

export interface ExpandSuggestion {
  nodeId: string
  label: string
  reason: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

// --- Lesson cache (for prefetch -> use on mount) ---

const lessonCache = new Map<string, { plan: LessonPlan; ts: number }>()
const LESSON_CACHE_TTL = 5 * 60 * 1000 // 5 min

// --- API ---

export const learnSessionApi = {
  startLesson: async (mapId: string, nodeId: string): Promise<LessonPlan> => {
    const key = `${mapId}:${nodeId}`
    const cached = lessonCache.get(key)
    if (cached && Date.now() - cached.ts < LESSON_CACHE_TTL) {
      return cached.plan
    }
    const response = await api.post<ApiResponse<LessonPlan>>(
      `/maps/${mapId}/learn/start`,
      { nodeId }
    )
    lessonCache.set(key, { plan: response.data, ts: Date.now() })
    return response.data
  },

  evaluateStep: async (
    mapId: string,
    input: {
      conceptTitle: string
      stepType: string
      question: string
      studentAnswer: string
      keyIdeas?: string[]
    }
  ): Promise<EvaluateStepOutput> => {
    const response = await api.post<ApiResponse<EvaluateStepOutput>>(
      `/maps/${mapId}/learn/evaluate`,
      input
    )
    return response.data
  },
}

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
      const response = await fetch(`${STREAM_API_URL}/maps/${mapId}/practice/tutor/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: input.message,
          nodeId: input.nodeId,
          history: input.history,
          locale: input.locale,
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

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response body')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      for (;;) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const chunk = JSON.parse(line.slice(6)) as TutorChunk
              onChunk(chunk)
            } catch {
              // skip unparseable
            }
          }
        }
      }
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
  ): Promise<ExpandSuggestion[]> => {
    const response = await api.post<ApiResponse<ExpandSuggestion[]>>(
      `/maps/${mapId}/practice/sessions/expand-suggestions`,
      { coveredNodeIds }
    )
    return (response as ApiResponse<ExpandSuggestion[]>).data
  },
}
