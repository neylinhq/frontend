import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { aiApi } from './ai.api'
import type { EnrichType } from './ai.schema'

export const aiKeys = {
  all: ['ai'] as const,
  models: () => [...aiKeys.all, 'models'] as const,
  tasks: () => [...aiKeys.all, 'tasks'] as const,
  task: (id: string) => [...aiKeys.tasks(), id] as const
}

export const useAIModels = () => {
  return useQuery({
    queryKey: aiKeys.models(),
    queryFn: () => aiApi.listModels(),
    staleTime: Infinity // Models rarely change
  })
}

export const useAITask = (taskId: string | null) => {
  return useQuery({
    queryKey: aiKeys.task(taskId!),
    queryFn: () => aiApi.getTaskStatus(taskId!),
    enabled: !!taskId,
    refetchInterval: data =>
      data?.status === 'pending' || data?.status === 'processing' ? 1000 : false
  })
}

export const useEnrichNode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ nodeId, enrichType }: { nodeId: string; enrichType: EnrichType }) =>
      aiApi.enrichNode(nodeId, enrichType, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] })
    }
  })
}

export const useAnalyzeMap = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mapId, model }: { mapId: string; model: string }) =>
      aiApi.analyzeMap(mapId, model, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] })
    }
  })
}

export const useSuggestEdges = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ mapId }: { mapId: string }) => aiApi.suggestEdges(mapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['edges'] })
    }
  })
}

export const useDetectGaps = () => {
  return useMutation({
    mutationFn: ({ mapId }: { mapId: string }) => aiApi.detectGaps(mapId)
  })
}

export const useGenerateExercises = () => {
  return useMutation({
    mutationFn: ({
      mapId,
      options
    }: {
      mapId: string
      options: {
        nodeIds?: string[]
        types?: string[]
        difficulty?: number
        count?: number
      }
    }) => aiApi.generateExercises(mapId, options)
  })
}
