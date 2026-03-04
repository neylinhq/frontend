import { describe, expect, it } from 'vitest'

import { getNodeConfig, getNodeIcon } from '../lib/node-type-utils'

describe('node type utils', () => {
  it('returns node config for a type', () => {
    const config = getNodeConfig('concept')
    expect(config?.type).toBe('concept')
    expect(config?.labelKey).toBe('nodeTypes.concept')
  })

  it('returns icon for a node type', () => {
    const icon = getNodeIcon('concept')
    expect(icon).toBeDefined()
  })
})
