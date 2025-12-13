import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { aiApi } from './ai.api'
import type { EnrichType } from './ai.schema'

const SELECTED_MODEL_KEY = 'neylin:selected-ai-model'

export const aiKeys = {
  all: ['ai'] as const,
  models: () => [...aiKeys.all, 'models'] as const
}

export const useAIModels = () => {
  return useQuery({
    queryKey: aiKeys.models(),
    queryFn: () => aiApi.listModels(),
    staleTime: Infinity // Models rarely change
  })
}

/**
 * Hook for managing selected AI model with localStorage persistence
 * Single source of truth for model selection across the app
 */
export const useSelectedModel = () => {
  const { data: models = [], isLoading } = useAIModels()
  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SELECTED_MODEL_KEY) || ''
    }
    return ''
  })

  // Once models are loaded, validate selection or default to first
  useEffect(() => {
    if (models.length > 0) {
      const isValidSelection = models.some(m => m.id === selectedModel)
      if (!isValidSelection) {
        // Default to first model if no valid selection
        const defaultModel = models[0].id
        setSelectedModelState(defaultModel)
        localStorage.setItem(SELECTED_MODEL_KEY, defaultModel)
      }
    }
  }, [models, selectedModel])

  const setSelectedModel = useCallback((modelId: string) => {
    setSelectedModelState(modelId)
    localStorage.setItem(SELECTED_MODEL_KEY, modelId)
  }, [])

  return {
    models,
    selectedModel,
    setSelectedModel,
    isLoading
  }
}

export const useEnrichNode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      mapId,
      nodeId,
      enrichType
    }: {
      mapId: string
      nodeId: string
      enrichType: EnrichType
    }) => aiApi.enrichNode(mapId, nodeId, enrichType, true),
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
