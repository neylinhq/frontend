import { describe, expect, it } from 'vitest'
import { AITaskSchema, EdgeSuggestionResultSchema } from '../ai.schema'

describe('AITaskSchema', () => {
  it('parses a valid AI task', () => {
    const task = {
      id: 'task-1',
      type: 'map_analysis',
      status: 'completed',
      createdAt: '2024-01-15T00:00:00.000Z'
    }

    expect(AITaskSchema.parse(task)).toEqual(task)
  })

  it('rejects unknown task status', () => {
    expect(() =>
      AITaskSchema.parse({
        id: 'task-2',
        type: 'map_analysis',
        status: 'queued',
        createdAt: '2024-01-15T00:00:00.000Z'
      })
    ).toThrow()
  })
})

describe('EdgeSuggestionResultSchema', () => {
  it('parses suggestion results', () => {
    const result = {
      suggestions: [
        {
          sourceLabel: 'Node A',
          targetLabel: 'Node B',
          relationType: 'related-to',
          confidence: 0.8,
          reason: 'Shares core concepts'
        }
      ],
      tokensUsed: 120
    }

    expect(EdgeSuggestionResultSchema.parse(result)).toEqual(result)
  })
})
