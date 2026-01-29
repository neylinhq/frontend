import { describe, expect, it } from 'vitest'
import { createLocalizedPluralizer, createPluralizer, pluralize } from '..'

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

  it('handles extended plural categories and caches rules', () => {
    const forms = {
      zero: 'zero',
      one: 'one',
      two: 'two',
      few: 'few',
      many: 'many',
      other: 'other'
    }
    expect(pluralize(0, forms, 'ar')).toBe('0 zero')
    expect(pluralize(2, forms, 'ar')).toBe('2 two')
    expect(pluralize(3, forms, 'ar')).toBe('3 few')
    expect(pluralize(11, forms, 'ar')).toBe('11 many')
    expect(pluralize(100, forms, 'ar')).toBe('100 other')
    expect(pluralize(1, forms, 'ar')).toBe('1 one')
  })

  it('falls back when specific forms are missing', () => {
    const forms = { one: 'one', many: 'many' }
    expect(pluralize(0, forms, 'ar')).toBe('0 many')
    expect(pluralize(2, forms, 'ar')).toBe('2 one')
    expect(pluralize(100, forms, 'ar')).toBe('100 many')
  })

  it('falls back to available forms for other categories', () => {
    const minimal = { one: 'one', other: 'other' }
    expect(pluralize(0, minimal, 'ar')).toBe('0 other')
    expect(pluralize(3, minimal, 'ar')).toBe('3 other')
    expect(pluralize(11, minimal, 'ar')).toBe('11 other')

    const noOther = { one: 'one', many: 'many' }
    expect(pluralize(2, noOther, 'en')).toBe('2 many')
  })

  it('falls back to "one" when other forms are missing', () => {
    const onlyOne = { one: 'one' }
    expect(pluralize(0, onlyOne, 'ar')).toBe('0 one')
    expect(pluralize(3, onlyOne, 'ar')).toBe('3 one')
    expect(pluralize(11, onlyOne, 'ar')).toBe('11 one')
    expect(pluralize(2, onlyOne, 'en')).toBe('2 one')
  })
})

describe('createLocalizedPluralizer', () => {
  it('falls back to the configured locale', () => {
    const pluralizer = createLocalizedPluralizer({ en: { one: 'item', other: 'items' } }, 'en')
    expect(pluralizer(3, 'fr')).toBe('3 items')
  })

  it('returns just the count when no forms are found', () => {
    const pluralizer = createLocalizedPluralizer({}, 'en')
    expect(pluralizer(3, 'fr')).toBe('3')
    expect(pluralizer(3, 'fr', false)).toBe('')
  })
})

describe('createPluralizer', () => {
  it('can omit the count in output', () => {
    const pluralizer = createPluralizer({ one: 'item', other: 'items' })
    expect(pluralizer(1, 'en', false)).toBe('item')
  })
})
