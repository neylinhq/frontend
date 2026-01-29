import { describe, expect, it, vi } from 'vitest'
import { getMeta } from '..'

describe('getMeta', () => {
  it('returns meta tags for English', () => {
    document.documentElement.lang = 'en'
    const meta = getMeta('home')
    expect(meta[0]).toEqual({ title: 'Home | neylin' })
    expect(meta[1]).toEqual({ name: 'description', content: 'Knowledge management platform' })
  })

  it('returns meta tags for Russian', () => {
    document.documentElement.lang = 'ru'
    const meta = getMeta('signIn')
    expect(meta[0].title).toContain('neylin')
    expect(meta[1].content).toBeTruthy()
  })

  it('falls back to English for unsupported language', () => {
    document.documentElement.lang = 'fr'
    const meta = getMeta('home')
    expect(meta[0]).toEqual({ title: 'Home | neylin' })
  })

  it('falls back to English when document is missing', () => {
    vi.stubGlobal('document', undefined)
    const meta = getMeta('home')
    expect(meta[0]).toEqual({ title: 'Home | neylin' })
    vi.unstubAllGlobals()
  })
})
