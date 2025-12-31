import { describe, expect, it } from 'vitest'
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
})
