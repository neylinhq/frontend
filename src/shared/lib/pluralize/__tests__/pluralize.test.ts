import { describe, expect, it } from 'vitest'
import { createLocalizedPluralizer, pluralize } from '..'

describe('pluralize', () => {
  it('handles English pluralization', () => {
    expect(pluralize(1, { one: 'item', other: 'items' }, 'en')).toBe('1 item')
    expect(pluralize(2, { one: 'item', other: 'items' }, 'en')).toBe('2 items')
  })

  it('handles Russian plural categories', () => {
    const forms = { one: 'one', few: 'few', many: 'many' }
    expect(pluralize(1, forms, 'ru')).toBe('1 one')
    expect(pluralize(2, forms, 'ru')).toBe('2 few')
    expect(pluralize(5, forms, 'ru')).toBe('5 many')
  })
})

describe('createLocalizedPluralizer', () => {
  it('falls back to the configured locale', () => {
    const pluralizer = createLocalizedPluralizer({ en: { one: 'item', other: 'items' } }, 'en')
    expect(pluralizer(3, 'fr')).toBe('3 items')
  })
})
