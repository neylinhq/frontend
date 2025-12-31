import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}))

import { api } from '@/shared/api/client'
import { exerciseApi } from '../exercise.api'

describe('exerciseApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls exercise endpoints', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: {} })
    vi.mocked(api.post).mockResolvedValue({ data: { exercises: [], count: 0 } })

    await exerciseApi.generateExercises('map-1', { difficulty: 2, count: 1 })
    await exerciseApi.getNextExercise('map-1')
    await exerciseApi.getNextExercise('map-1', 'node-1')
    await exerciseApi.submitAnswer('map-1', 'exercise-1', { answer: 'A' })

    expect(api.post).toHaveBeenCalledWith('/maps/map-1/exercises/generate', {
      nodeIds: undefined,
      types: undefined,
      difficulty: 2,
      count: 1
    })
    expect(api.get).toHaveBeenCalledWith('/maps/map-1/exercises/next?nodeId=node-1')
  })
})