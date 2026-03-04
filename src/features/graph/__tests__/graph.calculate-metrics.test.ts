import { describe, expect, it } from 'vitest'

import { calculateDensity, calculateGraphCenter } from '../lib/calculate-metrics'

describe('calculateDensity', () => {
  it('returns 0 for small graphs', () => {
    expect(calculateDensity(1, 0)).toBe(0)
  })

  it('calculates density percentage', () => {
    expect(calculateDensity(4, 3)).toBe(50)
  })
})

describe('calculateGraphCenter', () => {
  it('returns origin for empty graph', () => {
    expect(calculateGraphCenter([])).toEqual({ x: 0, y: 0 })
  })

  it('averages node positions', () => {
    const nodes = [
      { id: '1', position: { x: 0, y: 0 } },
      { id: '2', position: { x: 10, y: 20 } }
    ] as Array<{ id: string; position: { x: number; y: number } }>
    expect(calculateGraphCenter(nodes)).toEqual({ x: 5, y: 10 })
  })
})
