import { api } from '@/shared/api/client'
import type { Exercise, GenerateExercisesRequest, SubmitAnswerOutput } from './exercise.schema'

interface ApiResponse<T> {
  success: boolean
  data: T
}

export const exerciseApi = {
  // Generate exercises for a map
  generateExercises: async (
    mapId: string,
    request: GenerateExercisesRequest
  ): Promise<Exercise[]> => {
    const response = await api.post<ApiResponse<{ exercises: Exercise[]; count: number }>>(
      `/maps/${mapId}/exercises/generate`,
      {
        nodeIds: request.nodeIds,
        types: request.types,
        difficulty: request.difficulty,
        count: request.count
      }
    )
    return response.data.exercises
  },

  // Get next exercise for spaced repetition
  getNextExercise: async (mapId: string, nodeId?: string): Promise<Exercise> => {
    const params = nodeId ? `?nodeId=${nodeId}` : ''
    const response = await api.get<ApiResponse<Exercise>>(`/maps/${mapId}/exercises/next${params}`)
    return response.data
  },

  // Submit answer and get feedback
  submitAnswer: async (
    mapId: string,
    exerciseId: string,
    answer: unknown
  ): Promise<SubmitAnswerOutput> => {
    const response = await api.post<ApiResponse<SubmitAnswerOutput>>(
      `/maps/${mapId}/exercises/${exerciseId}/submit`,
      { answer }
    )
    return response.data
  }
}
