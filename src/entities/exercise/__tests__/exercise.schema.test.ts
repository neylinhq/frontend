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
  it('parses FSRS-based submit answer results', () => {
    const payload = {
      isCorrect: true,
      feedback: 'Correct! Well done.',
      explanation: 'Because it is correct.',
      masteryChange: 'practicing',
      stabilityBefore: 3.2,
      stabilityAfter: 5.1,
      nextReviewDays: 5,
      retrievability: 0.92,
      nodeResults: [
        {
          nodeId: 'node-1',
          stabilityBefore: 3.2,
          stabilityAfter: 5.1,
          retrievability: 0.92,
          masteryLevel: 'practicing',
          nextReviewDays: 5,
        },
      ],
    }

    expect(SubmitAnswerOutputSchema.parse(payload)).toEqual(payload)
  })
})
