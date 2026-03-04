import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/graph-webgl/lib/theme-bridge', () => ({
  cssVarToHex: vi.fn((name: string) => (name === 'confidence-high' ? '#111111' : '#222222'))
}))

import {
  getEdgeDashArray,
  getEdgeOpacity,
  getEdgeStroke,
  getEdgeStrokeByType,
  getEdgeWidth
} from '../lib/get-edge-style'

describe('edge style helpers', () => {
  it('returns stroke based on relation type', () => {
    expect(getEdgeStrokeByType('causes')).toContain('--edge-causes')
  })

  it('returns stroke based on confidence', () => {
    expect(getEdgeStroke(0.8)).toBe('#111111')
    expect(getEdgeStroke(0.4)).toBe('#222222')
  })

  it('calculates edge width and dash array', () => {
    expect(getEdgeWidth(0)).toBe(1)
    expect(getEdgeDashArray(0.4)).toBe('5,5')
    expect(getEdgeDashArray(0.7)).toBeUndefined()
    expect(getEdgeDashArray(undefined)).toBeUndefined()
  })

  it('returns opacity by selection state', () => {
    expect(getEdgeOpacity(true)).toBe(1)
    expect(getEdgeOpacity(false)).toBe(0.7)
  })
})
