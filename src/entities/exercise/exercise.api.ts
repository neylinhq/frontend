import { api } from '@/shared/api/api-client'
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
  getNextExercise: async (mapId: string): Promise<Exercise> => {
    const response = await api.get<ApiResponse<Exercise>>(`/maps/${mapId}/exercises/next`)
    return response.data
  },

  // Submit answer and get feedback
  submitAnswer: async (exerciseId: string, answer: unknown): Promise<SubmitAnswerOutput> => {
    const response = await api.post<ApiResponse<SubmitAnswerOutput>>(
      `/exercises/${exerciseId}/answer`,
      { answer }
    )
    return response.data
  }
}
