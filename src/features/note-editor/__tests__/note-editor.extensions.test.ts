import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { describe, expect, it, vi } from 'vitest'
import { createExtensions } from '../lib/extensions'

describe('note editor extensions', () => {
  it('adds placeholder and change listener extensions', () => {
    const base = createExtensions({})
    const withExtras = createExtensions({ placeholder: 'Type', onChange: () => undefined })
    expect(withExtras.length).toBeGreaterThan(base.length)
  })

  it('invokes onChange when document updates', () => {
    const onChange = vi.fn()
    const state = EditorState.create({
      doc: 'hello',
      extensions: createExtensions({ onChange })
    })
    const parent = document.createElement('div')
    const view = new EditorView({ state, parent })

    view.dispatch({ changes: { from: 0, to: 5, insert: 'hi' } })

    expect(onChange).toHaveBeenCalledWith('hi')
    view.destroy()
  })

  it('does not invoke onChange when document is unchanged', () => {
    const onChange = vi.fn()
    const state = EditorState.create({
      doc: 'hello',
      extensions: createExtensions({ onChange })
    })
    const parent = document.createElement('div')
    const view = new EditorView({ state, parent })

    view.dispatch({ selection: { anchor: 0 } })

    expect(onChange).not.toHaveBeenCalled()
    view.destroy()
  })
})
