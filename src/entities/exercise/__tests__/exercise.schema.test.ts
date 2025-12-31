import { describe, expect, it } from 'vitest'
import { ExerciseSchema, SubmitAnswerOutputSchema } from '../exercise.schema'

describe('ExerciseSchema', () => {
  it('parses a valid exercise', () => {
    const exercise = {
      id: 'exercise-1',
      map_id: 'map-1',
      node_ids: ['node-1'],
      type: 'quiz',
      difficulty: 3,
      question: 'What is a concept?',
      metadata: { estimated_time_seconds: 60 },
      created_at: '2024-01-15T00:00:00.000Z'
    }

    expect(ExerciseSchema.parse(exercise)).toEqual(exercise)
  })

  it('rejects out-of-range difficulty', () => {
    expect(() =>
      ExerciseSchema.parse({
        id: 'exercise-2',
        map_id: 'map-1',
        node_ids: ['node-1'],
        type: 'quiz',
        difficulty: 10,
        question: 'Invalid',
        metadata: { estimated_time_seconds: 60 },
        created_at: '2024-01-15T00:00:00.000Z'
      })
    ).toThrow()
  })
})

describe('SubmitAnswerOutputSchema', () => {
  it('parses submit answer results', () => {
    const payload = {
      is_correct: true,
      explanation: 'Because it is correct.',
      progress: {
        id: 'progress-1',
        user_id: 'user-1',
        node_id: 'node-1',
        map_id: 'map-1',
        ease_factor: 2.5,
        interval_days: 4,
        repetitions: 2,
        next_review_at: null,
        total_reviews: 3,
        correct_count: 2,
        incorrect_count: 1,
        average_time_ms: 5000,
        last_review_at: null,
        mastery_level: 'learning',
        accuracy: 0.67,
        created_at: '2024-01-15T00:00:00.000Z',
        updated_at: '2024-01-15T00:00:00.000Z'
      },
      mastery_change: 'improved'
    }

    expect(SubmitAnswerOutputSchema.parse(payload)).toEqual(payload)
  })
})
