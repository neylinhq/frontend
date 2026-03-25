import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { createQueryWrapper, createTestQueryClient } from '@/shared/tests'

vi.mock('../exercise.api', () => ({
  exerciseApi: {
    getNextExercise: vi.fn(),
    generateExercises: vi.fn(),
    submitAnswer: vi.fn()
  }
}))

import { exerciseApi } from '../exercise.api'
import {
  exerciseKeys,
  useGenerateExercises,
  useNextExercise,
  useSubmitAnswer
} from '../exercise.queries'

describe('exercise queries', () => {
  const exercise = {
    id: 'exercise-1',
    map_id: 'map-1',
    node_ids: ['node-1'],
    type: 'quiz',
    difficulty: 1,
    question: 'Question',
    metadata: { estimated_time_seconds: 10 },
    created_at: '2024-01-01T00:00:00.000Z'
  }

  const submitOutput = {
    isCorrect: true,
    feedback: 'Correct!',
    explanation: 'ok',
    masteryChange: 'learning',
    stabilityBefore: 0,
    stabilityAfter: 1.5,
    nextReviewDays: 1,
    retrievability: 1.0,
  }

  it('fetches next exercise', async () => {
    vi.mocked(exerciseApi.getNextExercise).mockResolvedValue(exercise)

    const queryClient = createTestQueryClient()
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useNextExercise('map-1', 'node-1'), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual(exercise))
    expect(exerciseApi.getNextExercise).toHaveBeenCalledWith('map-1', 'node-1')
  })

  it('invalidates queries after generate', async () => {
    vi.mocked(exerciseApi.generateExercises).mockResolvedValue([exercise])

    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useGenerateExercises(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        mapId: 'map-1',
        request: { difficulty: 2, count: 1 }
      })
    })

    expect(exerciseApi.generateExercises).toHaveBeenCalledWith('map-1', {
      difficulty: 2,
      count: 1
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: exerciseKeys.next('map-1') })
  })

  it('invalidates progress after submit', async () => {
    vi.mocked(exerciseApi.submitAnswer).mockResolvedValue(submitOutput)

    const queryClient = createTestQueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const wrapper = createQueryWrapper(queryClient)

    const { result } = renderHook(() => useSubmitAnswer(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ mapId: 'map-1', exerciseId: 'exercise-1', answer: 'A' })
    })

    expect(exerciseApi.submitAnswer).toHaveBeenCalledWith('map-1', 'exercise-1', 'A')
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: exerciseKeys.progress('map-1')
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: exerciseKeys.next('map-1') })
  })
})
