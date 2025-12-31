import { Atom01Icon } from '@untitledui/icons-react/outline'
import { describe, expect, it } from 'vitest'
import { getNodeIcon } from '../lib/node-icon'

describe('getNodeIcon', () => {
  it('returns the icon for a node type', () => {
    expect(getNodeIcon('concept')).toBe(Atom01Icon)
  })
})
