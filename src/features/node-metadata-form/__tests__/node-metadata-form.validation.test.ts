import { describe, expect, it } from 'vitest'

import { nodeMetadataFormSchema } from '../lib/validation'

describe('nodeMetadataFormSchema', () => {
  it('accepts valid metadata input', () => {
    const result = nodeMetadataFormSchema.parse({
      label: 'Node label',
      type: 'concept',
      tags: ['tag-1']
    })

    expect(result.label).toBe('Node label')
  })

  it('rejects empty labels', () => {
    expect(() =>
      nodeMetadataFormSchema.parse({
        label: '',
        type: 'concept'
      })
    ).toThrow()
  })
})
