import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { exerciseApi } from './exercise.api'
import type { GenerateExercisesRequest } from './exercise.schema'

export const exerciseKeys = {
  all: ['exercises'] as const,
  next: (mapId: string, nodeId?: string) => [...exerciseKeys.all, 'next', mapId, nodeId] as const,
  progress: (mapId: string) => [...exerciseKeys.all, 'progress', mapId] as const
}

export const useNextExercise = (mapId: string, nodeId?: string, enabled = true) => {
  return useQuery({
    queryKey: exerciseKeys.next(mapId, nodeId),
    queryFn: () => exerciseApi.getNextExercise(mapId, nodeId),
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
    mutationFn: ({
      mapId,
      exerciseId,
      answer
    }: {
      mapId: string
      exerciseId: string
      answer: unknown
    }) => exerciseApi.submitAnswer(mapId, exerciseId, answer),
    onSuccess: data => {
      // Invalidate progress queries
      queryClient.invalidateQueries({ queryKey: exerciseKeys.progress(data.progress.map_id) })
      // Also invalidate next exercise query to get a new one
      queryClient.invalidateQueries({ queryKey: exerciseKeys.next(data.progress.map_id) })
    }
  })
}
