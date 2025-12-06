import { api } from '@/shared/api/api-client'
import type { EnrichType } from './ai.schema'

export const aiApi = {
  // Node operations
  enrichNode: async (nodeId: string, enrichType: EnrichType, async = true) =>
    api.post(`/nodes/${nodeId}/enrich`, { enrichType, async }),

  suggestContent: async (nodeId: string) => api.post(`/nodes/${nodeId}/suggest`),

  factCheck: async (nodeId: string) => api.post(`/nodes/${nodeId}/fact-check`),

  // Map operations
  analyzeMap: async (mapId: string, model: string, async = true) =>
    api.post(`/maps/${mapId}/analyze`, { model, async }),

  suggestEdges: async (mapId: string) => api.post(`/maps/${mapId}/suggest-edges`),

  generateNodes: async (mapId: string, gaps: string[]) =>
    api.post(`/maps/${mapId}/generate-nodes`, { gaps }),

  detectGaps: async (mapId: string) => api.post(`/maps/${mapId}/detect-gaps`),

  // Exercise operations
  generateExercises: async (
    mapId: string,
    options: {
      nodeIds?: string[]
      types?: string[]
      difficulty?: number
      count?: number
    }
  ) => api.post(`/maps/${mapId}/exercises/generate`, options),

  getNextExercise: async (mapId: string) => api.get(`/maps/${mapId}/exercises/next`),

  submitAnswer: async (exerciseId: string, answer: unknown) =>
    api.post(`/exercises/${exerciseId}/answer`, { answer }),

  // Task status
  getTaskStatus: async (taskId: string) => api.get(`/ai/tasks/${taskId}`),

  cancelTask: async (taskId: string) => api.delete(`/ai/tasks/${taskId}`)
}
