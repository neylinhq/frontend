import { describe, expect, it } from 'vitest'
import { enrichNodesWithProgress, getProgressStats } from '../progress.utils'

describe('progress utilities', () => {
  it('enriches nodes with progress data', () => {
    const nodes = [
      {
        id: 'node-1',
        mapId: 'map-1',
        label: 'Node 1',
        type: 'concept',
        position: { x: 0, y: 0 },
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'node-2',
        mapId: 'map-1',
        label: 'Node 2',
        type: 'fact',
        position: { x: 0, y: 0 },
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    const progress = [
      {
        id: 'progress-1',
        userId: 'user-1',
        nodeId: 'node-1',
        confidence: 0.5,
        masteryLevel: 'learning',
        lastReviewedAt: null,
        nextReviewAt: null,
        reviewCount: 1,
        correctStreak: 0,
        notes: null,
        isBookmarked: true,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    ]

    const result = enrichNodesWithProgress(nodes, progress)
    expect(result[0].progress.masteryLevel).toBe('learning')
    expect(result[1].progress.nodeId).toBe('node-2')
    expect(result[1].progress.isBookmarked).toBe(false)
  })

  it('summarizes progress stats', () => {
    const nodes = [
      {
        id: 'node-1',
        mapId: 'map-1',
        label: 'Node 1',
        type: 'concept',
        position: { x: 0, y: 0 },
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        progress: {
          id: 'progress-1',
          userId: 'user-1',
          nodeId: 'node-1',
          confidence: 1,
          masteryLevel: 'mastered',
          lastReviewedAt: null,
          nextReviewAt: null,
          reviewCount: 2,
          correctStreak: 2,
          notes: null,
          isBookmarked: false,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      },
      {
        id: 'node-2',
        mapId: 'map-1',
        label: 'Node 2',
        type: 'fact',
        position: { x: 0, y: 0 },
        metadata: {},
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        progress: {
          id: 'progress-2',
          userId: 'user-1',
          nodeId: 'node-2',
          confidence: 0,
          masteryLevel: 'not_started',
          lastReviewedAt: null,
          nextReviewAt: null,
          reviewCount: 0,
          correctStreak: 0,
          notes: null,
          isBookmarked: true,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    ]

    const stats = getProgressStats(nodes)
    expect(stats.total).toBe(2)
    expect(stats.mastered).toBe(1)
    expect(stats.notStarted).toBe(1)
    expect(stats.bookmarked).toBe(1)
    expect(stats.masteryPercent).toBe(50)
  })

  it('returns zeros for empty progress stats', () => {
    const stats = getProgressStats([])
    expect(stats.total).toBe(0)
    expect(stats.avgConfidence).toBe(0)
    expect(stats.masteryPercent).toBe(0)
  })
})
