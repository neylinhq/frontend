import { describe, expect, it } from 'vitest'

import { NODE_TYPE_CONFIGS } from '../node.constants'

describe('NODE_TYPE_CONFIGS', () => {
  it('contains configs for all node types', () => {
    const types = NODE_TYPE_CONFIGS.map(config => config.type)
    expect(types).toEqual([
      'concept',
      'fact',
      'theory',
      'example',
      'question',
      'hypothesis',
      'person',
      'school'
    ])
  })

  it('defines translation keys', () => {
    const labels = NODE_TYPE_CONFIGS.map(config => config.labelKey)
    expect(labels).toContain('nodeTypes.concept')
  })
})
