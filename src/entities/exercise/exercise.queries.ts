import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { exerciseApi } from './exercise.api'
import type { GenerateExercisesRequest } from './exercise.schema'

export const exerciseKeys = {
  all: ['exercises'] as const,
  next: (mapId: string) => [...exerciseKeys.all, 'next', mapId] as const,
  progress: (mapId: string) => [...exerciseKeys.all, 'progress', mapId] as const
}

export const useNextExercise = (mapId: string, enabled = true) => {
  return useQuery({
    queryKey: exerciseKeys.next(mapId),
    queryFn: () => exerciseApi.getNextExercise(mapId),
    enabled,
    staleTime: 0, // Always fetch fresh exercise
    retry: false
  })
}

export const useGenerateExercises = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mapId, request }: { mapId: string; request: GenerateExercisesRequest }) =>
      exerciseApi.generateExercises(mapId, request),
    onSuccess: (_, { mapId }) => {
      // Invalidate next exercise query
      queryClient.invalidateQueries({ queryKey: exerciseKeys.next(mapId) })
    }
  })
}

export const useSubmitAnswer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ exerciseId, answer }: { exerciseId: string; answer: unknown }) =>
      exerciseApi.submitAnswer(exerciseId, answer),
    onSuccess: data => {
      // Invalidate progress queries
      queryClient.invalidateQueries({ queryKey: exerciseKeys.progress(data.progress.map_id) })
    }
  })
}
