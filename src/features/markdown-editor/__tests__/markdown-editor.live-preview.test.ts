import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { describe, expect, it, vi } from 'vitest'
import { livePreview } from '../lib/live-preview'

describe('markdown editor live preview', () => {
  it('returns plugin and styles', () => {
    const extensions = livePreview()
    expect(extensions).toHaveLength(2)
  })

  it('builds decorations for markdown syntax', () => {
    const doc = [
      '# H1',
      '## H2',
      '### H3',
      '#### H4',
      '##### H5',
      '###### H6',
      '',
      '**bold**',
      '*italic*',
      '~~strike~~',
      '`code`',
      '[link](https://example.com)',
      '> quote',
      '- item',
      '- [ ] task',
      '- [x] done',
      '',
      '```js',
      'const a = 1',
      '```'
    ].join('\n')

    const [plugin, styles] = livePreview()
    const state = EditorState.create({
      doc,
      extensions: [
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        plugin,
        styles
      ]
    })
    const parent = document.createElement('div')
    const view = new EditorView({ state, parent })

    expect(view.dom.querySelector('.cm-heading-1')).toBeTruthy()
    expect(view.dom.querySelector('.cm-task-checkbox')).toBeTruthy()

    const boxes = Array.from(
      view.dom.querySelectorAll<HTMLInputElement>('.cm-task-checkbox')
    )
    const beforeText = view.state.doc.toString()
    boxes.forEach((box) => {
      box.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })
    const afterText = view.state.doc.toString()

    expect(afterText).not.toBe(beforeText)
    expect(afterText).toContain('[x] task')
    expect(afterText).toContain('[ ] done')

    view.dispatch({ selection: { anchor: 0 } })
    view.dispatch({ changes: { from: 0, to: 0, insert: ' ' } })

    view.destroy()
  })

  it('skips updates when checkbox text does not match widget state', () => {
    const doc = '- [ ] task'
    const [plugin, styles] = livePreview()
    const state = EditorState.create({
      doc,
      extensions: [
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        plugin,
        styles
      ]
    })
    const parent = document.createElement('div')
    const view = new EditorView({ state, parent })

    Object.defineProperty(view, 'visibleRanges', {
      configurable: true,
      get: () => []
    })
    view.dispatch({ selection: { anchor: view.state.doc.length } })

    const replaceSpy = vi.spyOn(String.prototype, 'replace').mockImplementation(function () {
      return String(this)
    })
    const before = view.state.doc.toString()
    view.dom
      .querySelector<HTMLInputElement>('.cm-task-checkbox')
      ?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(view.state.doc.toString()).toBe(before)
    replaceSpy.mockRestore()

    view.destroy()
  })
})
