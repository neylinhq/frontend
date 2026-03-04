import { describe, expect, it } from 'vitest'

import { cn } from '..'

describe('cn', () => {
  it('merges class names and removes conflicts', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('ignores falsy values', () => {
    expect(cn('text-sm', false && 'hidden')).toBe('text-sm')
  })
})
