import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { describe, expect, it, vi } from 'vitest'

import { livePreview } from '../lib/live-preview'

describe('note editor live preview', () => {
  it('returns plugin and styles', () => {
    const extensions = livePreview()
    expect(extensions).toHaveLength(2)
  })

  it('builds decorations and reacts to selection changes', () => {
    const doc = [
      '# H1',
      'Some **bold** and *italic* and ~~strike~~ and `code`.',
      '[link](https://example.com)',
      '> quote',
      '',
      '- item',
      '- [ ] task',
      '- [x] done',
      '1. ordered',
      '',
      '[[Wiki Link]] and ==highlight== and #tag',
      '`[[ignored]]` `==ignored==` `code #ignored`',
      '<https://example.com>',
      '',
      '```js',
      'const x = 1',
      '```'
    ].join('\n')

    const wikiStart = doc.indexOf('[[Wiki Link]]')
    const wikiEnd = wikiStart + '[[Wiki Link]]'.length
    const [plugin, styles] = livePreview()
    const state = EditorState.create({
      doc,
      selection: { anchor: wikiStart, head: wikiEnd },
      extensions: [markdown({ base: markdownLanguage, codeLanguages: languages }), plugin, styles]
    })
    const parent = document.createElement('div')
    const view = new EditorView({ state, parent })

    expect(view.dom.querySelector('.cm-heading-1')).toBeTruthy()
    expect(view.dom.querySelector('.cm-wikilink')).toBeTruthy()
    expect(view.dom.querySelector('.cm-tag')).toBeTruthy()

    Object.defineProperty(view, 'visibleRanges', {
      configurable: true,
      get: () => []
    })
    view.dispatch({ selection: { anchor: view.state.doc.length } })

    const boxes = Array.from(view.dom.querySelectorAll<HTMLInputElement>('.cm-task-checkbox'))
    expect(boxes.length).toBeGreaterThan(0)
    boxes.forEach(box => {
      box.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    })

    view.dispatch({ selection: { anchor: 0 } })
    view.dispatch({ changes: { from: 0, to: 0, insert: ' ' } })

    view.destroy()
  })

  it('skips updates when task checkbox state does not match text', () => {
    const doc = '- [ ] task'
    const [plugin, styles] = livePreview()
    const state = EditorState.create({
      doc,
      extensions: [markdown({ base: markdownLanguage, codeLanguages: languages }), plugin, styles]
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

  it('exposes list bullet widget behavior', () => {
    const doc = '- item'
    const [plugin, styles] = livePreview()
    const state = EditorState.create({
      doc,
      extensions: [markdown({ base: markdownLanguage, codeLanguages: languages }), plugin, styles]
    })
    const parent = document.createElement('div')
    const view = new EditorView({ state, parent })

    Object.defineProperty(view, 'visibleRanges', {
      configurable: true,
      get: () => []
    })
    view.dispatch({ selection: { anchor: view.state.doc.length } })

    const pluginInstance = view.plugin(plugin)
    const widgets: Array<{ eq?: (other: unknown) => boolean; ignoreEvent?: () => boolean }> = []
    pluginInstance?.decorations.between(0, view.state.doc.length, (_from, _to, value) => {
      if (value.spec.widget) {
        widgets.push(value.spec.widget)
      }
    })

    expect(widgets.length).toBeGreaterThan(0)
    const widget = widgets[0]
    expect(widget.ignoreEvent?.()).toBe(false)
    expect(widget.eq?.(widget)).toBe(true)

    view.destroy()
  })

  it('decorates tags, code info, and rebuilds on selection updates', () => {
    const doc = [
      '#root',
      'Text #tag',
      '',
      '```js',
      'const x = 1',
      '```',
      '',
      '```   ',
      'const y = 2',
      '```'
    ].join('\n')
    const [plugin, styles] = livePreview()
    const state = EditorState.create({
      doc,
      extensions: [markdown({ base: markdownLanguage, codeLanguages: languages }), plugin, styles]
    })
    const parent = document.createElement('div')
    const trimSpy = vi.spyOn(String.prototype, 'trim').mockImplementationOnce(() => '')
    const view = new EditorView({ state, parent })

    const pluginInstance = view.plugin(plugin)
    expect(pluginInstance).toBeTruthy()

    const rootLine = view.state.doc.line(1)
    const tagLine = view.state.doc.line(2)
    const expectedRootStart = rootLine.from + rootLine.text.indexOf('#root')
    const expectedTagStart = tagLine.from + tagLine.text.indexOf('#tag')
    let foundTag = false
    let foundRootTag = false
    let foundLanguage = false
    let languageDecorations = 0

    pluginInstance?.decorations.between(0, view.state.doc.length, (from, _to, value) => {
      if (value.spec.class === 'cm-tag' && from === expectedTagStart) {
        foundTag = true
      }
      if (value.spec.class === 'cm-tag' && from === expectedRootStart) {
        foundRootTag = true
      }
      if (value.spec.attributes?.['data-language'] === 'js') {
        foundLanguage = true
        languageDecorations += 1
      }
    })

    expect(foundTag).toBe(true)
    expect(foundRootTag).toBe(true)
    expect(foundLanguage).toBe(false)
    expect(languageDecorations).toBe(0)

    Object.defineProperty(view, 'visibleRanges', {
      configurable: true,
      get: () => []
    })
    const previousDecorations = pluginInstance?.decorations
    view.dispatch({ selection: { anchor: view.state.doc.length } })
    expect(pluginInstance?.decorations).not.toBe(previousDecorations)
    ;(pluginInstance as { update?: (update: unknown) => void })?.update?.({
      docChanged: false,
      viewportChanged: false,
      selectionSet: false,
      view
    })
    trimSpy.mockRestore()

    view.destroy()
  })

  it('decorates heading levels and tracks active contexts', () => {
    const doc = ['# H1', '## H2', '### H3', '#### H4', '##### H5', '###### H6'].join('\n')
    const selectionPos = doc.indexOf('H4')
    const [plugin, styles] = livePreview()
    const state = EditorState.create({
      doc,
      selection: { anchor: selectionPos, head: selectionPos },
      extensions: [markdown({ base: markdownLanguage, codeLanguages: languages }), plugin, styles]
    })
    const parent = document.createElement('div')
    const view = new EditorView({ state, parent })

    expect(view.dom.querySelector('.cm-heading-2')).toBeTruthy()
    expect(view.dom.querySelector('.cm-heading-3')).toBeTruthy()
    expect(view.dom.querySelector('.cm-heading-4')).toBeTruthy()
    expect(view.dom.querySelector('.cm-heading-5')).toBeTruthy()
    expect(view.dom.querySelector('.cm-heading-6')).toBeTruthy()

    view.destroy()
  })
})
