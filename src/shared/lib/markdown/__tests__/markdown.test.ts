import { describe, expect, it } from 'vitest'
import { markdownToPlainText } from '..'

describe('markdownToPlainText', () => {
  it('strips markdown syntax', () => {
    const input = '# Title\n**Bold** _Italic_ `Code`\n- Item 1\n[Link](https://example.com)'
    expect(markdownToPlainText(input)).toBe('Title Bold Italic Code Item 1 Link')
  })

  it('truncates long text on word boundaries', () => {
    const longText = 'Word '.repeat(60)
    const result = markdownToPlainText(longText, 40)
    expect(result.endsWith('...')).toBe(true)
    expect(result.length).toBeLessThanOrEqual(43)
  })
})
