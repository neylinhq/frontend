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

  it('uses provided default type for unknown suffix', () => {
    expect(parseQuickInput('Topic /unknown', 'fact')).toEqual({
      label: 'Topic',
      type: 'fact'
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

  it('returns all suggestions for empty query', () => {
    const suggestions = getTypeSuggestions('')
    expect(suggestions).toContain('concept')
    expect(new Set(suggestions).size).toBe(suggestions.length)
  })

  it('returns empty suggestions when no matches', () => {
    expect(getTypeSuggestions('zz')).toEqual([])
  })
})
