import { describe, expect, it } from 'vitest'
import { livePreview } from '../lib/live-preview'

describe('note editor live preview', () => {
  it('returns plugin and styles', () => {
    const extensions = livePreview()
    expect(extensions).toHaveLength(2)
  })
})
