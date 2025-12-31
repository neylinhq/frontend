import { describe, expect, it } from 'vitest'
import { UserMapProgressSchema, UserNodeProgressSchema } from '../progress.schema'

describe('UserNodeProgressSchema', () => {
  it('applies defaults for learning metrics', () => {
    const result = UserNodeProgressSchema.parse({
      id: 'progress-1',
      userId: 'user-1',
      nodeId: 'node-1',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    })

    expect(result.confidence).toBe(0)
    expect(result.masteryLevel).toBe('not_started')
    expect(result.reviewCount).toBe(0)
    expect(result.isBookmarked).toBe(false)
  })
})

describe('UserMapProgressSchema', () => {
  it('applies viewport and rating defaults', () => {
    const result = UserMapProgressSchema.parse({
      id: 'map-progress-1',
      userId: 'user-1',
      mapId: 'map-1',
      createdAt: '2024-01-15T00:00:00.000Z',
      updatedAt: '2024-01-15T00:00:00.000Z'
    })

    expect(result.viewport).toEqual({ x: 0, y: 0, zoom: 1 })
    expect(result.preferredRatingSystem).toBe('elo')
    expect(result.eloRating).toBe(1500)
  })
})
