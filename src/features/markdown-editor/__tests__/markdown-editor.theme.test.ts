import { describe, expect, it } from 'vitest'

import { theme } from '../lib/theme'

describe('markdown editor theme', () => {
  it('exports theme extensions', () => {
    expect(theme.length).toBeGreaterThan(0)
  })
})
