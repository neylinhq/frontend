import { api } from '@/shared/api/client'

// --- Types ---

export interface LessonPlan {
  concept: string
  steps: LessonStep[]
  takeaway: string
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

interface ApiResponse<T> {
  success: boolean
  data: T
}

// --- API ---

export const learnSessionApi = {
  startLesson: async (mapId: string, nodeId: string): Promise<LessonPlan> => {
    const response = await api.post<ApiResponse<LessonPlan>>(
      `/maps/${mapId}/learn/start`,
      { nodeId }
    )
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
