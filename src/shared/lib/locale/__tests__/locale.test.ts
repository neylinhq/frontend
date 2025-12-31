import { describe, expect, it } from 'vitest'
import { getLocale } from '..'

describe('getLocale', () => {
  it('returns locale from cookie when supported', () => {
    const request = new Request('http://localhost', {
      headers: {
        Cookie: 'i18nextLng=ru'
      }
    })

    expect(getLocale(request)).toBe('ru')
  })

  it('falls back to default when unsupported', () => {
    const request = new Request('http://localhost', {
      headers: {
        Cookie: 'i18nextLng=es'
      }
    })

    expect(getLocale(request)).toBe('en')
  })
})
