import { describe, expect, it } from 'vitest'
import { sanitizeHtml } from '..'

describe('sanitizeHtml', () => {
  it('removes script tags', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>'
    expect(sanitizeHtml(dirty)).toBe('<p>Hello</p>')
  })

  it('removes onclick handlers', () => {
    const dirty = '<p onclick="alert(1)">Click</p>'
    expect(sanitizeHtml(dirty)).toBe('<p>Click</p>')
  })

  it('allows safe tags', () => {
    const clean = '<p><strong>Bold</strong> and <em>italic</em></p>'
    expect(sanitizeHtml(clean)).toBe(clean)
  })

  it('removes javascript: URLs', () => {
    const dirty = '<a href="javascript:alert(1)">Click</a>'
    expect(sanitizeHtml(dirty)).not.toContain('javascript:')
  })

  it('preserves allowed attributes', () => {
    const html = '<a href="https://example.com" target="_blank" class="link">Link</a>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('removes dangerous attributes', () => {
    const dirty = '<div onmouseover="alert(1)" style="color:red">Content</div>'
    expect(sanitizeHtml(dirty)).toBe('<div>Content</div>')
  })

  it('handles nested tags', () => {
    const html = '<ul><li><strong>Item 1</strong></li><li>Item 2</li></ul>'
    expect(sanitizeHtml(html)).toBe(html)
  })

  it('removes iframe tags', () => {
    const dirty = '<p>Text</p><iframe src="evil.com"></iframe>'
    expect(sanitizeHtml(dirty)).toBe('<p>Text</p>')
  })
})
