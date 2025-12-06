import { describe, expect, it } from 'vitest'

describe('Smoke tests', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true)
  })

  it('should perform basic arithmetic', () => {
    expect(1 + 1).toBe(2)
  })
})
