import { describe, expect, it } from 'vitest'

import {
  getComplexityColor,
  getNodeBgColor,
  getNodeBorderColor,
  getNodeTextColor,
  getRatingBorderColor,
  getRatingColor
} from '../lib/node-style'
import type { NodeType } from '../node.schema'

describe('node style helpers', () => {
  it('returns node-specific classes', () => {
    expect(getNodeBorderColor('concept')).toBe('border-l-node-concept')
    expect(getNodeBgColor('concept')).toBe('bg-node-concept-muted/40')
    expect(getNodeTextColor('concept')).toBe('text-node-concept')
  })

  it('returns complexity classes', () => {
    expect(getComplexityColor('basic')).toBe('bg-complexity-basic-bg text-complexity-basic')
    expect(getComplexityColor('intermediate')).toBe(
      'bg-complexity-intermediate-bg text-complexity-intermediate'
    )
    expect(getComplexityColor('advanced')).toBe(
      'bg-complexity-advanced-bg text-complexity-advanced'
    )
    expect(getComplexityColor(undefined)).toBe('')
  })

  it('passes through rating color helpers', () => {
    expect(getRatingColor(null)).toBe('bg-muted text-muted-foreground')
    expect(getRatingBorderColor(null)).toBe('border-border')
  })

  it('falls back to neutral colors for unknown types', () => {
    const unknown = 'mystery' as NodeType
    expect(getNodeBorderColor(unknown)).toBe('border-l-semantic-neutral')
    expect(getNodeBgColor(unknown)).toBe('bg-semantic-neutral-muted/40')
    expect(getNodeTextColor(unknown)).toBe('text-muted-foreground')
  })
})
