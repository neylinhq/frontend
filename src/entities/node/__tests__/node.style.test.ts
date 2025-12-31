import { describe, expect, it } from 'vitest'
import {
  getComplexityColor,
  getNodeBgColor,
  getNodeBorderColor,
  getNodeTextColor,
  getRatingBorderColor,
  getRatingColor
} from '../lib/node-style'

describe('node style helpers', () => {
  it('returns node-specific classes', () => {
    expect(getNodeBorderColor('concept')).toBe('border-l-node-concept')
    expect(getNodeBgColor('concept')).toBe('bg-node-concept-muted/40')
    expect(getNodeTextColor('concept')).toBe('text-node-concept')
  })

  it('returns complexity classes', () => {
    expect(getComplexityColor('basic')).toBe('bg-complexity-basic-bg text-complexity-basic')
    expect(getComplexityColor(undefined)).toBe('')
  })

  it('passes through rating color helpers', () => {
    expect(getRatingColor(null)).toBe('bg-muted text-muted-foreground')
    expect(getRatingBorderColor(null)).toBe('border-border')
  })
})
