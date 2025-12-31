import { describe, expect, it } from 'vitest'
import {
  getPartialType,
  getTypeSuggestions,
  hasTypePrefix,
  parseQuickInput
} from '../lib/parse-quick-input'

describe('parseQuickInput', () => {
  it('parses label and type suffix', () => {
    expect(parseQuickInput('Albert Einstein /person')).toEqual({
      label: 'Albert Einstein',
      type: 'person'
    })
  })

  it('falls back to default type', () => {
    expect(parseQuickInput('Quantum mechanics')).toEqual({
      label: 'Quantum mechanics',
      type: 'concept'
    })
  })
})

describe('quick input helpers', () => {
  it('detects type prefix', () => {
    expect(hasTypePrefix('Topic /')).toBe(true)
    expect(hasTypePrefix('Topic')).toBe(false)
  })

  it('extracts partial type', () => {
    expect(getPartialType('Topic /q')).toBe('q')
    expect(getPartialType('Topic')).toBeNull()
  })

  it('returns type suggestions', () => {
    const suggestions = getTypeSuggestions('q')
    expect(suggestions).toContain('question')
  })
})
