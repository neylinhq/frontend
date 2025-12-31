import { describe, expect, it } from 'vitest'
import { constrainToViewport, detectCollisions, getViewportBounds } from '..'

describe('viewport utilities', () => {
  it('returns current viewport bounds', () => {
    Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
    Object.defineProperty(window, 'scrollX', { value: 10, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 20, configurable: true })

    expect(getViewportBounds()).toEqual({
      width: 1200,
      height: 800,
      scrollX: 10,
      scrollY: 20
    })
  })

  it('detects collisions', () => {
    const viewport = { width: 100, height: 100, scrollX: 0, scrollY: 0 }
    const result = detectCollisions({ x: -5, y: 10, width: 50, height: 120 }, viewport)
    expect(result).toEqual({ top: true, right: false, bottom: true, left: true })
  })

  it('constrains positions within bounds', () => {
    const viewport = { width: 200, height: 200, scrollX: 0, scrollY: 0 }
    const result = constrainToViewport({ x: 500, y: -20 }, { width: 50, height: 50 }, viewport, 10)
    expect(result).toEqual({ x: 140, y: 10 })
  })
})
