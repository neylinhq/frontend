import { describe, expect, it } from 'vitest'

import {
  getEdgeBadgeClass,
  getEdgeBgClass,
  getEdgeBgLightClass,
  getEdgeBgMediumClass,
  getEdgeStrokeColor,
  getEdgeTextClass
} from '../lib/edge-colors'
import type { RelationType } from '../model/edge.schema'

describe('edge color helpers', () => {
  it('returns style tokens for relation types', () => {
    expect(getEdgeStrokeColor('causes')).toContain('--edge-causes')
    expect(getEdgeBgClass('causes')).toBe('bg-edge-causes-muted')
    expect(getEdgeBgLightClass('causes')).toBe('bg-edge-causes/15')
    expect(getEdgeBgMediumClass('causes')).toBe('bg-edge-causes/25')
    expect(getEdgeTextClass('causes')).toBe('text-edge-causes')
  })

  it('builds badge class with background and text', () => {
    expect(getEdgeBadgeClass('related-to')).toBe('bg-edge-related-to-muted text-edge-related-to')
  })

  it('falls back to defaults for unknown types', () => {
    const unknown = 'mystery' as RelationType
    expect(getEdgeStrokeColor(unknown)).toBe('oklch(var(--edge-related-to))')
    expect(getEdgeBgClass(unknown)).toBe('bg-edge-related-to-muted')
    expect(getEdgeBgLightClass(unknown)).toBe('bg-edge-related-to/15')
    expect(getEdgeBgMediumClass(unknown)).toBe('bg-edge-related-to/25')
    expect(getEdgeTextClass(unknown)).toBe('text-edge-related-to')
    expect(getEdgeBadgeClass(unknown)).toBe('bg-edge-related-to-muted text-edge-related-to')
  })
})
